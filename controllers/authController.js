// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { generateOTP, getOTPExpiry } = require('../utils/otpUtils');
const { sendOTP } = require('../utils/emailService');

const OTP_CONFIG = {
    requireOTP: false  
};

// Initial login for web admin
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Web login attempt:', { username });

        // Get admin user from petugas table
        const result = await pool.query(
            'SELECT * FROM petugas WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = result.rows[0];

        // For debugging
        console.log('Found user:', {
            id: user.id,
            username: user.username,
            hashedPassword: user.password?.substring(0, 10) + '...'
        });

        // Check if password exists and is in correct format
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'Account not properly configured'
            });
        }

        let validPassword;
        
        // Handle both hashed and plain text passwords
        if (user.password.startsWith('$2')) {
            validPassword = await bcrypt.compare(password, user.password);
        } else {
            validPassword = password === user.password;
        }

        if (!validPassword) {
            console.log('Password validation failed');
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check OTP_CONFIG flag
        if (OTP_CONFIG.requireOTP) {
            // OTP flow
            const otp = generateOTP();
            const otpExpiry = getOTPExpiry();

            await pool.query(
                'UPDATE petugas SET otp = $1, otp_expires_at = $2 WHERE id = $3',
                [otp, otpExpiry, user.id]
            );

            if (user.email) {
                const emailSent = await sendOTP(user.email, otp);
                if (!emailSent) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to send OTP email'
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'No email associated with this account'
                });
            }

            return res.json({
                success: true,
                requiresOTP: true,
                message: 'OTP has been sent to your email'
            });
        } else {
            // Direct login without OTP
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username,
                    type: 'web_admin',
                    role: 'admin',
                    exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours from now
                },
                process.env.JWT_SECRET
            );

            return res.json({
                success: true,
                requiresOTP: false,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    type: 'web_admin'
                }
            });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    const { username, otp } = req.body;

    try {
        // Get user with OTP
        const result = await pool.query(
            'SELECT * FROM petugas WHERE username = $1 AND otp = $2',
            [username, otp]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid OTP' 
            });
        }

        const user = result.rows[0];

        // Check OTP expiration
        if (user.otp_expires_at && new Date() > new Date(user.otp_expires_at)) {
            return res.status(401).json({ 
                success: false,
                message: 'OTP has expired' 
            });
        }

        // Clear OTP after successful verification
        await pool.query(
            'UPDATE petugas SET otp = NULL, otp_expires_at = NULL WHERE id = $1',
            [user.id]
        );

        // Generate JWT after successful OTP verification
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                type: 'web_admin',
                role: 'admin',
                exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours from now
            },
            process.env.JWT_SECRET
        );

        res.json({ 
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                type: 'web_admin'
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during OTP verification' 
        });
    }
};

module.exports = {
    login,
    verifyOTP
};
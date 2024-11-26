// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Web login attempt:', { username });

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

        let validPassword;
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

        // Generate token with 2 hours expiry
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                type: 'web_admin',
                exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours
            },
            process.env.JWT_SECRET
        );

        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                type: 'web_admin'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

module.exports = {
    login
};
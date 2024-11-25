const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Mobile app authentication
const mobileLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Mobile login attempt:', { username });

        // First check if user exists
        const userResult = await pool.query(
            'SELECT * FROM profile WHERE username = $1',
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Username atau password salah' 
            });
        }

        const user = userResult.rows[0];

        // Check if account is active
        if (!user.status) {
            return res.json({
                success: false,
                message: 'Akun di non-aktifkan',
                is_active: false
            });
        }

        // For first-time login, check against default password
        if (user.is_first_login) {
            if (password !== 'sekolah!123') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Username atau password salah' 
                });
            }

            // Generate token with password change requirement
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username,
                    type: 'mobile_user',
                    requirePasswordChange: true 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                    profile_image: user.profile_image,
                    requirePasswordChange: true,
                    isFirstLogin: true
                },
                is_active: true,
                user_id: user.id,
                require_password_change: true
            });
        }

        // For subsequent logins, verify password hash
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Username atau password salah' 
            });
        }

        // Update last login time
        await pool.query(
            'UPDATE profile SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Generate normal token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                type: 'mobile_user',
                requirePasswordChange: false
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                profile_image: user.profile_image,
                requirePasswordChange: false,
                isFirstLogin: false
            },
            is_active: true,
            user_id: user.id,
            require_password_change: false
        });

    } catch (error) {
        console.error('Mobile login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error during login',
            error: error.message 
        });
    }
};

// Change password on first login
const changeFirstPassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { newPassword } = req.body;

        console.log('Change password attempt for user:', id);

        // Get user data
        const userResult = await pool.query(
            'SELECT * FROM profile WHERE id = $1 AND status = true',
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'User tidak ditemukan' 
            });
        }

        const user = userResult.rows[0];

        // Ensure user is in first login state
        if (!user.is_first_login) {
            return res.status(400).json({ 
                success: false,
                message: 'Password hanya dapat diubah melalui alur normal' 
            });
        }

        // Password validation
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Password baru harus minimal 6 karakter' 
            });
        }

        if (newPassword === 'sekolah!123') {
            return res.status(400).json({ 
                success: false,
                message: 'Password tidak boleh sama dengan password default' 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and first login status
        await pool.query(
            `UPDATE profile 
             SET password = $1, 
                 is_first_login = false,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [hashedPassword, id]
        );

        // Generate new token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                type: 'mobile_user',
                requirePasswordChange: false
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Password changed successfully for user:', id);

        res.json({ 
            success: true,
            message: 'Password berhasil diubah',
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                profile_image: user.profile_image,
                requirePasswordChange: false
            }
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengubah password',
            error: error.message 
        });
    }
};

// Get user profile
const getMobileProfile = async (req, res) => {
    try {
        const { id } = req.user;
        
        const result = await pool.query(
            'SELECT id, username, full_name, email, profile_image FROM profile WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

module.exports = {
    mobileLogin,
    changeFirstPassword,
    getMobileProfile
}; 
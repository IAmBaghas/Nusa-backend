const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Get all profiles
const getProfiles = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                username, 
                full_name, 
                email, 
                profile_image,
                last_login,
                created_at,
                updated_at,
                main_page,
                status
            FROM profile 
            ORDER BY id ASC
        `);

        // Process profile images to include proper paths
        const profiles = result.rows.map(profile => ({
            ...profile,
            profile_image: profile.profile_image ? 
                `http://localhost:5000/uploads/profiles/${profile.id}/${profile.profile_image.split('/').pop()}` : 
                null
        }));

        res.json(profiles);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ message: 'Error fetching profiles' });
    }
};

// Create new profile
const createProfile = async (req, res) => {
    try {
        const { username, full_name, email } = req.body;

        // Validate input
        if (!username || !full_name || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if username already exists
        const existingUser = await pool.query(
            'SELECT id FROM profile WHERE username = $1',
            [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if email already exists
        const existingEmail = await pool.query(
            'SELECT id FROM profile WHERE email = $1',
            [email]
        );

        if (existingEmail.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Create new profile with default values
        const result = await pool.query(
            `INSERT INTO profile (
                username, 
                password, 
                full_name, 
                email, 
                profile_image,
                is_first_login,
                main_page,
                status
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING id, username, full_name, email`,
            [
                username,
                'sekolah!123',  // default password
                full_name,
                email,
                null,           // default profile_image
                true,          // default is_first_login
                false,         // default main_page
                true           // default status
            ]
        );

        res.status(201).json({
            status: 'success',
            message: 'Profile created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ 
            message: error.message || 'Error creating profile' 
        });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, full_name, email } = req.body;

        // Validate input
        if (!username || !full_name || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if username is taken by another user
        const existingUser = await pool.query(
            'SELECT id FROM profile WHERE username = $1 AND id != $2',
            [username, id]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Update profile
        const result = await pool.query(
            `UPDATE profile 
             SET username = $1, full_name = $2, email = $3, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4 
             RETURNING id, username, full_name, email, updated_at`,
            [username, full_name, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({
            status: 'success',
            message: 'Profile updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const defaultPassword = 'sekolah!123';

        // Update password and set first login flag
        const result = await pool.query(
            `UPDATE profile 
             SET password = $1, 
                 is_first_login = true, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, username, full_name`,
            [defaultPassword, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({
            status: 'success',
            message: `Password reset successfully for ${result.rows[0].full_name}`,
            data: {
                id: result.rows[0].id,
                username: result.rows[0].username
            }
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

// Add new toggle handlers
const toggleMainPage = async (req, res) => {
    try {
        const { id } = req.params;
        const { main_page } = req.body;

        console.log('Toggling main_page:', { id, main_page }); // Debug log

        const result = await pool.query(
            `UPDATE profile 
             SET main_page = $1,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, main_page`,
            [main_page, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({
            status: 'success',
            message: 'Main page status updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating main page status:', error);
        res.status(500).json({ message: 'Error updating main page status' });
    }
};

const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log('Toggling status:', { id, status }); // Debug log

        const result = await pool.query(
            `UPDATE profile 
             SET status = $1,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, status`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({
            status: 'success',
            message: 'Status updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status' });
    }
};

module.exports = {
    getProfiles,
    createProfile,
    updateProfile,
    resetPassword,
    toggleMainPage,
    toggleStatus
}; 
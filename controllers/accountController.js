const pool = require('../config/database');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const getProfiles = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM profile ORDER BY id ASC');
        
        // Map the results to include proper profile image paths
        const profiles = result.rows.map(profile => ({
            ...profile,
            profile_image: profile.profile_image ? `profiles/${profile.id}/${profile.profile_image}` : null
        }));

        res.json(profiles);
    } catch (error) {
        console.error('Error getting profiles:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createProfile = async (req, res) => {
    try {
        const { username, full_name, email } = req.body;
        const defaultPassword = 'sekolah!123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const result = await pool.query(
            'INSERT INTO profile (username, password, full_name, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, hashedPassword, full_name, email]
        );

        // Return the new profile with proper image path
        const newProfile = {
            ...result.rows[0],
            profile_image: result.rows[0].profile_image ? 
                `http://localhost:5000/uploads/profiles/${result.rows[0].id}/${result.rows[0].profile_image}` : 
                null
        };

        res.json(newProfile);
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, full_name, email } = req.body;

        const result = await pool.query(
            'UPDATE profile SET username = $1, full_name = $2, email = $3 WHERE id = $4 RETURNING *',
            [username, full_name, email, id]
        );

        // Return updated profile with proper image path
        const updatedProfile = {
            ...result.rows[0],
            profile_image: result.rows[0].profile_image ? 
                `http://localhost:5000/uploads/profiles/${id}/${result.rows[0].profile_image}` : 
                null
        };

        res.json(updatedProfile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const defaultPassword = 'sekolah!123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await pool.query(
            'UPDATE profile SET password = $1 WHERE id = $2',
            [hashedPassword, id]
        );

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateMainPage = async (req, res) => {
    try {
        const { id } = req.params;
        const { main_page } = req.body;

        const result = await pool.query(
            'UPDATE profile SET main_page = $1 WHERE id = $2 RETURNING *',
            [main_page, id]
        );

        // Return updated profile with proper image path
        const updatedProfile = {
            ...result.rows[0],
            profile_image: result.rows[0].profile_image ? 
                `http://localhost:5000/uploads/profiles/${id}/${result.rows[0].profile_image}` : 
                null
        };

        res.json(updatedProfile);
    } catch (error) {
        console.error('Error updating main page status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            'UPDATE profile SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        // Return updated profile with proper image path
        const updatedProfile = {
            ...result.rows[0],
            profile_image: result.rows[0].profile_image ? 
                `http://localhost:5000/uploads/profiles/${id}/${result.rows[0].profile_image}` : 
                null
        };

        res.json(updatedProfile);
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProfiles,
    createProfile,
    updateProfile,
    resetPassword,
    updateMainPage,
    updateStatus
}; 
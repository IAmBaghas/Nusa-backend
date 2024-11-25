const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
    updateProfileImage, 
    deleteProfileImage, 
    searchUsers 
} = require('../controllers/profileController');
const path = require('path');
const fs = require('fs');

// Profile image routes
router.post('/image', authenticateToken, updateProfileImage);
router.delete('/image', authenticateToken, deleteProfileImage);
router.get('/search', searchUsers);

// Add a route to serve profile images
router.get('/image/:userId/:filename', (req, res) => {
    const { userId, filename } = req.params;
    const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', userId, filename);
    
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ message: 'Profile image not found' });
    }
});

module.exports = router; 
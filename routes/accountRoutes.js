const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const accountController = require('../controllers/accountController');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const profileId = req.params.id;
        const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles', profileId);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Routes
router.get('/profiles', accountController.getProfiles);
router.post('/profiles', accountController.createProfile);
router.put('/profiles/:id', accountController.updateProfile);
router.post('/profiles/:id/reset', accountController.resetPassword);
router.put('/profiles/:id/main-page', accountController.updateMainPage);
router.put('/profiles/:id/status', accountController.updateStatus);

// Add route to serve profile images
router.get('/profile-image/:userId/:filename', (req, res) => {
    const { userId, filename } = req.params;
    const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', userId, filename);
    
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ message: 'Profile image not found' });
    }
});

// Add route for profile image upload
router.post('/profiles/:id/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const profileId = req.params.id;
        const imagePath = `${profileId}/${req.file.filename}`;

        await pool.query(
            'UPDATE profile SET profile_image = $1 WHERE id = $2',
            [imagePath, profileId]
        );

        res.json({ 
            success: true, 
            path: imagePath
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 
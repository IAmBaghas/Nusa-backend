const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    getAllPosts,
    updatePostStatus,
    deletePostPermanently
} = require('../controllers/siswaPManagementController');

// Configure multer for post image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user?.id || 'default';
        const date = new Date();
        const dateFolder = `${date.getDate()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;
        const uploadDir = path.join('uploads', 'postSiswa', userId.toString(), dateFolder);
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
router.get('/posts', getAllPosts);
router.put('/posts/:id/status', updatePostStatus);
router.delete('/posts/:id', deletePostPermanently);

// Add this route to serve profile images
router.get('/profile-image/:userId/:filename', (req, res) => {
    const { userId, filename } = req.params;
    const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', userId, filename);
    
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ message: 'Profile image not found' });
    }
});

// Add this route to serve post images
router.get('/post-image/:userId/:dateFolder/:filename', (req, res) => {
    const { userId, dateFolder, filename } = req.params;
    const imagePath = path.join(__dirname, '..', 'uploads', 'postSiswa', userId, dateFolder, filename);
    
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ message: 'Post image not found' });
    }
});

module.exports = router; 
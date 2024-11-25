const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
    createGallery, 
    getGalleries, 
    updateGallery,
    addImagesToGallery,
    deleteGallery, 
    deleteImage,
    upload,
    getGalleryStats
} = require('../controllers/galleryController');

// Public routes
router.get('/', getGalleries);

// Protected routes
router.post('/', authenticateToken, upload.array('images', 10), createGallery);
router.put('/:id', authenticateToken, updateGallery);
router.post('/:id/images', authenticateToken, upload.array('images', 10), addImagesToGallery);
router.delete('/:id', authenticateToken, deleteGallery);
router.delete('/image/:id', authenticateToken, deleteImage);
router.get('/stats', getGalleryStats);

module.exports = router; 
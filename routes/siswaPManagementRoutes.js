const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getAllPosts,
    updatePostStatus,
    deletePostPermanently
} = require('../controllers/siswaPManagementController');

// All routes require authentication
router.use(authenticateToken);

// Get all posts
router.get('/posts', getAllPosts);

// Update post status (archive)
router.put('/posts/:id/status', updatePostStatus);

// Add permanent delete route
router.delete('/posts/:id', authenticateToken, deletePostPermanently);

module.exports = router; 
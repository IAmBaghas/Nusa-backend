const express = require('express');
const router = express.Router();
const mPostsController = require('../controllers/mPostsController');

// Mobile endpoints
router.get('/', mPostsController.getMobilePosts);
router.get('/latest', mPostsController.getLatestPosts);
router.get('/:id', mPostsController.getMobilePostById);

module.exports = router; 
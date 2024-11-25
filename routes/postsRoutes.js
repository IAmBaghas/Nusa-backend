const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

// Web endpoints only
router.get('/web', postsController.getWebPosts);
router.get('/test', postsController.testEndpoint);
router.get('/available-galleries', postsController.getAvailableGalleries);
router.post('/', postsController.createPost);
router.put('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);
router.get('/:id', postsController.getPostById);

module.exports = router; 
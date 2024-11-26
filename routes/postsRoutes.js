const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const postsController = require('../controllers/postsController');

// Special routes should come before generic ID-based routes
router.get('/all-comments', postsController.getAllComments);
router.get('/web', postsController.getWebPosts);
router.get('/test', postsController.testEndpoint);
router.get('/available-galleries', postsController.getAvailableGalleries);

// Generic ID-based routes come after
router.get('/:postId/likes', postsController.getLikesCount);
router.post('/:postId/like', postsController.addLike);
router.delete('/:postId/like', postsController.removeLike);
router.post('/:postId/comment', postsController.addComment);
router.get('/:postId/comments', postsController.getComments);
router.get('/:postId/hasLiked', postsController.hasUserLiked);

// CRUD operations
router.post('/', postsController.createPost);
router.get('/:id', postsController.getPostById);
router.put('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

// Comment Delete
router.delete('/comments/:commentId', postsController.deleteComment);

module.exports = router; 
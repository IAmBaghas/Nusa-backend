const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
    createPost,
    getPostsByProfile,
    getAllPosts,
    deletePost,
    likePost,
    checkLike,
    getLikeCount,
    getMainPagePosts,
    getPostComments,
    createPostComment,
    deletePostComment,
    getLatestComment,
    getCommentCount
} = require('../controllers/siswaPostsController');

router.post('/', authenticateToken, createPost);
router.get('/profile/:profile_id', getPostsByProfile);
router.get('/', getAllPosts);
router.delete('/:id', authenticateToken, deletePost);
router.post('/:siswapost_id/like', authenticateToken, likePost);
router.get('/:siswapost_id/like', authenticateToken, checkLike);
router.get('/:siswapost_id/like-count', getLikeCount);
router.get('/main-page', getMainPagePosts);
router.get('/:post_id/comments', authenticateToken, getPostComments);
router.post('/:post_id/comments', authenticateToken, createPostComment);
router.delete('/:post_id/comments/:comment_id', authenticateToken, deletePostComment);
router.get('/:post_id/comments/latest', authenticateToken, getLatestComment);
router.get('/:post_id/comments/count', authenticateToken, getCommentCount);

module.exports = router; 
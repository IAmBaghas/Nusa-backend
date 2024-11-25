const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
    getNotifications,
    createNotification,
    markAsRead,
    deleteNotification
} = require('../controllers/notificationController');

router.get('/', authenticateToken, getNotifications);
router.post('/', authenticateToken, createNotification);
router.post('/:id/read', authenticateToken, markAsRead);
router.delete('/:id', authenticateToken, deleteNotification);

module.exports = router; 
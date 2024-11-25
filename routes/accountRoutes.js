const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getProfiles,
    createProfile,
    updateProfile,
    resetPassword,
    toggleMainPage,
    toggleStatus
} = require('../controllers/accountController');

// All routes require authentication
router.use(authenticateToken);

router.get('/profiles', getProfiles);
router.post('/profiles', createProfile);
router.put('/profiles/:id', updateProfile);
router.post('/profiles/:id/reset', resetPassword);
router.put('/profiles/:id/main-page', authenticateToken, toggleMainPage);
router.put('/profiles/:id/status', authenticateToken, toggleStatus);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { authenticateToken, requireMobileUser } = require('../middleware/auth');
const { 
    mobileLogin, 
    changeFirstPassword, 
    getMobileProfile 
} = require('../controllers/mAuthController');

router.post('/', mobileLogin);
router.post('/change-password', authenticateToken, changeFirstPassword);
router.get('/profile', authenticateToken, getMobileProfile);
router.get('/mobile-only', authenticateToken, requireMobileUser, (req, res) => {
    // Only mobile users can access this
});

module.exports = router; 
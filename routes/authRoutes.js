const express = require('express');
const router = express.Router();
const { login, verifyOTP } = require('../controllers/authController');
const { authenticateToken, requireWebAdmin } = require('../middleware/auth');

router.post('/login', login);
router.post('/verify-otp', verifyOTP);

// For web admin routes that need extra protection
router.get('/admin-only', authenticateToken, requireWebAdmin, (req, res) => {
    // Only web admins can access this
});

module.exports = router;
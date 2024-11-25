const express = require('express');
const router = express.Router();
const webSettingsController = require('../controllers/webSettingsController');
const { authenticateToken } = require('../middleware/auth');

// Component GET routes
router.get('/component/header', webSettingsController.getHeaderSettings);
router.get('/component/logos', webSettingsController.getLogoSettings);
router.get('/component/about', webSettingsController.getAboutSettings);
router.get('/component/footer', webSettingsController.getFooterSettings);
router.get('/component/banner', webSettingsController.getBannerSettings);

// Component PUT route
router.put('/component/:component', authenticateToken, webSettingsController.updateSettings);

// Add new route for about image uploads
router.post('/upload/about', authenticateToken, webSettingsController.uploadAboutImage);

// Add new route for banner image uploads
router.post('/upload/banner', authenticateToken, webSettingsController.uploadBannerImage);

// Add new route for logo uploads
router.post('/upload/logo', authenticateToken, webSettingsController.uploadLogoImages);

// Add new route for header image uploads
router.post('/upload/header', authenticateToken, webSettingsController.uploadHeaderImage);

module.exports = router; 
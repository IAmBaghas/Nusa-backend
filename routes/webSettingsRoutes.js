const express = require('express');
const router = express.Router();
const webSettingsController = require('../controllers/webSettingsController');

// Component GET routes - no auth required
router.get('/component/header', webSettingsController.getHeaderSettings);
router.get('/component/logos', webSettingsController.getLogoSettings);
router.get('/component/about', webSettingsController.getAboutSettings);
router.get('/component/footer', webSettingsController.getFooterSettings);
router.get('/component/banner', webSettingsController.getBannerSettings);

// Component PUT route - no auth required
router.put('/component/:component', webSettingsController.updateSettings);

// Upload routes - no auth required
router.post('/upload/about', webSettingsController.uploadAboutImage);
router.post('/upload/banner', webSettingsController.uploadBannerImage);
router.post('/upload/logo', webSettingsController.uploadLogoImages);
router.post('/upload/header', webSettingsController.uploadHeaderImage);

module.exports = router; 
// backend/Routes/setup.js
const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');

// Public routes untuk setup initial
router.get('/status', setupController.checkSetupStatus);
router.post('/admin', setupController.setupInitialAdmin);

module.exports = router;
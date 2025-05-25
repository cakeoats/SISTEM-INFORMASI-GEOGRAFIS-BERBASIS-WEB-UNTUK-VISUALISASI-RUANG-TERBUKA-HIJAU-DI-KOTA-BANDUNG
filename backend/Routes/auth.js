// backend/Routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireAdmin, requireSuperAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authController.loginAdmin);

// Protected routes (require authentication)
router.get('/profile', verifyToken, requireAdmin, authController.getAdminProfile);
router.post('/logout', verifyToken, requireAdmin, authController.logoutAdmin);
router.post('/change-password', verifyToken, requireAdmin, authController.changePassword);

// Super admin only routes
router.post('/create-admin', verifyToken, requireSuperAdmin, authController.createAdmin);

module.exports = router;
// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const TokenBlacklist = require('../models/TokenBlacklist');

// Middleware untuk verifikasi JWT token
const verifyToken = async (req, res, next) => {
    try {
        // Ambil token dari header Authorization
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Extract token dari "Bearer <token>"
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }

        // Check if token is blacklisted
        const blacklistedToken = await TokenBlacklist.findOne({ token });
        if (blacklistedToken) {
            return res.status(401).json({
                success: false,
                message: 'Token has been invalidated.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Cari admin berdasarkan ID dari token
        const admin = await Admin.findById(decoded.adminId).select('-password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Token is valid but admin not found.'
            });
        }

        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Admin account is deactivated.'
            });
        }

        // Tambahkan admin info ke request object
        req.admin = admin;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

// Middleware untuk verifikasi role admin
const requireAdmin = (req, res, next) => {
    if (req.admin && (req.admin.role === 'admin' || req.admin.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.'
        });
    }
};

// Middleware untuk verifikasi role super admin
const requireSuperAdmin = (req, res, next) => {
    if (req.admin && req.admin.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Super admin role required.'
        });
    }
};

module.exports = {
    verifyToken,
    requireAdmin,
    requireSuperAdmin
};
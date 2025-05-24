// backend/middleware/authMiddleware.js - Simplified version
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

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

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');

        // Cari admin berdasarkan ID dari token
        const admin = await Admin.findById(decoded.adminId).select('-password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Token is valid but admin not found.'
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

// Middleware untuk verifikasi role admin (simplified - semua admin punya akses sama)
const requireAdmin = (req, res, next) => {
    if (req.admin) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.'
        });
    }
};

// Middleware untuk verifikasi role super admin (tidak digunakan, tapi tetap ada untuk kompatibilitas)
const requireSuperAdmin = (req, res, next) => {
    // Karena hanya ada satu role, semua admin dianggap super admin
    if (req.admin) {
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
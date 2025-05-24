// backend/controllers/authController.js - Simplified version
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT Token
const generateToken = (adminId) => {
    return jwt.sign(
        { adminId },
        process.env.JWT_SECRET || 'default_secret_key',
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
    );
};

// Login Admin
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        // Cari admin berdasarkan username
        const admin = await Admin.findOne({ username: username.toLowerCase() });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Verify password
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Update last login (dummy call untuk kompatibilitas)
        await admin.updateLastLogin();

        // Generate JWT token
        const token = generateToken(admin._id);

        // Response success
        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    role: 'admin', // Fixed role
                    createdAt: admin.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Get Admin Profile (Protected route)
exports.getAdminProfile = async (req, res) => {
    try {
        // req.admin sudah tersedia dari middleware verifyToken
        const admin = req.admin;

        res.json({
            success: true,
            data: {
                admin: {
                    id: admin._id,
                    username: admin.username,
                    role: 'admin', // Fixed role
                    createdAt: admin.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Logout Admin (Optional - for token blacklisting in the future)
exports.logoutAdmin = async (req, res) => {
    try {
        // Untuk sekarang, logout hanya mengembalikan success
        // Di masa depan bisa ditambahkan token blacklisting

        res.json({
            success: true,
            message: 'Logout berhasil'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin._id;

        // Validasi input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password lama dan password baru harus diisi'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password baru minimal 6 karakter'
            });
        }

        // Ambil admin dengan password untuk verifikasi
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin tidak ditemukan'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await admin.comparePassword(currentPassword);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Password lama tidak benar'
            });
        }

        // Update password (akan di-hash otomatis oleh pre-save hook)
        admin.password = newPassword;
        await admin.save();

        res.json({
            success: true,
            message: 'Password berhasil diubah'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
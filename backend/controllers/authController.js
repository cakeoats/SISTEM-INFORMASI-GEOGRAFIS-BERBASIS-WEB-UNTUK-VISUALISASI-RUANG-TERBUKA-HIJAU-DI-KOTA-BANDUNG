const jwt = require('jsonwebtoken'); // Library untuk JWT token
const Admin = require('../models/Admin'); // Model admin
const mongoose = require('mongoose'); // MongoDB ODM
const TokenBlacklist = require('../models/TokenBlacklist'); // Model untuk blacklisted tokens

// Helper function untuk generate JWT token
const generateToken = (adminId) => {
    return jwt.sign(
        { adminId }, // Payload berisi admin ID
        process.env.JWT_SECRET, // Secret key dari environment
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h' // Token berlaku 24 jam
        }
    );
};

// Login admin endpoint
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validasi input - pastikan username dan password ada
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        // Cari admin berdasarkan username
        const admin = await Admin.findOne({ username: username.trim() });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Username salah'
            });
        }

        // Verify password menggunakan bcrypt
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password salah'
            });
        }

        // Update last login timestamp
        await admin.updateLastLogin();

        // Generate JWT token untuk session
        const token = generateToken(admin._id);

        // Return success response dengan token dan data admin
        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role,
                    lastLogin: admin.lastLogin
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

// Get admin profile (protected endpoint)
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
                    email: admin.email,
                    role: admin.role,
                    lastLogin: admin.lastLogin,
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

// Logout admin endpoint
exports.logoutAdmin = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            // Tambahkan token ke blacklist untuk invalidasi
            await TokenBlacklist.create({
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire dalam 24 jam
            });
        }

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

// Change password endpoint
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
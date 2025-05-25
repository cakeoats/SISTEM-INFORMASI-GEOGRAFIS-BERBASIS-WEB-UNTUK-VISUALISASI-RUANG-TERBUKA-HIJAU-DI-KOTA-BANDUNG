// backend/controllers/setupController.js
const Admin = require('../models/Admin');

// Setup initial admin - hanya jika belum ada admin sama sekali
exports.setupInitialAdmin = async (req, res) => {
    try {
        // Cek apakah sudah ada admin
        const existingAdmin = await Admin.findOne({});

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin sudah ada. Setup tidak diperlukan.'
            });
        }

        const { username, password, email } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password minimal 6 karakter'
            });
        }

        // Buat admin pertama dengan role super_admin
        const newAdmin = new Admin({
            username: username.toLowerCase().trim(),
            password,
            email: email || null,
            role: 'super_admin',
            isActive: true
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin pertama berhasil dibuat',
            data: {
                username: newAdmin.username,
                email: newAdmin.email,
                role: newAdmin.role,
                createdAt: newAdmin.createdAt
            }
        });

    } catch (error) {
        console.error('Setup admin error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah digunakan'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during setup'
        });
    }
};

// Cek apakah sistem sudah di-setup
exports.checkSetupStatus = async (req, res) => {
    try {
        const adminExists = await Admin.countDocuments({}) > 0;

        res.json({
            success: true,
            data: {
                setupRequired: !adminExists,
                adminExists: adminExists
            }
        });

    } catch (error) {
        console.error('Check setup status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
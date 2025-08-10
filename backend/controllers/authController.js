// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');
const TokenBlacklist = require('../models/TokenBlacklist');

// Generate JWT Token
const generateToken = (adminId) => {
    return jwt.sign(
        { adminId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
    );
};

// Login Admin
exports.loginAdmin = async (req, res) => {
    try {
        console.log('Login attempt:', { username: req.body.username });
        const { username, password } = req.body;

        // Validasi input
        if (!username || !password) {
            console.log('Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        // Ensure MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            console.log('MongoDB not connected, attempting to connect...');
            try {
                await mongoose.connect(process.env.MONGO_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                console.log('MongoDB connected successfully');
            } catch (dbError) {
                console.error('MongoDB connection error:', dbError);
                return res.status(500).json({
                    success: false,
                    message: 'Database connection error'
                });
            }
        }

        // Verify collection name
        const collections = await mongoose.connection.db.listCollections().toArray();
        const adminCollection = collections.find(c => c.name === 'admins');
        console.log('Available collections:', collections.map(c => c.name));
        console.log('Using collection:', Admin.collection.name);

        // Cari admin berdasarkan username
        console.log('Searching for admin with username:', username.trim());
        const admin = await Admin.findOne({ username: username.trim() });
        console.log('Admin search result:', admin ? 'Found' : 'Not found');

        if (!admin) {
            console.log('Admin not found');
            return res.status(401).json({
                success: false,
                message: 'Username salah'
            });
        }

        // Verify password
        console.log('Verifying password');
        const isPasswordValid = await admin.comparePassword(password);
        console.log('Password verification result:', isPasswordValid ? 'Valid' : 'Invalid');

        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(401).json({
                success: false,
                message: 'Password salah'
            });
        }

        // Update last login
        try {
            console.log('Updating last login');
            await admin.updateLastLogin();
            console.log('Last login updated successfully');
        } catch (updateError) {
            console.error('Error updating last login:', updateError);
            // Continue with login even if last login update fails
        }

        // Generate JWT token
        console.log('Generating JWT token');
        const token = generateToken(admin._id);
        console.log('Token generated successfully');

        // Response success
        console.log('Login successful, sending response');
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
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Admin Profile (Protected route)
exports.getAdminProfile = async (req, res) => {
    try {
        // Ensure MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            console.log('MongoDB not connected, attempting to connect...');
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        }

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

// Logout Admin
exports.logoutAdmin = async (req, res) => {
    try {
        // Ensure MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            console.log('MongoDB not connected, attempting to connect...');
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            // Add to blacklist collection
            await TokenBlacklist.create({ 
                token, 
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) 
            });
        }
        res.json({ success: true, message: 'Logout berhasil' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout' });
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

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

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

        // Cek apakah username sudah ada
        const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah digunakan'
            });
        }

        // Buat admin baru
        const newAdmin = new Admin({
            username: username.toLowerCase(),
            password,
            email: email || null,
            role: role || 'admin'
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin berhasil dibuat',
            data: {
                admin: {
                    id: newAdmin._id,
                    username: newAdmin.username,
                    email: newAdmin.email,
                    role: newAdmin.role,
                    isActive: newAdmin.isActive,
                    createdAt: newAdmin.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const findAdminWithRetry = async (username, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await Admin.findOne({ username: username.toLowerCase() });
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
};

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
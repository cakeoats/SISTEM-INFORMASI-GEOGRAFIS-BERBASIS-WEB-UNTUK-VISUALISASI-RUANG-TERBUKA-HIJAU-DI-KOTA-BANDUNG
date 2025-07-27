const mongoose = require('mongoose'); // ODM untuk MongoDB
const bcrypt = require('bcryptjs'); // Library untuk hashing password

// Schema untuk admin users
const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, // Username wajib diisi
        unique: true, // Username harus unik
        trim: true, // Hapus whitespace di awal/akhir
        minlength: 3, // Minimal 3 karakter
        maxlength: 50 // Maksimal 50 karakter
    },
    password: {
        type: String,
        required: true, // Password wajib diisi
        minlength: 6 // Minimal 6 karakter
    },
    email: {
        type: String,
        trim: true, // Hapus whitespace
        lowercase: true, // Convert ke lowercase
        default: null // Boleh kosong
    },
    role: {
        type: String,
        enum: ['admin', 'super_admin'], // Hanya boleh admin atau super_admin
        default: 'admin' // Default role adalah admin
    },
    isActive: {
        type: Boolean,
        default: true // Default user aktif
    },
    lastLogin: {
        type: Date,
        default: null // Null jika belum pernah login
    },
    createdAt: {
        type: Date,
        default: Date.now // Waktu pembuatan akun
    },
    updatedAt: {
        type: Date,
        default: Date.now // Waktu terakhir update
    }
});

// Pre-save middleware untuk hash password
AdminSchema.pre('save', async function (next) {
    // Hanya hash jika password dimodifikasi
    if (!this.isModified('password')) return next();

    try {
        // Generate salt dan hash password
        const salt = await bcrypt.genSalt(12); // Salt rounds 12 untuk keamanan tinggi
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method untuk membandingkan password
AdminSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method untuk update last login timestamp
AdminSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

// Pre-save untuk update timestamp
AdminSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Admin', AdminSchema, 'admins');
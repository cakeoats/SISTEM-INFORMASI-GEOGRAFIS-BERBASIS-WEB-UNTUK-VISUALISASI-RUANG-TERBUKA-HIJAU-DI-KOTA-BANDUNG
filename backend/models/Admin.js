// backend/models/Admin.js - Simplified version
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password sebelum menyimpan
AdminSchema.pre('save', async function (next) {
    // Hanya hash password jika password dimodifikasi
    if (!this.isModified('password')) return next();

    try {
        // Hash password dengan salt rounds 12
        const salt = await bcrypt.genSalt(12);
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

// Method untuk update last login (dummy method untuk kompatibilitas)
AdminSchema.methods.updateLastLogin = function () {
    // Tidak perlu update apapun, hanya return promise resolved
    return Promise.resolve();
};

module.exports = mongoose.model('Admin', AdminSchema, 'admins');
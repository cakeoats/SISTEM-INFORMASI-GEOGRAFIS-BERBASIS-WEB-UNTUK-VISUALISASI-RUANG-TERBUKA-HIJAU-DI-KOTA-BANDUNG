// backend/api/index.js - Updated dengan auth dan setup routes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const kecamatanRoutes = require('../Routes/kecamatan');
const rthKecamatanRoutes = require('../Routes/rthKecamatan');
const authRoutes = require('../Routes/auth');
const setupRoutes = require('../Routes/setup');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bandung-gis')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'API untuk SIG Ruang Terbuka Hijau Bandung berjalan',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Setup routes (untuk initial setup) - PENTING: harus di atas auth routes
app.use('/api/setup', setupRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Existing routes
app.use('/api/kecamatan', kecamatanRoutes);
app.use('/api/rth-kecamatan', rthKecamatanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
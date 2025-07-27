const express = require('express'); // Framework web untuk Node.js
const mongoose = require('mongoose'); // ODM untuk MongoDB
const cors = require('cors'); // Middleware untuk Cross-Origin Resource Sharing
const dotenv = require('dotenv'); // Untuk environment variables

// Import route handlers
const kecamatanRoutes = require('./Routes/kecamatan');
const rthKecamatanRoutes = require('./Routes/rthKecamatan');
const authRoutes = require('./Routes/auth');
const adminRoutes = require('./Routes/admin');

// Load environment variables dari .env file
dotenv.config();

const app = express();

// CORS configuration - Konfigurasi untuk mengizinkan request dari frontend
app.use(cors({
    origin: 'https://www.bandung-rth.my.id', // URL frontend yang diizinkan
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // HTTP methods yang diizinkan
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: false, // Set false untuk public endpoints
    maxAge: 86400 // Cache preflight selama 24 jam
}));

// Middleware untuk parsing JSON request body
app.use(express.json());

// MongoDB connection options - Konfigurasi koneksi database
const mongoOptions = {
    useNewUrlParser: true, // Gunakan parser MongoDB baru
    useUnifiedTopology: true, // Gunakan engine monitoring baru
    serverSelectionTimeoutMS: 30000, // Timeout untuk memilih server
    socketTimeoutMS: 45000, // Timeout untuk socket operation
    connectTimeoutMS: 30000, // Timeout untuk initial connection
    maxPoolSize: 10, // Maksimal connection pool size
    minPoolSize: 0, // Minimal connection pool size
    retryWrites: true, // Retry write operations jika gagal
    w: 'majority', // Write concern untuk replikasi
    family: 4, // Force IPv4
    appName: 'bandung-gis-backend' // Nama aplikasi untuk monitoring
};

// Routes configuration - Konfigurasi endpoint API
app.use('/api/kecamatan', kecamatanRoutes); // API untuk data GeoJSON kecamatan
app.use('/api/rth-kecamatan', rthKecamatanRoutes); // API untuk data RTH per kecamatan
app.use('/api/auth', authRoutes); // API untuk autentikasi admin
app.use('/api/admin', adminRoutes); // API untuk manajemen admin

// Error handling middleware - Middleware untuk handle error global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {} // Detail error hanya di development
    });
});

// 404 handler - Handler untuk route yang tidak ditemukan
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app; // Export untuk serverless deployment
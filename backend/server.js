// backend/server.js - Updated untuk serverless environment
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const kecamatanRoutes = require('./Routes/kecamatan');
const rthKecamatanRoutes = require('./Routes/rthKecamatan');
const authRoutes = require('./Routes/auth');
const adminRoutes = require('./Routes/admin');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'https://website-sig-blue.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: false, // Set to false for public endpoints
    maxAge: 86400 // 24 hours
}));

// Add CORS headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://website-sig-blue.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'false'); // Set to false for public endpoints
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Middleware
app.use(express.json());

// MongoDB connection options
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 0,
    retryWrites: true,
    w: 'majority',
    family: 4, // Force IPv4
    appName: 'bandung-gis-backend' // Add app name for better monitoring
};

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not set');
        }

        // Force close any existing connection and wait
        if (mongoose.connection.readyState !== 0) {
            console.log('Closing existing connection...');
            await mongoose.connection.close();
            // Wait longer for the connection to fully close
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Clear any existing connection and listeners
        mongoose.connection.removeAllListeners();
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        // Create new connection with explicit database name
        const baseUri = process.env.MONGO_URI;
        const uri = baseUri.endsWith('/') 
            ? `${baseUri}bandung-gis` 
            : `${baseUri}/bandung-gis`;
            
        console.log('Connecting to MongoDB...', uri);
        
        // Disconnect first to ensure clean state
        await mongoose.disconnect();
        
        // Create new connection
        await mongoose.connect(uri, {
            ...mongoOptions,
            serverSelectionTimeoutMS: 5000, // Shorter timeout for faster failure
            connectTimeoutMS: 5000
        });
        
        // Wait for connection to be ready
        if (mongoose.connection.readyState !== 1) {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 5000);

                mongoose.connection.once('connected', () => {
                    clearTimeout(timeout);
                    resolve();
                });

                mongoose.connection.once('error', (err) => {
                    clearTimeout(timeout);
                    reject(err);
                });
            });
        }
        
        // Verify database name
        const dbName = mongoose.connection.db.databaseName;
        console.log('Connected to MongoDB database:', dbName);

        if (dbName !== 'bandung-gis') {
            throw new Error(`Connected to wrong database: ${dbName}. Expected: bandung-gis`);
        }
        
        console.log('MongoDB connected successfully to bandung-gis database');
        
        // Verify connection with ping
        try {
            const pingResult = await mongoose.connection.db.admin().ping();
            console.log('MongoDB ping successful:', pingResult);
        } catch (pingError) {
            console.error('Ping failed:', pingError);
            throw new Error('Connection verification failed');
        }
        
        return true;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Ensure we're disconnected on error
        try {
            await mongoose.disconnect();
        } catch (disconnectErr) {
            console.error('Error disconnecting:', disconnectErr);
        }
        throw err;
    }
};

// Middleware to ensure MongoDB connection
const ensureMongoConnection = async (req, res, next) => {
    try {
        // Always try to connect in serverless environment
        console.log('Current connection state:', mongoose.connection.readyState);
        if (mongoose.connection.readyState !== 1) {
            await connectWithRetry();
        }
        next();
    } catch (error) {
        console.error('MongoDB connection middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message,
            state: mongoose.connection.readyState,
            timestamp: new Date().toISOString()
        });
    }
};

// Apply the middleware to all routes
app.use(ensureMongoConnection);

// Health check endpoint
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    
    res.status(200).json({
        status: 'ok',
        database: {
            status: dbStatus,
            name: dbName
        },
        timestamp: new Date().toISOString()
    });
});

// Test MongoDB connection endpoint
app.get('/testconnection', async (req, res) => {
    try {
        // Force a new connection attempt
        console.log('Testing connection...');
        await connectWithRetry();
        
        // Check current connection state
        const currentState = mongoose.connection.readyState;
        const stateMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        // Get connection details
        const connectionDetails = {
            state: stateMap[currentState] || 'unknown',
            host: mongoose.connection.host,
            name: mongoose.connection.name,
            port: mongoose.connection.port,
            ping: 'success', // If we got here, ping was successful
            uri: process.env.MONGO_URI ? 'configured' : 'not configured',
            readyState: currentState,
            database: mongoose.connection.db.databaseName
        };

        res.status(200).json({
            success: true,
            message: 'Connection test completed',
            connection: connectionDetails,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Connection test error:', error);
        res.status(500).json({
            success: false,
            message: 'Connection test failed',
            error: error.message,
            state: mongoose.connection.readyState,
            timestamp: new Date().toISOString()
        });
    }
});

// Routes
app.get('/', (req, res) => {
    res.send('API untuk SIG Ruang Terbuka Hijau Bandung berjalan');
});

// Existing routes
app.use('/api/kecamatan', kecamatanRoutes);
app.use('/api/rth-kecamatan', rthKecamatanRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server only if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for serverless
module.exports = app;
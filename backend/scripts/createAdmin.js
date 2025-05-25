require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

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
    appName: 'bandung-gis-admin-script' // Add app name for better monitoring
};

async function createAdmin() {
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

        // Create admin user
        const adminData = {
            username: 'may',
            password: 'may123456',
            email: 'may@example.com',
            role: 'super_admin',
            isActive: true
        };

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: adminData.username });
        if (existingAdmin) {
            console.log('Admin user already exists. Updating...');
            existingAdmin.password = adminData.password;
            existingAdmin.email = adminData.email;
            existingAdmin.role = adminData.role;
            existingAdmin.isActive = adminData.isActive;
            await existingAdmin.save();
            console.log('Admin user updated successfully');
        } else {
            const admin = new Admin(adminData);
            await admin.save();
            console.log('Admin user created successfully');
        }

        // Verify admin was created/updated
        const admin = await Admin.findOne({ username: adminData.username });
        if (!admin) {
            throw new Error('Failed to create/update admin user');
        }

        console.log('Admin details:', {
            username: admin.username,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
            createdAt: admin.createdAt
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

createAdmin();
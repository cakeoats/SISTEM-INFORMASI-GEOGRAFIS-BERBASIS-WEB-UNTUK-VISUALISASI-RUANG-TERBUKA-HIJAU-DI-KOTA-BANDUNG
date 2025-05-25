
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createInitialAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://may:may453@may.44rc33j.mongodb.net/?retryWrites=true&w=majority&appName=May');
        console.log('Connected to MongoDB');

        // Cek apakah sudah ada admin
        const existingAdmin = await Admin.findOne({});

        if (existingAdmin) {
            console.log('Admin already exists:', existingAdmin.username);
            process.exit(0);
        }

        // Data admin default
        const adminData = {
            username: '123456',
            password: '123456',
        };

        // Buat admin baru
        const newAdmin = new Admin(adminData);
        await newAdmin.save();

        console.log('Initial admin created successfully!');
        console.log('Username:', adminData.username);
        console.log('Password:', adminData.password);

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
};

// Jalankan script
createInitialAdmin();
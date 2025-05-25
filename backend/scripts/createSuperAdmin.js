// backend/scripts/createSuperAdmin.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://may:may453@may.44rc33j.mongodb.net/?retryWrites=true&w=majority&appName=May');
        console.log('Connected to MongoDB');

        // Cek apakah sudah ada super admin
        const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });

        if (existingSuperAdmin) {
            console.log('Super Admin sudah ada:', existingSuperAdmin.username);
            console.log('Jika ingin membuat super admin baru, hapus super admin yang ada terlebih dahulu.');
            process.exit(0);
        }

        // Data super admin default
        const superAdminData = {
            username: 'superadmin',
            password: 'superadmin123',
            role: 'super_admin',
            email: null
        };

        // Cek apakah username sudah digunakan
        const existingUsername = await Admin.findOne({ username: superAdminData.username });
        if (existingUsername) {
            console.log(`Username "${superAdminData.username}" sudah digunakan.`);
            console.log('Silakan hapus admin dengan username tersebut atau gunakan username lain.');
            process.exit(1);
        }

        // Buat super admin baru
        const newSuperAdmin = new Admin(superAdminData);
        await newSuperAdmin.save();

        console.log('✅ Super Admin berhasil dibuat!');
        console.log('Username:', superAdminData.username);
        console.log('Password:', superAdminData.password);
        console.log('Role:', superAdminData.role);
        console.log('');
        console.log('PENTING: Ganti password default setelah login pertama kali!');
        console.log('Super Admin dapat membuat admin baru melalui dashboard.');

    } catch (error) {
        console.error('❌ Error membuat Super Admin:', error);

        if (error.code === 11000) {
            console.log('Username atau email sudah digunakan.');
        }
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
};

// Jalankan script
console.log('🚀 Membuat Super Admin...');
createSuperAdmin();
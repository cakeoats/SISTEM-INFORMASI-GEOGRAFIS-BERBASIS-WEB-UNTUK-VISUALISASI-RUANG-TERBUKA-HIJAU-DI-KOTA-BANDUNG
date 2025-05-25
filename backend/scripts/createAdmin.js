// backend/scripts/createAdmin.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createInitialAdmin = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bandung-gis';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB:', mongoUri);

        // Cek apakah sudah ada admin
        const existingAdmin = await Admin.findOne({});

        if (existingAdmin) {
            console.log('Admin sudah ada:');
            console.log('Username:', existingAdmin.username);
            console.log('Role:', existingAdmin.role);
            console.log('Created:', existingAdmin.createdAt);

            // Tanya apakah ingin membuat admin baru
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Admin sudah ada. Buat admin baru? (y/n): ', async (answer) => {
                if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                    await createNewAdmin();
                }
                rl.close();
                mongoose.disconnect();
            });
            return;
        }

        // Buat admin default jika belum ada
        await createDefaultAdmin();

    } catch (error) {
        console.error('Error:', error);
    }
};

const createDefaultAdmin = async () => {
    try {
        // Data admin default
        const adminData = {
            username: 'admin',
            password: 'admin123',
            email: 'admin@bandung-gis.com',
            role: 'super_admin',
            isActive: true
        };

        // Buat admin baru
        const newAdmin = new Admin(adminData);
        await newAdmin.save();

        console.log('✅ Admin default berhasil dibuat!');
        console.log('👤 Username:', adminData.username);
        console.log('🔑 Password:', adminData.password);
        console.log('📧 Email:', adminData.email);
        console.log('🛡️  Role:', adminData.role);
        console.log('');
        console.log('⚠️  PENTING: Ganti password setelah login pertama!');

    } catch (error) {
        console.error('Error membuat admin default:', error);
    } finally {
        mongoose.disconnect();
    }
};

const createNewAdmin = async () => {
    try {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = (question) => {
            return new Promise((resolve) => {
                rl.question(question, resolve);
            });
        };

        console.log('\n📝 Buat Admin Baru');
        const username = await askQuestion('Username: ');
        const password = await askQuestion('Password: ');
        const email = await askQuestion('Email (opsional): ');
        const role = await askQuestion('Role (admin/super_admin) [admin]: ') || 'admin';

        // Validasi
        if (!username || !password) {
            console.log('❌ Username dan password harus diisi!');
            rl.close();
            return;
        }

        if (password.length < 6) {
            console.log('❌ Password minimal 6 karakter!');
            rl.close();
            return;
        }

        // Cek username sudah ada atau belum
        const existingUser = await Admin.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            console.log('❌ Username sudah digunakan!');
            rl.close();
            return;
        }

        // Buat admin baru
        const newAdmin = new Admin({
            username: username.toLowerCase(),
            password,
            email: email || null,
            role: ['admin', 'super_admin'].includes(role) ? role : 'admin',
            isActive: true
        });

        await newAdmin.save();

        console.log('\n✅ Admin berhasil dibuat!');
        console.log('👤 Username:', newAdmin.username);
        console.log('📧 Email:', newAdmin.email || 'Tidak diisi');
        console.log('🛡️  Role:', newAdmin.role);

        rl.close();
    } catch (error) {
        console.error('Error membuat admin baru:', error);
    } finally {
        mongoose.disconnect();
    }
};

// Jalankan script
if (require.main === module) {
    createInitialAdmin();
}

module.exports = { createInitialAdmin, createDefaultAdmin };
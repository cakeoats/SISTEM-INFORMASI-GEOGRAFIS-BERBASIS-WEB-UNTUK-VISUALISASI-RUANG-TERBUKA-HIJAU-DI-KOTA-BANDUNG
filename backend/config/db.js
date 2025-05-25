// backend/config/db.js - Fixed untuk database bandung-gis
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Koneksi ke database bandung-gis
    await mongoose.connect('mongodb+srv://may:may453@may.44rc33j.mongodb.net/bandung-gis?retryWrites=true&w=majority&appName=May', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected to database: bandung-gis');
  } catch (err) {
    console.error('Database error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
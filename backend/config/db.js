const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://may:may453@may.44rc33j.mongodb.net/?retryWrites=true&w=majority&appName=May', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Database error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
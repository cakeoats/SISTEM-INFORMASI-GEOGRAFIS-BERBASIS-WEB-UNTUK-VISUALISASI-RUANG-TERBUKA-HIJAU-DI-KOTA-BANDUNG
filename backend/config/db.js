const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variable
    const baseUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    
    // Ensure we're using the bandung-gis database
    const uri = baseUri.endsWith('/') 
      ? `${baseUri}bandung-gis` 
      : `${baseUri}/bandung-gis`;

    console.log('Connecting to MongoDB:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Verify database name
    const dbName = mongoose.connection.db.databaseName;
    console.log('Connected to MongoDB database:', dbName);

    if (dbName !== 'bandung-gis') {
      throw new Error(`Connected to wrong database: ${dbName}. Expected: bandung-gis`);
    }

    console.log('MongoDB Connected successfully to bandung-gis database');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
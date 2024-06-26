// DBconnect.js
require('dotenv').config();
const mongoose = require('mongoose');

// Connection URI obtained from MongoDB Atlas
const uri = process.env.MONGO_URI;
async function connectToDatabase() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
  useUnifiedTopology: true,
      // Increase the timeout to 30 seconds
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  }

  // Event listeners for monitoring the connection
  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection lost. Trying to reconnect...');
    connectToDatabase(); // Try to reconnect
  });
}

module.exports = connectToDatabase;

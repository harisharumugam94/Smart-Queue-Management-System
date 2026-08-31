const mongoose = require('mongoose');

// Connects to MongoDB. If the connection fails, we log the error but do
// NOT crash the server — this lets the container still start and answer
// health checks, which is what makes Docker's HEALTHCHECK meaningful
// (a "liveness" check should reflect "is the process alive", not
// "is every dependency perfect").
async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartqueue';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Server will keep running; it will retry on next request.');
  }
}

module.exports = connectDB;

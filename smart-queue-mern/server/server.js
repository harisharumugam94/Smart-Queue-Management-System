require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const queueRoutes = require('./routes/queueRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB (see config/db.js for why this doesn't crash the app).
connectDB();

// Health check route — used by Docker's HEALTHCHECK and docker-compose.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/queue', queueRoutes);

app.get('/', (req, res) => {
  res.send('Smart Queue Management API is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

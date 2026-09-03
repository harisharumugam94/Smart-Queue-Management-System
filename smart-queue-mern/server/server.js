require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('prom-client'); // NEW

const connectDB = require('./config/db');
const queueRoutes = require('./routes/queueRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB (see config/db.js for why this doesn't crash the app).
connectDB();

// ---- NEW: Prometheus metrics setup ----
// Automatically tracks default Node.js stats (memory, CPU, event loop, etc.)
client.collectDefaultMetrics();

// Custom counter: counts every request, labeled by route and status code
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Middleware: runs on every request, records it after the response is sent
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

// Endpoint Grafana/Prometheus will read metrics from
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
// ---- END NEW ----

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
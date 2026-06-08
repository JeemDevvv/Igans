// Load config from .env if it exists, otherwise use environment variables
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, 'config/config.env');
if (fs.existsSync(configPath)) {
  require('dotenv').config({ path: configPath });
} else {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { getActiveCount, updateCustomer } = require('./utils/activeCustomers');

connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Active customers tracking endpoints
app.post('/api/customer/heartbeat', (req, res) => {
  const { sessionId } = req.body;
  updateCustomer(sessionId);
  res.json({ success: true });
});

app.get('/api/customer/active-count', (req, res) => {
  res.json({ success: true, count: getActiveCount() });
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/menu',     require('./routes/menu.routes'));
app.use('/api/orders',   require('./routes/order.routes'));
app.use('/api/tables',   require('./routes/table.routes'));
app.use('/api/publicqr', require('./routes/publicqr.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/ai',       require('./routes/ai.routes'));
app.use('/api/admin',    require('./routes/admin.routes'));
app.use('/api/reviews',  require('./routes/review.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Catch-all: serve requested file if it exists, otherwise index.html
app.get('*', (req, res) => {
  const requestedFile = path.join(__dirname, '../frontend', req.path);
  if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
    res.sendFile(requestedFile);
  } else {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`Frontend served from ../frontend`);
  console.log(`Run 'npm run seed' to populate the database\n`);
});

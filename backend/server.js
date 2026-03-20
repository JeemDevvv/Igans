require('dotenv').config({ path: './config/config.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/menu',     require('./routes/menu.routes'));
app.use('/api/orders',   require('./routes/order.routes'));
app.use('/api/tables',   require('./routes/table.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/ai',       require('./routes/ai.routes'));
app.use('/api/admin',    require('./routes/admin.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Catch-all: serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Frontend served from ../frontend`);
  console.log(`🗃️  Run 'npm run seed' to populate the database\n`);
});

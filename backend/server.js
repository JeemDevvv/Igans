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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { getActiveCount, updateCustomer } = require('./utils/activeCustomers');
connectDB();
const app = express();

// Trust proxy for Render/X-Forwarded-For
app.set('trust proxy', 1);

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // limit each IP to 100,000 requests per windowMs (effectively disabled for dev)
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      scriptSrcElem: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "'unsafe-inline'"],
      styleSrcElem: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "'unsafe-inline'"],
      styleSrcAttr: ["'unsafe-inline'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
    },
  },
}));

// Secure CORS configuration - allow Render origin and localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      'http://localhost:5000', 
      'http://localhost:3000', 
      'https://igansbudbodhouse.onrender.com'
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.post('/api/customer/heartbeat', (req, res) => {
  const { sessionId } = req.body;
  updateCustomer(sessionId);
  res.json({ success: true });
});
app.get('/api/customer/active-count', (req, res) => {
  res.json({ success: true, count: getActiveCount() });
});
const isProduction = process.env.NODE_ENV === 'production';
const staticPath = isProduction 
  ? path.join(__dirname, '../frontend/dist') 
  : path.join(__dirname, '../frontend');
app.use(express.static(staticPath));
app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/menu',     require('./routes/menu.routes'));
app.use('/api/orders',   require('./routes/order.routes'));
app.use('/api/tables',   require('./routes/table.routes'));
app.use('/api/publicqr', require('./routes/publicqr.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/ai',       require('./routes/ai.routes'));
app.use('/api/admin',    require('./routes/admin.routes'));
app.use('/api/reviews',  require('./routes/review.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
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
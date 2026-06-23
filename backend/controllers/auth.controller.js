const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
// Temporarily disable notifications to debug
const createNotification = () => Promise.resolve();

// In-memory storage for OTPs (in production, use Redis with expiry)
const otpStore = {};

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
  const expire = process.env.JWT_EXPIRE || '7d';
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    secret,
    { expiresIn: expire }
  );
};

// Configure nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Step 1: Verify user by role and username, return email
exports.verifyUserForReset = async (req, res) => {
  try {
    const { username, role } = req.body;
    if (!username || !role) {
      return res.status(400).json({ success: false, msg: 'Username and role required' });
    }
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found for this role' });
    }
    res.json({ success: true, email: user.email });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// Step 2: Send OTP to user's email
exports.sendOTP = async (req, res) => {
  try {
    const { username, role } = req.body;
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    const otp = generateOTP();
    otpStore[user.email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    // If no SMTP_PASS, fallback to console OTP
    if (!process.env.SMTP_PASS) {
      console.log(`[DEV MODE] OTP for ${user.email} (${username}): ${otp}`);
      return res.json({ success: true, msg: 'OTP sent to email (check server console for OTP)' });
    }

    // Send email in production
    const transporter = createTransporter();
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: user.email,
        subject: 'Password Reset OTP — Igan\'s Budbod House',
        text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
      });
    } catch (emailErr) {
      console.error('Failed to send email, falling back to console OTP:', emailErr.message);
      console.log(`OTP for ${user.email}: ${otp}`);
      return res.json({ success: true, msg: 'OTP sent (check server console)' });
    }

    res.json({ success: true, msg: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

// Step 3: Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const stored = otpStore[email];
    if (!stored) {
      return res.status(400).json({ success: false, msg: 'OTP expired or invalid' });
    }
    if (Date.now() > stored.expires) {
      delete otpStore[email];
      return res.status(400).json({ success: false, msg: 'OTP expired' });
    }
    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, msg: 'Incorrect OTP' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// Step 4: Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, msg: 'Email and valid password required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    delete otpStore[email];
    res.json({ success: true, msg: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, msg: 'All fields are required' });
    }
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail) return res.status(400).json({ success: false, msg: 'Email already registered' });
    if (existingUsername) return res.status(400).json({ success: false, msg: 'Username already registered' });
    const safeRole = ['staff', 'kitchen', 'admin'].includes(role) ? role : 'staff';
    const user = await User.create({ name, username, email, password, role: safeRole });
    
    // Send notification
    const adminName = req.user?.name || 'Admin';
    try {
      await createNotification(
        'New Account Created',
        `${adminName} added an account for "${user.name}" (${user.role})`,
        'system',
        { userId: user._id, userName: user.name, userRole: user.role }
      );
    } catch (notificationErr) {
      console.error('Failed to create notification:', notificationErr);
    }
    
    const token = signToken(user);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log('[Login Attempt] Username:', username, 'Role:', role);
    if (!username || !password) {
      return res.status(400).json({ success: false, msg: 'Username and password required' });
    }
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      console.log('[Login Failed] User not found for username:', username);
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
    console.log('[Login Found User] User:', user._id, 'Role:', user.role, 'Has Password:', !!user.password);
    if (!user.password) {
      console.log('[Login Failed] User has no password field');
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
    const passwordMatch = await user.matchPassword(password).catch((e) => {
      console.log('[Login Error] matchPassword threw:', e);
      return false;
    });
    if (!passwordMatch) {
      console.log('[Login Failed] Password mismatch');
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
    if (role && user.role !== role) {
      console.log('[Login Failed] Role mismatch:', role, 'vs', user.role);
      return res.status(403).json({ success: false, msg: `Invalid role for this account` });
    }
    const token = signToken(user);
    console.log('[Login Success] User:', user._id, 'Token generated');
    res.json({ success: true, token, user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[Login Error] Full:', err);
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

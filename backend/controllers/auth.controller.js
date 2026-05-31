const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
  const expire = process.env.JWT_EXPIRE || '7d';
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    secret,
    { expiresIn: expire }
  );
};

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async (to, subject, text) => {
  console.log('Sending email to:', to);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@igansfood.com',
      to,
      subject,
      text
    });
    console.log('Email sent:', info.response);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail) return res.status(400).json({ success: false, msg: 'Email already registered' });
    if (existingUsername) return res.status(400).json({ success: false, msg: 'Username already taken' });
    // Only allow staff, kitchen, and admin roles
    const safeRole = ['staff', 'kitchen', 'admin'].includes(role) ? role : 'staff';
    const user = await User.create({ name, username, email, password, role: safeRole });
    const token = signToken(user);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, msg: 'Username and password required' });
    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, msg: `Account role is '${user.role}', not '${role}'` });
    }
    const token = signToken(user);
    res.json({ success: true, token, user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
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

exports.initiateForgotPassword = async (req, res) => {
  try {
    const { username, role } = req.body;
    if (!username) return res.status(400).json({ success: false, msg: 'Username is required' });

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, msg: 'No account found with this username' });
    }
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, msg: `Account role is '${user.role}', not '${role}'` });
    }

    res.json({
      success: true,
      maskedEmail: maskEmail(user.email),
      email: user.email,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email, userId } = req.body;
    if (!email || !userId) return res.status(400).json({ success: false, msg: 'Email and user ID are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY || '10');
    const cooldownMinutes = 1;

    const recentOTP = await OTP.findOne({
      userId,
      createdAt: { $gte: new Date(Date.now() - cooldownMinutes * 60 * 1000) }
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        msg: `Please wait ${cooldownMinutes} minute before requesting a new OTP`
      });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

    await OTP.create({
      userId,
      email,
      otp: otpCode,
      expiresAt
    });

    try {
      await sendEmail(
        email,
        'Your OTP for Password Reset',
        `Your OTP code is: ${otpCode}\nThis code will expire in ${otpExpiryMinutes} minutes.`
      );
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
    }

    res.json({ success: true, msg: 'OTP sent successfully', expiryMinutes: otpExpiryMinutes });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, userId } = req.body;
    if (!email || !otp || !userId) {
      return res.status(400).json({ success: false, msg: 'Email, OTP, and user ID are required' });
    }

    const maxAttempts = 5;

    const otpRecord = await OTP.findOne({
      userId,
      email,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, msg: 'OTP has expired or is invalid' });
    }

    otpRecord.attempts += 1;
    await otpRecord.save();

    if (otpRecord.attempts >= maxAttempts) {
      otpRecord.used = true;
      await otpRecord.save();
      return res.status(400).json({ success: false, msg: 'Too many attempts. Please request a new OTP' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, msg: 'Invalid OTP' });
    }

    otpRecord.used = true;
    await otpRecord.save();

    const resetToken = jwt.sign(
      { userId: userId, email: email },
      process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
      { expiresIn: '15m' }
    );

    res.json({ success: true, resetToken });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, msg: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, msg: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, msg: 'Password must be at least 6 characters long' });
    }

    const decoded = jwt.verify(
      resetToken,
      process.env.JWT_SECRET || 'fallback_secret_for_dev_only'
    );

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, msg: 'Password reset successfully' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, msg: 'Reset token is invalid or expired' });
    }
    res.status(500).json({ success: false, msg: err.message });
  }
};

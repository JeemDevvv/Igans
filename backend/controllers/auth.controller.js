const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
  const expire = process.env.JWT_EXPIRE || '7d';
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    secret,
    { expiresIn: expire }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail) return res.status(400).json({ success: false, msg: 'Email already registered' });
    if (existingUsername) return res.status(400).json({ success: false, msg: 'Username already registered' });
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
      return res.status(403).json({ success: false, msg: `Invalid role for this account` });
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

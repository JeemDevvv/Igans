const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  verifyUserForReset, 
  sendOTP, 
  verifyOTP, 
  resetPassword 
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Forgot Password Routes
router.post('/verify-user', verifyUserForReset);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
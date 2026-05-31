// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, initiateForgotPassword, sendOTP, verifyOTP, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password/initiate', initiateForgotPassword);
router.post('/forgot-password/send-otp', sendOTP);
router.post('/forgot-password/verify-otp', verifyOTP);
router.post('/forgot-password/reset', resetPassword);
module.exports = router;

const mongoose = require('mongoose');
const QRCode = require('qrcode');

const PublicQRSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Take-Out QR' },
  qrCodeValue: { type: String },
  qrCodeImage: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PublicQR', PublicQRSchema);

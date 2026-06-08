const mongoose = require('mongoose');
const PublicQRSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Take-Out QR' },
  qrCodeValue: { type: String },
  qrCodeImage: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'publicqrs' });
module.exports = mongoose.model('PublicQR', PublicQRSchema);

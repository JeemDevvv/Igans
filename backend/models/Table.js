const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  qrCodeValue: { type: String },
  qrCodeImage: { type: String },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Table', TableSchema);

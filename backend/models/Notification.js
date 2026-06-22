const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['payment', 'order', 'system'], default: 'order' },
  read: { type: Boolean, default: false },
  metadata: { type: Object, default: {} } // To store order ID, table number, etc.
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

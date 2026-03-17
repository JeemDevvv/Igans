const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String },
  tableNumber: { type: Number, default: null },
  orderType: { type: String, enum: ['dine-in', 'take-out'], required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending'
  },
  specialRequests: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);

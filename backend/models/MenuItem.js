const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  orderCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

MenuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', MenuItemSchema);

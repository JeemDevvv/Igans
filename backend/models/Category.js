const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, default: '🍽️' },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'categories' });
module.exports = mongoose.model('Category', CategorySchema);

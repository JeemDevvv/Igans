const mongoose = require('mongoose');

const RestaurantSettingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'La Maison Restaurant' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  allowedRadiusMeters: { type: Number, default: 200 },
  openHours: { type: String, default: '10:00 AM - 10:00 PM' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  currency: { type: String, default: '₱' }
});

module.exports = mongoose.model('RestaurantSettings', RestaurantSettingsSchema);

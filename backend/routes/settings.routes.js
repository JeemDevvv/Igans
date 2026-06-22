const express = require('express');
const router = express.Router();
const RestaurantSettings = require('../models/RestaurantSettings');
const { protect } = require('../middleware/auth.middleware');
const { allow } = require('../middleware/role.middleware');
const { createNotification } = require('../controllers/notification.controller');
router.get('/', async (req, res) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({
        restaurantName: 'Igans Budbod House',
        latitude: 14.5995,
        longitude: 120.9842,
        allowedRadiusMeters: 500,
        address: 'Antipolo, Rizal, Philippines',
        phone: '+63 912 345 6789'
      });
    }
    res.json({ success: true, data: settings });
  } catch (err) { res.status(500).json({ success: false, msg: err.message }); }
});
router.put('/', protect, allow('admin'), async (req, res) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) settings = new RestaurantSettings();
    
    // Track changes for notification
    const oldSettings = settings.toObject();
    Object.assign(settings, req.body);
    await settings.save();
    
    // Build notification message
    const adminName = req.user?.name || 'Admin';
    let changes = [];
    if (oldSettings.restaurantName !== settings.restaurantName) changes.push('restaurant name');
    if (oldSettings.latitude !== settings.latitude || oldSettings.longitude !== settings.longitude) changes.push('latitude/longitude');
    if (oldSettings.allowedRadiusMeters !== settings.allowedRadiusMeters) changes.push('allowed radius');
    if (oldSettings.address !== settings.address) changes.push('address');
    if (oldSettings.phone !== settings.phone) changes.push('phone');
    
    if (changes.length > 0) {
      let changeText = changes.join(', ');
      await createNotification(
        'Settings Updated',
        `${adminName} changed restaurant settings: ${changeText}`,
        'system',
        { changes: changes }
      );
    }
    
    res.json({ success: true, data: settings });
  } catch (err) { res.status(400).json({ success: false, msg: err.message }); }
});
module.exports = router;
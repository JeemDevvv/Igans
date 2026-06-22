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
    console.log('DEBUG settings route: req.body =', req.body);
    console.log('DEBUG settings route: req.user =', req.user);
    
    let settings = await RestaurantSettings.findOne();
    if (!settings) settings = new RestaurantSettings();
    
    // Track changes for notification
    const oldSettings = settings.toObject();
    console.log('DEBUG settings route: oldSettings =', oldSettings);
    
    Object.assign(settings, req.body);
    await settings.save();
    
    console.log('DEBUG settings route: newSettings =', settings.toObject());
    
    // Build notification message
    const adminName = req.user?.name || 'Admin';
    let changes = [];
    if (oldSettings.restaurantName !== settings.restaurantName) changes.push('restaurant name');
    if (oldSettings.latitude !== settings.latitude || oldSettings.longitude !== settings.longitude) changes.push('latitude/longitude');
    if (oldSettings.allowedRadiusMeters !== settings.allowedRadiusMeters) changes.push('allowed radius');
    if (oldSettings.address !== settings.address) changes.push('address');
    if (oldSettings.phone !== settings.phone) changes.push('phone');
    
    console.log('DEBUG settings route: changes detected =', changes);
    
    if (changes.length > 0) {
      let changeText = changes.join(', ');
      console.log('DEBUG settings route: creating notification for changes:', changeText);
      const notification = await createNotification(
        'Settings Updated',
        `${adminName} changed restaurant settings: ${changeText}`,
        'system',
        { changes: changes }
      );
      console.log('DEBUG settings route: notification created =', notification);
    } else {
      console.log('DEBUG settings route: no changes detected');
    }
    
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('DEBUG settings route: error =', err);
    res.status(400).json({ success: false, msg: err.message });
  }
});
module.exports = router;
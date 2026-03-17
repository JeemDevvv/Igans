const express = require('express');
const router = express.Router();
const RestaurantSettings = require('../models/RestaurantSettings');
const { protect } = require('../middleware/auth.middleware');
const { allow } = require('../middleware/role.middleware');

router.get('/', async (req, res) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({
        restaurantName: 'La Maison Restaurant',
        latitude: 14.5995,
        longitude: 120.9842,
        allowedRadiusMeters: 500,
        address: '123 Food Street, Manila',
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
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) { res.status(400).json({ success: false, msg: err.message }); }
});

module.exports = router;

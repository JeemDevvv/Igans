const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Table = require('../models/Table');
const { protect } = require('../middleware/auth.middleware');
const { allow } = require('../middleware/role.middleware');

router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (err) { res.status(500).json({ success: false, msg: err.message }); }
});

router.get('/:tableNum', async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNum });
    if (!table) return res.status(404).json({ success: false, msg: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (err) { res.status(500).json({ success: false, msg: err.message }); }
});

router.post('/', protect, allow('admin'), async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    
    // Determine base URL dynamically if possible, or use env variable
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl || baseUrl.includes('localhost')) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      baseUrl = `${protocol}://${req.get('host')}`;
    }
    
    const url = `${baseUrl}/verify.html?table=${tableNumber}`;
    const qrCodeImage = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } });
    const table = await Table.create({ tableNumber, capacity: capacity || 4, qrCodeValue: url, qrCodeImage });
    res.status(201).json({ success: true, data: table });
  } catch (err) { res.status(400).json({ success: false, msg: err.message }); }
});

router.get('/qr/:tableNum', protect, allow('admin'), async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNum });
    if (!table) return res.status(404).json({ success: false, msg: 'Table not found' });

    // Dynamically check if URL matches current host, regenerate if needed
    let currentBaseUrl = process.env.BASE_URL;
    if (!currentBaseUrl || currentBaseUrl.includes('localhost')) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      currentBaseUrl = `${protocol}://${req.get('host')}`;
    }

    if (!table.qrCodeValue.startsWith(currentBaseUrl)) {
      const newUrl = `${currentBaseUrl}/verify.html?table=${table.tableNumber}`;
      const newQrImage = await QRCode.toDataURL(newUrl, { width: 300, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } });
      
      table.qrCodeValue = newUrl;
      table.qrCodeImage = newQrImage;
      await table.save();
    }

    res.json({ success: true, qrCodeImage: table.qrCodeImage, url: table.qrCodeValue });
  } catch (err) { res.status(500).json({ success: false, msg: err.message }); }
});

router.delete('/:id', protect, allow('admin'), async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: 'Table deleted' });
  } catch (err) { res.status(500).json({ success: false, msg: err.message }); }
});

module.exports = router;

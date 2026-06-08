const PublicQR = require('../models/PublicQR');
const QRCode = require('qrcode');
exports.createPublicQR = async (req, res) => {
  try {
    const { name } = req.body;
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl || baseUrl.includes('localhost')) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      baseUrl = `${protocol}://${host}`;
    }
    const qr = new PublicQR({ name: name || 'Take-Out QR' });
    const qrUrl = `${baseUrl}/verify.html?type=takeout&id=${qr._id}`;
    const qrImage = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2 });
    qr.qrCodeValue = qrUrl;
    qr.qrCodeImage = qrImage;
    await qr.save();
    res.status(201).json({ success: true, data: qr });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.getAllPublicQRs = async (req, res) => {
  try {
    const qrs = await PublicQR.find().sort({ createdAt: -1 });
    res.json({ success: true, data: qrs });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.getPublicQRById = async (req, res) => {
  try {
    const qr = await PublicQR.findById(req.params.id);
    if (!qr) return res.status(404).json({ success: false, msg: 'QR not found' });
    res.json({ success: true, data: qr });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.deletePublicQR = async (req, res) => {
  try {
    const qr = await PublicQR.findByIdAndDelete(req.params.id);
    if (!qr) return res.status(404).json({ success: false, msg: 'QR not found' });
    res.json({ success: true, msg: 'QR deleted' });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

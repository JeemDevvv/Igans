const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ success: false, message: 'Error getting notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ success: true, data: notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ success: false, message: 'Error marking notification as read' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ success: false, message: 'Error marking all notifications as read' });
  }
};

const createQrScanNotification = async (req, res) => {
  try {
    const { tableNumber, type } = req.body;
    let title = '';
    let message = '';
    
    if (type === 'takeout') {
      title = 'Take-Out QR Scanned';
      message = 'Customer scanned Take-Out QR code';
    } else if (tableNumber) {
      title = 'QR Code Scanned';
      message = `Customer scanned the QR Code Table ${tableNumber}`;
    }
    
    if (title && message) {
      await createNotification(title, message, 'system', { tableNumber, type });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error creating QR scan notification:', err);
    res.status(500).json({ success: false, msg: 'Error creating notification' });
  }
};

// Create a notification (internal use)
const createNotification = async (title, message, type = 'order', metadata = {}) => {
  try {
    const notification = new Notification({ title, message, type, metadata });
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  createQrScanNotification
};

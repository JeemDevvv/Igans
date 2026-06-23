const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { allow } = require('../middleware/role.middleware');
const notificationController = require('../controllers/notification.controller');

// Get all notifications (only staff, kitchen, admin)
router.get('/', protect, allow('admin', 'staff', 'kitchen'), notificationController.getNotifications);

// Mark a notification as read (only staff, kitchen, admin)
router.patch('/:id/read', protect, allow('admin', 'staff', 'kitchen'), notificationController.markAsRead);

// Mark all as read (only staff, kitchen, admin)
router.patch('/read-all', protect, allow('admin', 'staff', 'kitchen'), notificationController.markAllAsRead);

// Create QR scan notification (public, but we'll add validation)
router.post('/qr-scan', notificationController.createQrScanNotification);

module.exports = router;

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Get all notifications
router.get('/', notificationController.getNotifications);

// Mark a notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// Create QR scan notification
router.post('/qr-scan', notificationController.createQrScanNotification);

module.exports = router;

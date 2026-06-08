const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { allow } = require('../middleware/role.middleware');
const {
  createOrder, getAllOrders, getMyOrders,
  getOrder, updateStatus
} = require('../controllers/order.controller');

router.post('/', optionalAuth, createOrder);
router.get('/', protect, allow('admin', 'staff', 'kitchen'), getAllOrders);
router.get('/mine', optionalAuth, getMyOrders);
router.get('/:id', optionalAuth, getOrder);
router.patch('/:id/status', protect, allow('admin', 'staff', 'kitchen'), updateStatus);

module.exports = router;

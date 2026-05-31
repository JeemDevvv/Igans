const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { allow } = require('../middleware/role.middleware');
const {
  createReview,
  getAllReviews,
  deleteReview,
  getItemReviews
} = require('../controllers/review.controller');

// Customer routes
router.post('/', optionalAuth, createReview);
router.get('/', optionalAuth, getAllReviews); // Allow guests to check if order was reviewed
router.get('/menu-item/:menuItemId', getItemReviews);
// Admin routes
router.delete('/:id', protect, allow('admin'), deleteReview);

module.exports = router;

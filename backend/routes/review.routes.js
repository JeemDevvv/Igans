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
router.post('/', optionalAuth, createReview);
router.get('/', optionalAuth, getAllReviews);
router.get('/menu-item/:menuItemId', getItemReviews);
router.delete('/:id', protect, allow('admin'), deleteReview);
module.exports = router;
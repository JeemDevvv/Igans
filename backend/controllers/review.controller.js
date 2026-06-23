const Review = require('../models/Review');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
exports.createReview = async (req, res) => {
  try {
    const { orderId, rating, comment, sessionId } = req.body;

    // Validate input
    if (!orderId) {
      return res.status(400).json({ success: false, msg: 'Order ID is required' });
    }
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, msg: 'Rating must be a number between 1 and 5' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, msg: 'Order not found' });
    if (order.status !== 'served') {
      return res.status(400).json({ success: false, msg: 'Only served orders can be reviewed' });
    }

    // Check if user is authorized to review this order
    const isOrderOwner = req.user?.id && order.customer?.toString() === req.user.id;
    const hasValidSession = !req.user?.id && sessionId && order.sessionId === sessionId;
    if (!isOrderOwner && !hasValidSession) {
      return res.status(403).json({ success: false, msg: 'Not authorized to review this order' });
    }

    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ success: false, msg: 'This order has already been reviewed' });
    }
    const review = await Review.create({
      order: orderId,
      customer: req.user?.id || null,
      sessionId: sessionId || req.user?.id || 'guest',
      rating: parsedRating,
      comment: comment?.trim() || ''
    });
    for (const item of order.items) {
      if (item.menuItem) {
        const itemReviews = await Review.find({
          order: { $in: await Order.find({ 'items.menuItem': item.menuItem }).distinct('_id') }
        });
        const totalRating = itemReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / (itemReviews.length || 1);
        await MenuItem.findByIdAndUpdate(item.menuItem, {
          avgRating: parseFloat(avgRating.toFixed(1)),
          reviewCount: itemReviews.length
        });
      }
    }
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.getAllReviews = async (req, res) => {
  try {
    const { rating, date, menuItemId, orderId, limit } = req.query;
    let query = {};
    if (rating) query.rating = parseInt(rating);
    if (orderId) query.order = orderId;
    if (date) {
      const d = new Date(date);
      query.createdAt = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    if (menuItemId) {
      const orderIds = await Order.find({ 'items.menuItem': menuItemId }).distinct('_id');
      query.order = { $in: orderIds };
    }
    const isAdmin = req.user?.role === 'admin';
    const hasLimit = limit !== undefined;
    if (!isAdmin && !orderId && !menuItemId && !hasLimit) {
      return res.status(403).json({ success: false, msg: 'Unauthorized' });
    }
    let reviewsQuery = Review.find(query)
      .populate('customer', 'name')
      .populate({
        path: 'order',
        select: 'orderNumber items'
      })
      .sort({ createdAt: -1 });
    if (limit) {
      reviewsQuery = reviewsQuery.limit(parseInt(limit));
    }
    const reviews = await reviewsQuery;
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, msg: 'Review not found' });
    res.json({ success: true, msg: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.getItemReviews = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const orderIds = await Order.find({ 'items.menuItem': menuItemId }).distinct('_id');
    const reviews = await Review.find({ order: { $in: orderIds } })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
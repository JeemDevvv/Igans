const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, orderType, items, specialRequests, sessionId } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, msg: 'No items in order' });
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create({
      customer: req.user?.id || null,
      sessionId: sessionId || req.user?.id || 'guest',
      tableNumber: tableNumber || null,
      orderType,
      items,
      totalAmount: parseFloat(total.toFixed(2)),
      specialRequests: specialRequests || ''
    });
    // Increment orderCount for each item
    for (const item of items) {
      if (item.menuItem) await MenuItem.findByIdAndUpdate(item.menuItem, { $inc: { orderCount: item.quantity } });
    }
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, orderType, tableNumber, date } = req.query;
    let query = {};
    if (status) query.status = { $in: status.split(',') };
    if (orderType) query.orderType = orderType;
    if (tableNumber) query.tableNumber = parseInt(tableNumber);
    if (date) {
      const d = new Date(date);
      query.createdAt = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    const orders = await Order.find(query).populate('customer', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const sessionId = req.query.sessionId || req.user?.id;
    let query = {};
    if (req.user?.id) query.customer = req.user.id;
    else query.sessionId = sessionId;
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    if (!order) return res.status(404).json({ success: false, msg: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, msg: 'Invalid status' });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, msg: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

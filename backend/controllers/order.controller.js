const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { createNotification } = require('./notification.controller');
exports.createOrder = async (req, res) => {
  try {
    console.log('DEBUG order.controller.js: req.body:', req.body);
    const { tableNumber, orderType, items, specialRequests, sessionId, customerName, orderSource } = req.body;
    console.log('DEBUG order.controller.js: tableNumber:', tableNumber, 'typeof tableNumber:', typeof tableNumber);
    if (!items || items.length === 0) return res.status(400).json({ success: false, msg: 'No items in order' });
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create({
      customer: req.user?.id || null,
      sessionId: sessionId || req.user?.id || 'guest',
      customerName: customerName || '',
      tableNumber: tableNumber !== undefined ? tableNumber : null,
      orderType,
      items,
      totalAmount: parseFloat(total.toFixed(2)),
      specialRequests: specialRequests || '',
      orderSource: orderSource || 'qr'
    });
    for (const item of items) {
      if (item.menuItem) await MenuItem.findByIdAndUpdate(item.menuItem, { $inc: { orderCount: item.quantity } });
    }
    
    // Create notification for order placed
    let orderTitle = '';
    let orderMessage = '';
    
    if (orderSource === 'staff') {
      if (orderType === 'dine-in') {
        if (tableNumber !== null && tableNumber !== undefined) {
          orderTitle = 'New Walk-In Order';
          orderMessage = 'Staff made a Walk-In Order';
        } else {
          orderTitle = 'New Walk-In Order';
          orderMessage = 'Staff made a Walk-In Order';
        }
      } else {
        orderTitle = 'New Take-Out Order';
        orderMessage = 'Staff made a Take-Out Order';
      }
    } else {
      // QR order from customer
      if (orderType === 'dine-in') {
        orderTitle = 'New Dine-In Order';
        orderMessage = `Table ${tableNumber} placed an order`;
      } else {
        orderTitle = 'New Take-Out Order';
        orderMessage = 'Take-Out order placed';
      }
    }
    
    await createNotification(orderTitle, orderMessage, 'order', { orderId: order._id, orderNumber: order.orderNumber });
    
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, msg: 'Order not found' });
    if (order.status === 'served') {
      return res.status(400).json({ success: false, msg: 'Cannot modify a served order' });
    }
    if (order.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ success: false, msg: 'Cannot reactivate a cancelled order' });
    }
    order.status = status;
    order.updatedAt = new Date();
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, msg: 'Order not found' });
    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, msg: 'Cannot mark a cancelled order as paid' });
    }
    order.paid = true;
    order.updatedAt = new Date();
    await order.save();
    
    // Create notification for payment received
    const paymentTitle = 'Payment Received';
    const paymentMessage = order.orderType === 'dine-in' 
      ? `Customer Table ${order.tableNumber} Paid` 
      : 'Take-Out order Paid';
    await createNotification(paymentTitle, paymentMessage, 'payment', { orderId: order._id, orderNumber: order.orderNumber });
    
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.getOrdersWithTotals = async (req, res) => {
  try {
    const { status, orderType, tableNumber, date } = req.query;
    let query = { status: { $ne: 'cancelled' } };
    if (status) query.status = { $in: status.split(',') };
    if (orderType) query.orderType = orderType;
    if (tableNumber) query.tableNumber = parseInt(tableNumber);
    if (date) {
      const d = new Date(date);
      query.createdAt = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    const orders = await Order.find(query).populate('customer', 'name email').sort({ createdAt: -1 });
    const totalItems = orders.reduce((sum, o) => {
      if (!o.items) return sum;
      return sum + o.items.reduce((s, i) => {
        if (!i.quantity) return s;
        return s + i.quantity;
      }, 0);
    }, 0);
    const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    res.json({ 
      success: true, 
      count: orders.length, 
      data: orders, 
      totals: { totalItems, totalAmount: parseFloat(totalAmount.toFixed(2)) } 
    });
  } catch (err) {
    console.error('getOrdersWithTotals error:', err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

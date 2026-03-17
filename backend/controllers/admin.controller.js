const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

exports.getStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const todayOrders = await Order.find({ createdAt: { $gte: today, $lt: tomorrow } });
    const allOrders = await Order.find({ status: { $ne: 'cancelled' } });

    const todayRevenue = todayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
    const totalRevenue = allOrders.reduce((s, o) => s + o.totalAmount, 0);

    // Top items
    const itemMap = {};
    allOrders.forEach(o => o.items.forEach(i => {
      itemMap[i.name] = (itemMap[i.name] || 0) + i.quantity;
    }));
    const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

    // Daily sales last 7 days
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const dayOrders = await Order.find({ createdAt: { $gte: d, $lt: next }, status: { $ne: 'cancelled' } });
      const revenue = dayOrders.reduce((s, o) => s + o.totalAmount, 0);
      dailySales.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: parseFloat(revenue.toFixed(2)), count: dayOrders.length });
    }

    // Status breakdown
    const statusCounts = { pending: 0, preparing: 0, ready: 0, served: 0, cancelled: 0 };
    const allWithCancelled = await Order.find({});
    allWithCancelled.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOrdersCount = await Order.countDocuments();

    res.json({
      success: true,
      data: {
        todayOrders: todayOrders.length,
        todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders: totalOrdersCount,
        totalCustomers: totalUsers,
        topItems,
        dailySales,
        statusCounts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

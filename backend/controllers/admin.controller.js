const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const { getActiveCount } = require('../utils/activeCustomers');
exports.getStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const todayOrders = await Order.find({ createdAt: { $gte: today, $lt: tomorrow } });
    const allOrders = await Order.find({ status: { $ne: 'cancelled' } });
    const todayRevenue = todayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
    const totalRevenue = allOrders.reduce((s, o) => s + o.totalAmount, 0);
    const existingMenuItems = await MenuItem.find({}, 'name');
    const existingNames = new Set(existingMenuItems.map(item => item.name));
    const itemMap = {};
    allOrders.forEach(o => o.items.forEach(i => {
      if (existingNames.has(i.name)) {
        itemMap[i.name] = (itemMap[i.name] || 0) + i.quantity;
      }
    }));
    const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayOrders = await Order.find({ 
        createdAt: { $gte: dayStart, $lt: dayEnd }, 
        status: { $ne: 'cancelled' } 
      });
      const dayRevenue = dayOrders.reduce((s, o) => s + o.totalAmount, 0);
      dailySales.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(dayRevenue.toFixed(2))
      });
    }
    const reports = await generateGeneralReports();
    const statusCounts = { pending: 0, preparing: 0, ready: 0, served: 0, cancelled: 0 };
    const allWithCancelled = await Order.find({});
    allWithCancelled.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });
    res.json({
      success: true,
      data: {
        todayOrders: todayOrders.length,
        todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders: allOrders.length,
        totalCustomers: getActiveCount(),
        topItems,
        dailySales,
        reports,
        statusCounts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
async function generateGeneralReports() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const monthly = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(currentYear, m, 1);
    const end = new Date(currentYear, m + 1, 0, 23, 59, 59);
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end }, status: 'served' });
    monthly.push({
      month: start.toLocaleString('default', { month: 'short' }),
      revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
      count: orders.length
    });
  }
  const quarterly = [];
  for (let q = 0; q < 4; q++) {
    const startMonth = q * 3;
    const start = new Date(currentYear, startMonth, 1);
    const end = new Date(currentYear, startMonth + 3, 0, 23, 59, 59);
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end }, status: 'served' });
    quarterly.push({
      quarter: `Q${q + 1}`,
      revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
      count: orders.length
    });
  }
  return { monthly, quarterly };
}
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
exports.updateUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    const updateData = { name, username, email, role };
    if (password && password.length >= 6) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 12);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

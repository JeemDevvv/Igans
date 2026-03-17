const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

exports.getAll = async (req, res) => {
  try {
    const { category, search, available, featured, bestSeller, sort } = req.query;
    let query = {};
    if (available !== undefined) query.available = available === 'true';
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'popular') sortObj = { orderCount: -1 };
    const items = await MenuItem.find(query).populate('category').sort(sortObj);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category');
    if (!item) return res.status(404).json({ success: false, msg: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, msg: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ sortOrder: 1 });
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

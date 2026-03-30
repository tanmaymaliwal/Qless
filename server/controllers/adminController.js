const User = require('../models/User');
const College = require('../models/College');
const Cafe = require('../models/Cafe');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const bcrypt = require('bcryptjs');

// GET /api/super/colleges
exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    res.json({ success: true, colleges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/super/colleges
exports.createCollege = async (req, res) => {
  try {
    const { name, code, address, plan } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required' });
    const existing = await College.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: 'College code already exists' });
    const college = await College.create({ name, code, address, plan });
    res.status(201).json({ success: true, college });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/super/colleges/:id/toggle
exports.toggleCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    college.isActive = !college.isActive;
    await college.save();
    res.json({ success: true, college });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/super/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'super_admin' } })
      .populate('college', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/super/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, collegeCode, cafeId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    let college = null;
    if (collegeCode) {
      college = await College.findOne({ code: collegeCode.toUpperCase() });
    }
    const user = await User.create({
      name, email, password, phone,
      role: role || 'college_admin',
      college: college?._id,
      cafe: cafeId || null,
    });
    if (role === 'student') {
      await Wallet.create({ user: user._id, balance: 0 });
    }
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/super/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/super/cafes
exports.getCafes = async (req, res) => {
  try {
    const cafes = await Cafe.find()
      .populate('college', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, cafes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/super/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('cafe', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
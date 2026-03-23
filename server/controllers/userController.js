const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');

// @route  GET /api/users/wallet
// @access Private (student)
exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found',
      });
    }
    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/users/wallet/add
// @access Private (student)
exports.addToWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // ✅ Max single top up limit
    if (amount > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum top up amount is ₹5000 at once',
      });
    }

    // ✅ Check current balance
    const currentWallet = await Wallet.findOne({ user: req.user.id });
    if (!currentWallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found',
      });
    }

    // ✅ Max wallet balance limit
    if (currentWallet.balance + amount > 10000) {
      return res.status(400).json({
        success: false,
        message: `Maximum wallet balance is ₹10000. Current balance: ₹${currentWallet.balance}`,
      });
    }

    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user.id },
      {
        $inc: { balance: amount },
        $push: {
          transactions: {
            type: 'credit',
            amount,
            description: 'Wallet top up',
          },
        },
      },
      { new: true }
    );

    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

// @route  GET /api/users/expenses
// @access Private (student)
exports.getExpenses = async (req, res) => {
  try {
    const { period } = req.query;

    const now = new Date();
    let startDate;

    if (period === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const orders = await Order.find({
      student: req.user.id,
      paymentStatus: 'paid',
      createdAt: { $gte: startDate },
    }).populate('cafe', 'name');

    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      success: true,
      orders,
      totalSpent,
      period,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
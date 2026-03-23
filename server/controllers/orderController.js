const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Cafe = require('../models/Cafe');
const Wallet = require('../models/Wallet');
const { generateQRToken, generateQRCode } = require('../utils/generateQR');

// @route  POST /api/orders
// @access Private (student)
exports.placeOrder = async (req, res) => {
  try {
    const { cafeId, items, scheduledTime, paymentMethod } = req.body;

    if (!cafeId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide cafe and items',
      });
    }

    // Check cafe exists and is active
    const cafe = await Cafe.findById(cafeId);
    if (!cafe || !cafe.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found or inactive',
      });
    }

    // ✅ Check cafe belongs to same college as student
    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only order from your college cafes',
      });
    }

    // ✅ Check cafe is open right now
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (currentTime < cafe.openTime || currentTime > cafe.closeTime) {
      return res.status(400).json({
        success: false,
        message: `Cafe is closed. Open from ${cafe.openTime} to ${cafe.closeTime}`,
      });
    }

    // Build order items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item not found`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is not available right now`,
        });
      }

      // ✅ Check menu item belongs to correct cafe
      if (menuItem.cafe.toString() !== cafeId) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} does not belong to this cafe`,
        });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });

      totalAmount += menuItem.price * item.quantity;
    }

    // ✅ Atomic wallet deduction
    // Checks balance AND deducts in single operation
    // Prevents race condition
    if (!paymentMethod || paymentMethod === 'wallet') {
      const wallet = await Wallet.findOneAndUpdate(
        {
          user: req.user.id,
          balance: { $gte: totalAmount }, // ✅ only update if balance is enough
        },
        {
          $inc: { balance: -totalAmount },
          $push: {
            transactions: {
              type: 'debit',
              amount: totalAmount,
              description: `Order at ${cafe.name}`,
            },
          },
        },
        { new: true }
      );

      // ✅ If wallet is null → balance was insufficient
      if (!wallet) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance',
        });
      }
    }

    // Generate QR
    const qrToken = generateQRToken();
    const qrCode = await generateQRCode({
      qrToken,
      cafeId,
      studentId: req.user.id,
      totalAmount,
    });

    // Create order
    const order = await Order.create({
      student: req.user.id,
      cafe: cafeId,
      college: req.user.college,
      items: orderItems,
      totalAmount,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'wallet',
      qrCode,
      qrToken,
      scheduledTime,
    });

    await order.populate('cafe', 'name location');

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error'
    });
  }
};

// @route  GET /api/orders/my
// @access Private (student)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user.id })
      .populate('cafe', 'name location')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error'
    });
  }
};

// @route  GET /api/orders/:id
// @access Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cafe', 'name location')
      .populate('student', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error'
    });
  }
};

// @route  GET /api/orders/cafe/:cafeId
// @access Private (cafe_admin)
exports.getCafeOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { cafe: req.params.cafeId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('student', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({ 
      success: true, 
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error'
    });
  }
};

// @route  PUT /api/orders/:id/status
// @access Private (cafe_admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'confirmed', 
      'preparing', 
      'ready', 
      'delivered', 
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'delivered' && { deliveredAt: new Date() }),
      },
      { new: true }
    ).populate('student', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error'
    });
  }
};

// @route  POST /api/orders/scan
// @access Private (cafe_admin)
exports.scanQR = async (req, res) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        message: 'QR token is required',
      });
    }

    const order = await Order.findOne({ qrToken })
      .populate('student', 'name email phone')
      .populate('cafe', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code',
      });
    }

    // ✅ Check all invalid statuses
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order already delivered',
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order was cancelled',
      });
    }

    // ✅ Check QR token expiry
    const orderAge = (new Date() - new Date(order.createdAt)) / 1000 / 60 / 60;
    if (orderAge > 24) {
      return res.status(400).json({
        success: false,
        message: 'QR code has expired',
      });
    }

    // Mark as delivered
    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order marked as delivered',
      order,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error'
    });
  }
};

// @route  PUT /api/orders/:id/cancel
// @access Private (student)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled',
      });
    }

    // ✅ Atomic refund to wallet
    await Wallet.findOneAndUpdate(
      { user: req.user.id },
      {
        $inc: { balance: order.totalAmount },
        $push: {
          transactions: {
            type: 'credit',
            amount: order.totalAmount,
            description: 'Order cancelled - refund',
            orderId: order._id,
          },
        },
      }
    );

    order.status = 'cancelled';
    order.paymentStatus = 'refunded';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled and refund added to wallet',
      order,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error'
    });
  }
};


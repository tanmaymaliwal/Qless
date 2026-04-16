const Razorpay = require('razorpay');
const crypto = require('crypto');
const Wallet = require('../models/Wallet');

const razorpay = new Razorpay({
  
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// create Razorpay order
exports.createOrder = async (req, res) => {

  try {
    console.log(req.body);
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: req.user.id,
        purpose: 'wallet_topup',
      },
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {

  //   console.error("FULL ERROR:", error);
  // console.error("RAZORPAY RESPONSE:", error?.response?.data)
  
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify payment and add to wallet
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Add to wallet
    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user.id },
      {
        $inc: { balance: amount },
        $push: {
          transactions: {
            type: 'credit',
            amount,
            description: `Wallet recharge via Razorpay`,
            razorpayPaymentId: razorpay_payment_id,
          },
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment successful! Wallet updated.',
      balance: wallet.balance,
    });
  } catch (error) {
    
    res.status(500).json({ success: false, message: error.message });
  }
};
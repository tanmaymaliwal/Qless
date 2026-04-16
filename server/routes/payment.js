const router = require('express').Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-order', protect, authorize('student'), createOrder);
router.post('/verify', protect, authorize('student'), verifyPayment);

module.exports = router;
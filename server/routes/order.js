const router = require('express').Router();
const {
  placeOrder,
  getMyOrders,
  getOrder,
  getCafeOrders,
  updateOrderStatus,
  scanQR,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { orderValidator } = require('../middleware/validators');

router.post('/', protect, authorize('student'), orderValidator, validate, placeOrder);
router.get('/my', protect, authorize('student'), getMyOrders);
router.get('/:id', protect, getOrder);
router.get('/cafe/:cafeId', protect, authorize('cafe_admin', 'college_admin'), getCafeOrders);
router.put('/:id/status', protect, authorize('cafe_admin', 'college_admin'), updateOrderStatus);
router.post('/scan', protect, authorize('cafe_admin', 'college_admin'), scanQR);
router.put('/:id/cancel', protect, authorize('student'), cancelOrder);

module.exports = router;
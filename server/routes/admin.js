const router = require('express').Router();
const {
  getColleges,
  createCollege,
  toggleCollege,
  getUsers,
  createUser,
  toggleUser,
  getCafes,
  getOrders,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes protected — super_admin only
router.use(protect);
router.use(authorize('super_admin'));

// Colleges
router.get('/colleges', getColleges);
router.post('/colleges', createCollege);
router.put('/colleges/:id/toggle', toggleCollege);

// Users
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id/toggle', toggleUser);

// Cafes
router.get('/cafes', getCafes);

// Orders
router.get('/orders', getOrders);

module.exports = router;
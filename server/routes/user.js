const router = require('express').Router();
const {
  getWallet,
  addToWallet,
  getExpenses,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/wallet', protect, authorize('student'), getWallet);
router.post('/wallet/add', protect, authorize('student'), addToWallet);
router.get('/expenses', protect, authorize('student'), getExpenses);

module.exports = router;
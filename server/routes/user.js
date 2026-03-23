const router = require('express').Router();
const {
  getWallet,
  addToWallet,
  getExpenses,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { walletValidator } = require('../middleware/validators');

router.get('/wallet', protect, authorize('student'), getWallet);
router.post('/wallet/add', protect, authorize('student'), walletValidator, validate, addToWallet);
router.get('/expenses', protect, authorize('student'), getExpenses);

module.exports = router;
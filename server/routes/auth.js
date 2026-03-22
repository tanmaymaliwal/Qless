const router = require('express').Router();
const {
  register,
  login,
  getMe,
  registerAdmin,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/register-admin', registerAdmin);
router.get('/me', protect, getMe);

module.exports = router;
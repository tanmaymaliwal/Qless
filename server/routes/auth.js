const router = require('express').Router();
const {
  register,
  login,
  getMe,
  registerAdmin,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { 
  registerValidator, 
  loginValidator 
} = require('../middleware/validators');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/register-admin', registerValidator, validate, registerAdmin);
router.get('/me', protect, getMe);

module.exports = router;
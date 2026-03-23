const router = require('express').Router();
const {
  register,
  login,
  getMe,
  registerAdmin,
  logout,
  changePassword,
  getInviteCode,
  refreshInviteCode,
  refreshToken,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerValidator,
  loginValidator
} = require('../middleware/validators');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/register-admin', registerValidator, validate, registerAdmin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/password', protect, changePassword);
router.get('/invite-code', protect, authorize('college_admin', 'super_admin'), getInviteCode);
router.put('/invite-code/refresh', protect, authorize('college_admin', 'super_admin'), refreshInviteCode);
router.post('/refresh', refreshToken);

module.exports = router;
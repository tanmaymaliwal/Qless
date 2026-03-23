const router = require('express').Router();
const {
  getCafes,
  getCafe,
  createCafe,
  updateCafe,
  toggleCafe,
  deleteCafe,
} = require('../controllers/cafeController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { cafeValidator } = require('../middleware/validators');

router.get('/', protect, getCafes);
router.get('/:id', protect, getCafe);
router.post('/', protect, authorize('college_admin', 'super_admin'), cafeValidator, validate, createCafe);
router.put('/:id', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), cafeValidator, validate, updateCafe);
router.put('/:id/toggle', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), toggleCafe);
router.delete('/:id', protect, authorize('college_admin', 'super_admin'), deleteCafe);

module.exports = router;
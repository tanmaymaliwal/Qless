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

router.get('/', protect, getCafes);
router.get('/:id', protect, getCafe);
router.post('/', protect, authorize('college_admin', 'super_admin'), createCafe);
router.put('/:id', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), updateCafe);
router.put('/:id/toggle', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), toggleCafe);
router.delete('/:id', protect, authorize('college_admin', 'super_admin'), deleteCafe);

module.exports = router;
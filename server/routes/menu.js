const router = require('express').Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  toggleMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:cafeId', protect, getMenuItems);
router.get('/item/:id', protect, getMenuItem);
router.post('/:cafeId', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), createMenuItem);
router.put('/item/:id', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), updateMenuItem);
router.put('/item/:id/toggle', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), toggleMenuItem);
router.delete('/item/:id', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), deleteMenuItem);

module.exports = router;
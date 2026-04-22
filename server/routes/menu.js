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
const validate = require('../middleware/validate');
const { menuItemValidator } = require('../middleware/validators');


router.get('/item/:id', protect, getMenuItem);
router.post('/:cafeId', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), menuItemValidator, validate, createMenuItem);
router.put('/item/:id', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), menuItemValidator, validate, updateMenuItem);
router.put('/item/:id/toggle', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), toggleMenuItem);
router.delete('/item/:id', protect, authorize('cafe_admin', 'college_admin', 'super_admin'), deleteMenuItem);
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, items: [] });

    const MenuItem = require('../models/MenuItem');
    const items = await MenuItem.find({
      name: { $regex: q, $options: 'i' },
      isAvailable: true,
    }).populate('cafe', 'name location college');

    // Filter by student's college
    const collegeItems = items.filter(item =>
      item.cafe?.college?.toString() === req.user.college?.toString()
    );

    res.json({ success: true, items: collegeItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:cafeId', protect, getMenuItems);
module.exports = router;
const MenuItem = require('../models/MenuItem');
const Cafe = require('../models/Cafe');

// @route  GET /api/menu/:cafeId
// @access Private
exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ 
      cafe: req.params.cafeId 
    });

    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/menu/item/:id
// @access Private
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('cafe', 'name');

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/menu/:cafeId
// @access Private (cafe_admin, college_admin)
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isVeg, preparationTime } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, price and category' 
      });
    }

    const cafe = await Cafe.findById(req.params.cafeId);
    if (!cafe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cafe not found' 
      });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      isVeg,
      preparationTime,
      cafe: req.params.cafeId,
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/menu/item/:id
// @access Private (cafe_admin, college_admin)
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/menu/item/:id/toggle
// @access Private (cafe_admin, college_admin)
exports.toggleMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({ 
      success: true, 
      message: `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`,
      item 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  DELETE /api/menu/item/:id
// @access Private (cafe_admin, college_admin)
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    await item.deleteOne();

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
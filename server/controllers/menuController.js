const MenuItem = require('../models/MenuItem');
const Cafe = require('../models/Cafe');

exports.getMenuItems = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.cafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found',
      });
    }

    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this menu',
      });
    }

    const items = await MenuItem.find({
      cafe: req.params.cafeId,
      isDeleted: false,
    });

    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('cafe', 'name college');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    const cafe = await Cafe.findById(item.cafe);
    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this item',
      });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      isVeg, 
      preparationTime 
    } = req.body;

    const cafe = await Cafe.findById(req.params.cafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found',
      });
    }

    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add items to this cafe',
      });
    }

    if (
      req.user.role === 'cafe_admin' &&
      cafe.admin.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add items to this cafe',
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
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    const cafe = await Cafe.findById(item.cafe);

    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this item',
      });
    }

    if (
      req.user.role === 'cafe_admin' &&
      cafe.admin.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this item',
      });
    }

    delete req.body.cafe;

    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

exports.toggleMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    const cafe = await Cafe.findById(item.cafe);

    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to toggle this item',
      });
    }

    if (
      req.user.role === 'cafe_admin' &&
      cafe.admin.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to toggle this item',
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      success: true,
      message: `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    const cafe = await Cafe.findById(item.cafe);

    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item',
      });
    }

    if (
      req.user.role === 'cafe_admin' &&
      cafe.admin.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item',
      });
    }

    // ✅ Soft delete
    item.isDeleted = true;
    item.deletedAt = new Date();
    item.isAvailable = false;
    await item.save();

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};
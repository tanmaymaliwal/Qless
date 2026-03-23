const Cafe = require('../models/Cafe');

exports.getCafes = async (req, res) => {
  try {
    const cafes = await Cafe.find({
      college: req.user.college,
      isActive: true,
      isDeleted: false,
    }).populate('admin', 'name email');

    res.json({ success: true, cafes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

exports.getCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id)
      .populate('admin', 'name email');

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this cafe'
      });
    }

    res.json({ success: true, cafe });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

exports.createCafe = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      openTime,
      closeTime,
      maxOrdersPerSlot
    } = req.body;

    const cafe = await Cafe.create({
      name,
      description,
      location,
      openTime,
      closeTime,
      maxOrdersPerSlot,
      college: req.user.college,
      admin: req.user.id,
    });

    res.status(201).json({ success: true, cafe });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

exports.updateCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this cafe'
      });
    }

    if (
      req.user.role === 'cafe_admin' &&
      cafe.admin.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this cafe'
      });
    }

    delete req.body.college;
    delete req.body.admin;

    const updated = await Cafe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, cafe: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Server error',
    });
  }
};

exports.toggleCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to toggle this cafe'
      });
    }

    if (
      req.user.role === 'cafe_admin' &&
      cafe.admin.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to toggle this cafe'
      });
    }

    cafe.isActive = !cafe.isActive;
    await cafe.save();

    res.json({
      success: true,
      message: `Cafe is now ${cafe.isActive ? 'active' : 'inactive'}`,
      cafe
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

exports.deleteCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this cafe'
      });
    }

    // ✅ Soft delete
    cafe.isDeleted = true;
    cafe.deletedAt = new Date();
    cafe.isActive = false;
    await cafe.save();

    res.json({
      success: true,
      message: 'Cafe deleted successfully'
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
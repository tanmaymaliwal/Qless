const Cafe = require('../models/Cafe');

// @route  GET /api/cafes
// @access Private
exports.getCafes = async (req, res) => {
  try {
    const cafes = await Cafe.find({
      college: req.user.college,
      isActive: true
    }).populate('admin', 'name email');

    res.json({ success: true, cafes });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Server error' 
    });
  }
};

// @route  GET /api/cafes/:id
// @access Private
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

    // ✅ Check cafe belongs to same college as user
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
        : 'Server error' 
    });
  }
};

// @route  POST /api/cafes
// @access Private (college_admin)
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

    // ✅ Always assign cafe to admin's own college
    const cafe = await Cafe.create({
      name,
      description,
      location,
      openTime,
      closeTime,
      maxOrdersPerSlot,
      college: req.user.college, // ✅ taken from token not request body
      admin: req.user.id,
    });

    res.status(201).json({ success: true, cafe });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Server error' 
    });
  }
};

// @route  PUT /api/cafes/:id
// @access Private (cafe_admin, college_admin)
exports.updateCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // ✅ Check cafe belongs to same college
    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this cafe'
      });
    }

    // ✅ Cafe admin can only edit their own cafe
    if (
      req.user.role === 'cafe_admin' &&
      cafe.admin.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this cafe'
      });
    }

    // ✅ Prevent changing college ownership
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
        : 'Server error' 
    });
  }
};

// @route  PUT /api/cafes/:id/toggle
// @access Private (cafe_admin, college_admin)
exports.toggleCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // ✅ Check cafe belongs to same college
    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to toggle this cafe'
      });
    }

    // ✅ Cafe admin can only toggle their own cafe
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
        : 'Server error' 
    });
  }
};

// @route  DELETE /api/cafes/:id
// @access Private (college_admin)
exports.deleteCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // ✅ Only college admin of same college can delete
    if (cafe.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this cafe'
      });
    }

    await cafe.deleteOne();

    res.json({ success: true, message: 'Cafe deleted' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Server error' 
    });
  }
};


// ### What We Fixed:

// Before:
// Admin from College A → edits College B cafe ❌

// After:
// ✅ Every operation checks cafe.college === user.college
// ✅ Cafe admin can only edit their OWN cafe
// ✅ College field cannot be changed via request body
// ✅ Admin field cannot be changed via request body
// ✅ Production error messages hidden
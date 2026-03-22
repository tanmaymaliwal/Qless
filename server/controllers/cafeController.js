const Cafe = require('../models/Cafe');
const College = require('../models/College');

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
    res.status(500).json({ success: false, message: error.message });
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

    res.json({ success: true, cafe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/cafes
// @access Private (college_admin)
exports.createCafe = async (req, res) => {
  try {
    const { name, description, location, openTime, closeTime, maxOrdersPerSlot } = req.body;

    if (!name || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name and location' 
      });
    }

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
    res.status(500).json({ success: false, message: error.message });
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

    const updated = await Cafe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, cafe: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    cafe.isActive = !cafe.isActive;
    await cafe.save();

    res.json({ 
      success: true, 
      message: `Cafe is now ${cafe.isActive ? 'active' : 'inactive'}`,
      cafe 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    await cafe.deleteOne();

    res.json({ success: true, message: 'Cafe deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
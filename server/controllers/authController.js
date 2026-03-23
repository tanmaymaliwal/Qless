const User = require('../models/User');
const Wallet = require('../models/Wallet');
const College = require('../models/College');
const jwt = require('jsonwebtoken');


const generateRefreshToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: '30d' }
  );
};
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, collegeCode } = req.body;

    if (!name || !email || !password || !collegeCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // ✅ Find college by invite code not college code
    const college = await College.findOne({
      inviteCode: collegeCode.toUpperCase(),
      isActive: true,
      inviteCodeExpiry: { $gt: new Date() }
    });

    if (!college) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invite code',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      college: college._id,
      role: 'student',
    });

    await Wallet.create({ user: user._id, balance: 0 });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: college.name,
        collegeId: college._id,
      },
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email })
      .select('+password')
      .populate('college', 'name code isActive plan');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account is deactivated',
      });
    }

    // ✅ Check college is active
    if (user.college && !user.college.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your college account is deactivated',
      });
    }

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college?.name,
        collegeId: user.college?._id,
        plan: user.college?.plan,
      },
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
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('college', 'name code logo');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, role, collegeCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    let college = null;
    if (collegeCode) {
      college = await College.findOne({ code: collegeCode.toUpperCase() });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'cafe_admin',
      college: college?._id,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }

 

};

 // @route  POST /api/auth/logout
// @access Private
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    // Get token expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiry = decoded.exp - Math.floor(Date.now() / 1000);

    // ✅ Blacklist token in Redis until it expires
    const redisClient = require('../config/redis');
    await redisClient.setEx(
      `blacklist:${token}`,
      expiry,
      'blacklisted'
    );

    res.json({
      success: true,
      message: 'Logged out successfully',
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

// @route  PUT /api/auth/password
// @access Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // ✅ Get user with password field
    const user = await User.findById(req.user.id).select('+password');

    // ✅ Check current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // ✅ Check new password is different
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    // ✅ Save triggers pre save hook which hashes password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
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

// @route  GET /api/auth/invite-code
// @access Private (college_admin)
exports.getInviteCode = async (req, res) => {
  try {
    const college = await College.findById(req.user.college);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.json({
      success: true,
      inviteCode: college.inviteCode,
      expiresAt: college.inviteCodeExpiry,
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

// @route  PUT /api/auth/invite-code/refresh
// @access Private (college_admin)
exports.refreshInviteCode = async (req, res) => {
  try {
    const crypto = require('crypto');

    const college = await College.findByIdAndUpdate(
      req.user.college,
      {
        inviteCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
        inviteCodeExpiry: new Date(+new Date() + 30 * 24 * 60 * 60 * 1000)
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Invite code refreshed',
      inviteCode: college.inviteCode,
      expiresAt: college.inviteCodeExpiry,
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

// @route  POST /api/auth/refresh
// @access Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // ✅ Check if blacklisted
    const redisClient = require('../config/redis');
    const isBlacklisted = await redisClient.get(
      `blacklist:${refreshToken}`
    );
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid',
      });
    }

    // ✅ Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    // ✅ Generate new access token
    const newToken = generateToken(user._id, user.role);

    res.json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};
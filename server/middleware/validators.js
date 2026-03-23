const { body } = require('express-validator');

// Auth validators
exports.registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .escape(),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must have uppercase, lowercase and number'),

  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .isMobilePhone('en-IN')
    .withMessage('Please provide valid Indian phone number'),

  body('collegeCode')
    .trim()
    .notEmpty()
    .withMessage('College code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Invalid college code')
    .escape(),
];

exports.loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Cafe validators
exports.cafeValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Cafe name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .escape(),

  body('openTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format, use HH:MM'),

  body('closeTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format, use HH:MM'),

  body('maxOrdersPerSlot')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max orders must be between 1 and 100'),
];

// Menu validators
exports.menuItemValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Price must be between 1 and 10000'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .escape(),

  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Preparation time must be between 1 and 120 minutes'),
];

// Order validators
exports.orderValidator = [
  body('cafeId')
    .notEmpty()
    .withMessage('Cafe ID is required')
    .isMongoId()
    .withMessage('Invalid cafe ID'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.menuItemId')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isMongoId()
    .withMessage('Invalid menu item ID'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),

  body('paymentMethod')
    .optional()
    .isIn(['wallet', 'razorpay'])
    .withMessage('Invalid payment method'),
];

// Wallet validators
exports.walletValidator = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Amount must be between 1 and 10000'),
];
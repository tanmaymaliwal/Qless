const mongoose = require('mongoose');
const crypto = require('crypto');

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  address: { type: String },
  logo: { type: String },
  isActive: { type: Boolean, default: true },
  plan: {
    type: String,
    enum: ['starter', 'growth', 'enterprise'],
    default: 'starter'
  },
  // Invite code for student registration
  inviteCode: {
    type: String,
    default: () => crypto.randomBytes(4).toString('hex').toUpperCase()
  },
  inviteCodeExpiry: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000)
  },
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
const mongoose = require('mongoose');

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
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
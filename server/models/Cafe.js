const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  image: { type: String },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  // Soft delete fields
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  openTime: { type: String, default: '08:00' },
  closeTime: { type: String, default: '20:00' },
  maxOrdersPerSlot: { type: Number, default: 20 },
}, { timestamps: true });

module.exports = mongoose.model('Cafe', cafeSchema);
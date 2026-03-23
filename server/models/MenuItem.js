const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 10 },
  // ✅ Soft delete fields
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
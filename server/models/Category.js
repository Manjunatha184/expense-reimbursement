const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  budgetLimit: {
    type: Number,
    default: 0
  },
  requireReceipt: {
    type: Boolean,
    default: true
  },
  perDayLimit: {
    type: Number,
    default: null
  },
  approvalThreshold: {
    type: Number,
    default: 5000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);

const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null  // null means applies to all categories
  },
  rules: {
    maxAmount: {
      type: Number,
      default: null  // null means no limit
    },
    requiresReceipt: {
      type: Boolean,
      default: true
    },
    requiresApprovalAbove: {
      type: Number,
      default: 5000
    },
    allowedVendors: {
      type: [String],
      default: []  // empty means all vendors allowed
    },
    blockedVendors: {
      type: [String],
      default: []
    },
    maxPerDay: {
      type: Number,
      default: null
    },
    maxPerMonth: {
      type: Number,
      default: null
    },
    requiresManagerApproval: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Policy', policySchema);

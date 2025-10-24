const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expenseId: {
    type: String,
    required: true,
    unique: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  vendor: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  receipt: String,
  
  // Status with multi-level support
  status: {
    type: String,
    enum: ['pending', 'pending_manager', 'pending_finance', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  
  // Multi-level approval workflow
  approvalWorkflow: [{
    level: {
      type: String,
      enum: ['manager', 'finance', 'admin'],
      required: true
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: String,
    actionDate: Date
  }],
  
  currentApprovalLevel: {
    type: String,
    enum: ['manager', 'finance', 'admin', 'completed', null],
    default: null
  },
  
  // Legacy fields (backward compatibility)
  approvedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    comments: String
  }],
  
  rejectedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    reason: String
  },
  
  // Payment fields
  paidAt: Date,
  paymentMethod: String,
  paymentReference: String,
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Policy violations
  policyViolations: [{
    policyId: String,
    policyName: String,
    rule: String,
    message: String,
    severity: String
  }],
  
  // Comments
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
expenseSchema.index({ employeeId: 1, status: 1 });
expenseSchema.index({ currentApprovalLevel: 1, status: 1 });
expenseSchema.index({ expenseId: 1 });

module.exports = mongoose.model('Expense', expenseSchema);

const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: String,
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expenseId: { type: mongoose.Schema.Types.String, ref: 'Expense' },
  subject: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['rejection_dispute', 'payment_not_received', 'general_query', 'other'],
    required: true 
  },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium' 
  },
  replies: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);

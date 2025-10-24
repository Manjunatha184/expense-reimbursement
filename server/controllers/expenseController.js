const Expense = require('../models/Expense');
const Category = require('../models/Category');
const User = require('../models/User');
const emailService = require('../services/emailService');
const approvalController = require('./approvalController');


// CREATE EXPENSE - Send email to admin
exports.createExpense = async (req, res) => {
  try {
    const { category, amount, date, vendor, description } = req.body;
    
    // Generate expense ID
    const count = await Expense.countDocuments();
    const expenseId = `EXP${String(count + 1).padStart(4, '0')}`;

    // Create expense with pending status
    const expense = new Expense({
      expenseId,
      employeeId: req.user._id,
      category,
      amount,
      date,
      vendor,
      description,
      receipt: req.file?.filename,
      status: 'pending' // Always pending, no auto-approval
    });

    await expense.save();
    await expense.populate('category employeeId', 'name email');

    // Send email notification to admin
    try {
      const admin = await User.findOne({ role: 'admin' });
      if (admin && admin.email) {
        await emailService.sendExpenseSubmittedEmail(
          expense,
          req.user.email,
          req.user.name,
          admin.email
        );
        console.log('✅ Notification sent to admin:', admin.email);
      }
    } catch (emailError) {
      console.error('❌ Email sending failed (non-critical):', emailError.message);
    }

    res.status(201).json({
      message: 'Expense submitted successfully',
      expense
    });
  } catch (error) {
    console.error('CREATE EXPENSE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};


// GET MY EXPENSES
exports.getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employeeId: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL EXPENSES (Admin)
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('employeeId', 'name email department')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET EXPENSE BY ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name email')
      .populate('category', 'name');
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json({ expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// APPROVE EXPENSE - Send email to employee
exports.approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name email')
      .populate('category', 'name');
      
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    expense.status = 'approved';
    expense.approvedBy.push({
      userId: req.user._id,
      approvedAt: new Date(),
      comments: req.body.comments || 'Approved'
    });
    
    await expense.save();

    // Send email to employee
    try {
      await emailService.sendExpenseApprovedEmail(
        expense,
        expense.employeeId.email,
        expense.employeeId.name
      );
      console.log('📧 Approval notification sent to:', expense.employeeId.email);
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError.message);
    }

    res.json({ 
      message: 'Expense approved and employee notified', 
      expense 
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: error.message });
  }
};

// REJECT EXPENSE - Send email to employee
exports.rejectExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name email')
      .populate('category', 'name');
      
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    const reason = req.body.reason || 'Rejected';
    
    expense.status = 'rejected';
    expense.rejectedBy = {
      userId: req.user._id,
      rejectedAt: new Date(),
      reason: reason
    };
    
    await expense.save();

    // Send email to employee
    try {
      await emailService.sendExpenseRejectedEmail(
        expense,
        expense.employeeId.email,
        reason
      );
      console.log('📧 Rejection notification sent to:', expense.employeeId.email);
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError.message);
    }

    res.json({ 
      message: 'Expense rejected and employee notified', 
      expense 
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PROCESS PAYMENT - Send email to employee
exports.processPayment = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name email')
      .populate('category', 'name');
      
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    if (expense.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved expenses can be paid' });
    }
    
    expense.status = 'paid';
    expense.paidAt = new Date();
    expense.paymentMethod = req.body.paymentMethod;
    expense.paymentReference = req.body.paymentReference;
    expense.paidBy = req.user._id;
    
    await expense.save();

    console.log('🔍 DEBUG: Sending payment email to:', expense.employeeId.email);

    // Send email to employee
    try {
      const result = await emailService.sendPaymentProcessedEmail(
        expense,
        expense.employeeId.email
      );
      console.log('📧 Payment email result:', result);
      
      if (result.success) {
        console.log('✅ Payment notification sent to:', expense.employeeId.email);
      }
    } catch (emailError) {
      console.error('❌ Payment email error:', emailError.message);
    }

    res.json({ 
      message: 'Payment processed and employee notified', 
      expense 
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: error.message });
  }
};


// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Not found' });
    
    expense.comments.push({
      userId: req.user._id,
      message: req.body.message
    });
    
    await expense.save();
    res.json({ message: 'Comment added', expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET EXPENSE STATS
exports.getExpenseStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalExpenses = await Expense.countDocuments({ employeeId: userId });
    
    const statusStats = await Expense.aggregate([
      { $match: { employeeId: userId } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    res.json({ totalExpenses, statusStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

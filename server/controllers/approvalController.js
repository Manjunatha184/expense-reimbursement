const Expense = require('../models/Expense');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Initialize workflow when expense is created
exports.initializeWorkflow = async (expense, amount) => {
  const workflow = [];
  
  // Define approval levels based on amount
  if (amount > 5000) {
    workflow.push({
      level: 'manager',
      status: 'pending'
    });
  }
  
  if (amount > 25000) {
    workflow.push({
      level: 'finance',
      status: 'pending'
    });
  }
  
  if (amount > 50000) {
    workflow.push({
      level: 'admin',
      status: 'pending'
    });
  }
  
  // If no workflow needed, auto-approve
  if (workflow.length === 0) {
    expense.status = 'approved';
    expense.currentApprovalLevel = 'completed';
  } else {
    expense.approvalWorkflow = workflow;
    expense.currentApprovalLevel = workflow[0].level;
    expense.status = `pending_${workflow[0].level}`;
  }
  
  return expense;
};

// Get pending approvals for a user based on their role
exports.getPendingApprovals = async (req, res) => {
  try {
    const userRole = req.user.role;
    let query = {};
    
    if (userRole === 'manager') {
      query = {
        currentApprovalLevel: 'manager',
        status: 'pending_manager'
      };
    } else if (userRole === 'finance') {
      query = {
        currentApprovalLevel: 'finance',
        status: 'pending_finance'
      };
    } else if (userRole === 'admin') {
      query = {
        currentApprovalLevel: 'admin',
        $or: [
          { status: 'pending' },
          { status: { $regex: /^pending_/ } }
        ]
      };
    }
    
    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email department')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ expenses });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Approve at current level
exports.approveAtLevel = async (req, res) => {
  try {
    const { comments } = req.body;
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name email');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    const userRole = req.user.role;
    const currentLevel = expense.currentApprovalLevel;
    
    // Validate user can approve at this level
    const canApprove = 
      (userRole === 'admin') || 
      (userRole === 'manager' && currentLevel === 'manager') ||
      (userRole === 'finance' && currentLevel === 'finance');
    
    if (!canApprove) {
      return res.status(403).json({ 
        message: `You cannot approve at ${currentLevel} level` 
      });
    }
    
    // Update current workflow step
    const workflowIndex = expense.approvalWorkflow.findIndex(
      w => w.level === currentLevel && w.status === 'pending'
    );
    
    if (workflowIndex !== -1) {
      expense.approvalWorkflow[workflowIndex].approver = req.user._id;
      expense.approvalWorkflow[workflowIndex].status = 'approved';
      expense.approvalWorkflow[workflowIndex].comments = comments || 'Approved';
      expense.approvalWorkflow[workflowIndex].actionDate = new Date();
    }
    
    // Move to next level or complete
    const nextPendingLevel = expense.approvalWorkflow.find(
      w => w.status === 'pending'
    );
    
    if (nextPendingLevel) {
      expense.currentApprovalLevel = nextPendingLevel.level;
      expense.status = `pending_${nextPendingLevel.level}`;
    } else {
      expense.currentApprovalLevel = 'completed';
      expense.status = 'approved';
      
      // Send approval email to employee
      try {
        await emailService.sendExpenseApprovedEmail(
          expense,
          expense.employeeId.email,
          expense.employeeId.name
        );
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }
    
    await expense.save();
    
    res.json({ 
      message: `Approved at ${currentLevel} level`,
      expense,
      nextLevel: nextPendingLevel ? nextPendingLevel.level : 'completed'
    });
  } catch (error) {
    console.error('Approve at level error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reject at current level
exports.rejectAtLevel = async (req, res) => {
  try {
    const { reason } = req.body;
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name email');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    const userRole = req.user.role;
    const currentLevel = expense.currentApprovalLevel;
    
    // Validate user can reject at this level
    const canReject = 
      (userRole === 'admin') || 
      (userRole === 'manager' && currentLevel === 'manager') ||
      (userRole === 'finance' && currentLevel === 'finance');
    
    if (!canReject) {
      return res.status(403).json({ 
        message: `You cannot reject at ${currentLevel} level` 
      });
    }
    
    // Update current workflow step
    const workflowIndex = expense.approvalWorkflow.findIndex(
      w => w.level === currentLevel && w.status === 'pending'
    );
    
    if (workflowIndex !== -1) {
      expense.approvalWorkflow[workflowIndex].approver = req.user._id;
      expense.approvalWorkflow[workflowIndex].status = 'rejected';
      expense.approvalWorkflow[workflowIndex].comments = reason || 'Rejected';
      expense.approvalWorkflow[workflowIndex].actionDate = new Date();
    }
    
    expense.status = 'rejected';
    expense.currentApprovalLevel = 'completed';
    expense.rejectedBy = {
      userId: req.user._id,
      rejectedAt: new Date(),
      reason: reason || 'Rejected'
    };
    
    await expense.save();
    
    // Send rejection email to employee
    try {
      await emailService.sendExpenseRejectedEmail(
        expense,
        expense.employeeId.email,
        reason || 'Rejected'
      );
    } catch (emailError) {
      console.error('Email error:', emailError);
    }
    
    res.json({ 
      message: `Rejected at ${currentLevel} level`,
      expense
    });
  } catch (error) {
    console.error('Reject at level error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get workflow history for an expense
exports.getWorkflowHistory = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('approvalWorkflow.approver', 'name email role')
      .populate('employeeId', 'name email');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ 
      workflow: expense.approvalWorkflow,
      currentLevel: expense.currentApprovalLevel,
      status: expense.status
    });
  } catch (error) {
    console.error('Get workflow history error:', error);
    res.status(500).json({ message: error.message });
  }
};

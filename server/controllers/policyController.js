const Policy = require('../models/Policy');
const Expense = require('../models/Expense');

// Create Policy
exports.createPolicy = async (req, res) => {
  try {
    const count = await Policy.countDocuments();
    const policyId = `POL${String(count + 1).padStart(3, '0')}`;

    const policy = await Policy.create({
      policyId,
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: 'Policy created successfully',
      policy
    });
  } catch (error) {
    console.error('Create policy error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Policies
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
      .populate('category', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ policies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Active Policies
exports.getActivePolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ isActive: true })
      .populate('category', 'name');

    res.json({ policies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Policy
exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json({ message: 'Policy updated', policy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Policy
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json({ message: 'Policy deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check Expense Compliance
exports.checkCompliance = async (req, res) => {
  try {
    const { categoryId, amount, vendor, date } = req.body;
    const userId = req.user._id;

    // Get policies for this category
    const policies = await Policy.find({
      isActive: true,
      $or: [
        { category: categoryId },
        { category: null }  // General policies
      ]
    });

    const violations = [];
    const warnings = [];

    for (const policy of policies) {
      const rules = policy.rules;

      // Check max amount
      if (rules.maxAmount && amount > rules.maxAmount) {
        violations.push({
          policyId: policy.policyId,
          policyName: policy.name,
          rule: 'maxAmount',
          message: `Amount ₹${amount} exceeds policy limit of ₹${rules.maxAmount}`,
          severity: 'high'
        });
      }

      // Check blocked vendors
      if (rules.blockedVendors.length > 0) {
        const isBlocked = rules.blockedVendors.some(blocked => 
          vendor.toLowerCase().includes(blocked.toLowerCase())
        );
        if (isBlocked) {
          violations.push({
            policyId: policy.policyId,
            policyName: policy.name,
            rule: 'blockedVendor',
            message: `Vendor "${vendor}" is in the blocked list`,
            severity: 'high'
          });
        }
      }

      // Check allowed vendors
      if (rules.allowedVendors.length > 0) {
        const isAllowed = rules.allowedVendors.some(allowed => 
          vendor.toLowerCase().includes(allowed.toLowerCase())
        );
        if (!isAllowed) {
          warnings.push({
            policyId: policy.policyId,
            policyName: policy.name,
            rule: 'allowedVendors',
            message: `Vendor "${vendor}" is not in the approved vendor list`,
            severity: 'medium'
          });
        }
      }

      // Check daily limit
      if (rules.maxPerDay) {
        const today = new Date(date);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayExpenses = await Expense.aggregate([
          {
            $match: {
              employeeId: userId,
              category: categoryId,
              date: { $gte: today, $lt: tomorrow }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const todayTotal = todayExpenses[0]?.total || 0;
        const newTotal = todayTotal + amount;

        if (newTotal > rules.maxPerDay) {
          violations.push({
            policyId: policy.policyId,
            policyName: policy.name,
            rule: 'maxPerDay',
            message: `Daily limit exceeded: ₹${newTotal} (limit: ₹${rules.maxPerDay})`,
            severity: 'high'
          });
        }
      }

      // Check monthly limit
      if (rules.maxPerMonth) {
        const expenseDate = new Date(date);
        const startOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);
        const endOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0);

        const monthExpenses = await Expense.aggregate([
          {
            $match: {
              employeeId: userId,
              category: categoryId,
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const monthTotal = monthExpenses[0]?.total || 0;
        const newTotal = monthTotal + amount;

        if (newTotal > rules.maxPerMonth) {
          violations.push({
            policyId: policy.policyId,
            policyName: policy.name,
            rule: 'maxPerMonth',
            message: `Monthly limit exceeded: ₹${newTotal} (limit: ₹${rules.maxPerMonth})`,
            severity: 'high'
          });
        }
      }

      // Check if manager approval required
      if (rules.requiresManagerApproval && amount > rules.requiresApprovalAbove) {
        warnings.push({
          policyId: policy.policyId,
          policyName: policy.name,
          rule: 'requiresManagerApproval',
          message: `Amount exceeds ₹${rules.requiresApprovalAbove}. Manager approval required.`,
          severity: 'medium'
        });
      }
    }

    const isCompliant = violations.length === 0;

    res.json({
      isCompliant,
      violations,
      warnings,
      summary: {
        totalViolations: violations.length,
        totalWarnings: warnings.length,
        status: isCompliant ? 'approved' : 'needs_review'
      }
    });
  } catch (error) {
    console.error('Check compliance error:', error);
    res.status(500).json({ message: error.message });
  }
};

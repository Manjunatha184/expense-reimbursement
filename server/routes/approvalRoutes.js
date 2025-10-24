const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { auth, adminAuth } = require('../middleware/auth');

// Get pending approvals for current user
router.get('/pending', auth, approvalController.getPendingApprovals);

// Approve at current level
router.post('/:id/approve', auth, approvalController.approveAtLevel);

// Reject at current level
router.post('/:id/reject', auth, approvalController.rejectAtLevel);

// Get workflow history
router.get('/:id/workflow', auth, approvalController.getWorkflowHistory);

module.exports = router;

const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Employee routes - Anyone authenticated
router.post('/', auth, upload.single('receipt'), expenseController.createExpense);
router.get('/my-expenses', auth, expenseController.getMyExpenses);
router.get('/stats', auth, expenseController.getExpenseStats);

// Admin routes - Admin only
router.get('/', auth, adminAuth, expenseController.getAllExpenses);
router.get('/:id', auth, expenseController.getExpenseById);
router.post('/:id/approve', auth, adminAuth, expenseController.approveExpense);
router.post('/:id/reject', auth, adminAuth, expenseController.rejectExpense);
router.post('/:id/payment', auth, adminAuth, expenseController.processPayment);
router.post('/:id/comment', auth, expenseController.addComment);

module.exports = router;

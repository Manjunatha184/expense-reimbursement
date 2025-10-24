const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { auth } = require('../middleware/auth');

// Change password (requires login)
router.post('/change-password', auth, passwordController.changePassword);

// Request OTP for password reset
router.post('/request-reset', passwordController.requestPasswordReset);

// Reset password with OTP
router.post('/reset-with-otp', passwordController.resetPasswordWithOTP);

module.exports = router;

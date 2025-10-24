const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

// Change password with old password (when logged in)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Get user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    try {
      await emailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Request OTP for password reset (forgot password)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Show error if email doesn't exist
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in user document (expires in 10 minutes)
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP via email
    try {
      await emailService.sendPasswordResetOTP(user.email, user.name, otp);
      console.log('✅ OTP sent to:', user.email, 'OTP:', otp); // For testing
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent to your email. Valid for 10 minutes.',
      email: email 
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: error.message });
  }
};


// Verify OTP and reset password
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      passwordResetOTP: otp,
      passwordResetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    
    // Clear OTP fields
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    
    await user.save();

    console.log('✅ Password reset successful for:', user.email);

    // Send confirmation email
    try {
      await emailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ message: 'Password reset successfully. Please login with new password.' });
  } catch (error) {
    console.error('Reset password with OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};

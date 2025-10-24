require('dotenv').config();
const fetch = require('node-fetch');

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Expense Reimbursement System',
          email: process.env.EMAIL_FROM || 'shankarmanjunath184@gmail.com'
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Email sent to', to);
      return { success: true, messageId: data.messageId };
    } else {
      const error = await response.text();
      console.error('❌ Email failed:', error);
      return { success: false, error: error };
    }
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const templates = {
  expenseSubmitted: (expense, employeeName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Expense Submission</h2>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Expense ID:</strong> ${expense.expenseId}</p>
        <p><strong>Employee:</strong> ${employeeName}</p>
        <p><strong>Vendor:</strong> ${expense.vendor}</p>
        <p><strong>Amount:</strong> ₹${expense.amount}</p>
        <p><strong>Description:</strong> ${expense.description}</p>
      </div>
      <p>Please review this expense in the admin dashboard.</p>
    </div>
  `,

  expenseApproved: (expense) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">✅ Expense Approved!</h2>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Expense ID:</strong> ${expense.expenseId}</p>
        <p><strong>Vendor:</strong> ${expense.vendor}</p>
        <p><strong>Amount:</strong> ₹${expense.amount}</p>
        <p><strong>Status:</strong> APPROVED</p>
      </div>
      <p>Payment will be processed soon.</p>
    </div>
  `,

  expenseRejected: (expense, reason) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">❌ Expense Rejected</h2>
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Expense ID:</strong> ${expense.expenseId}</p>
        <p><strong>Amount:</strong> ₹${expense.amount}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
    </div>
  `,

  paymentProcessed: (expense) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">💰 Payment Processed!</h2>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Expense ID:</strong> ${expense.expenseId}</p>
        <p><strong>Amount:</strong> ₹${expense.amount}</p>
        <p><strong>Payment Method:</strong> ${expense.paymentMethod}</p>
        <p><strong>Reference:</strong> ${expense.paymentReference}</p>
      </div>
      <p>Amount should reflect in 2-3 business days.</p>
    </div>
  `,

  ticketRaised: (ticket, employeeName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🎫 New Support Ticket</h2>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Employee:</strong> ${employeeName}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Category:</strong> ${ticket.category.replace('_', ' ').toUpperCase()}</p>
        ${ticket.expenseId ? `<p><strong>Related Expense:</strong> <span style="background: #dbeafe; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${ticket.expenseId}</span></p>` : ''}
      </div>
      <p><strong>Description:</strong></p>
      <p style="background: #f9fafb; padding: 15px; border-left: 3px solid #2563eb;">${ticket.description}</p>
    </div>
  `,

  ticketReply: (ticket, replyMessage) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">💬 New Reply on Your Ticket</h2>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        ${ticket.expenseId ? `<p><strong>Related Expense:</strong> <span style="background: #dbeafe; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${ticket.expenseId}</span></p>` : ''}
      </div>
      <p><strong>Admin Reply:</strong></p>
      <p style="background: #dbeafe; padding: 15px; border-radius: 4px;">${replyMessage}</p>
    </div>
  `,

  ticketResolved: (ticket) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">✅ Your Ticket Has Been Resolved</h2>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        ${ticket.expenseId ? `<p><strong>Related Expense:</strong> <span style="background: #dbeafe; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${ticket.expenseId}</span></p>` : ''}
        <p><strong>Status:</strong> <span style="color: #16a34a;">RESOLVED</span></p>
      </div>
      <p>Your support ticket has been marked as resolved. If you still face issues, please raise a new ticket.</p>
    </div>
  `,

  passwordResetOTP: (userName, otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🔐 Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>You requested to reset your password. Use the OTP below:</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        <p style="color: #6b7280; margin-top: 10px;">Valid for 10 minutes</p>
      </div>
      
      <p><strong>If you didn't request this,</strong> please ignore this email.</p>
    </div>
  `,

  passwordChanged: (userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">✅ Password Changed Successfully</h2>
      <p>Hi ${userName},</p>
      <p>Your password has been changed successfully.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <p><strong>If you didn't make this change,</strong> please contact support immediately.</p>
    </div>
  `
};

module.exports = {
  sendExpenseSubmittedEmail: async (expense, employeeEmail, employeeName, adminEmail) => {
    return await sendEmail(
      adminEmail,
      `New Expense - ${expense.expenseId}`,
      templates.expenseSubmitted(expense, employeeName)
    );
  },

  sendExpenseApprovedEmail: async (expense, employeeEmail, employeeName) => {
    return await sendEmail(
      employeeEmail,
      `Expense Approved - ${expense.expenseId}`,
      templates.expenseApproved(expense)
    );
  },

  sendExpenseRejectedEmail: async (expense, employeeEmail, reason) => {
    return await sendEmail(
      employeeEmail,
      `Expense Rejected - ${expense.expenseId}`,
      templates.expenseRejected(expense, reason)
    );
  },

  sendPaymentProcessedEmail: async (expense, employeeEmail) => {
    return await sendEmail(
      employeeEmail,
      `Payment Processed - ${expense.expenseId}`,
      templates.paymentProcessed(expense)
    );
  },

  sendTicketRaisedEmail: async (ticket, employeeName, adminEmail) => {
    return await sendEmail(
      adminEmail,
      `New Ticket - ${ticket.ticketId}`,
      templates.ticketRaised(ticket, employeeName)
    );
  },

  sendTicketReplyEmail: async (ticket, employeeEmail, replyMessage) => {
    return await sendEmail(
      employeeEmail,
      `Reply on Ticket ${ticket.ticketId}`,
      templates.ticketReply(ticket, replyMessage)
    );
  },

  sendTicketResolvedEmail: async (ticket, employeeEmail) => {
    return await sendEmail(
      employeeEmail,
      `Ticket Resolved - ${ticket.ticketId}`,
      templates.ticketResolved(ticket)
    );
  },

  // Password reset functions
  sendPasswordResetOTP: async (email, userName, otp) => {
    return await sendEmail(
      email,
      'Password Reset OTP',
      templates.passwordResetOTP(userName, otp)
    );
  },

  sendPasswordChangedEmail: async (email, userName) => {
    return await sendEmail(
      email,
      'Password Changed Successfully',
      templates.passwordChanged(userName)
    );
  }
};

console.log('✅ Email service loaded (using Brevo API)');

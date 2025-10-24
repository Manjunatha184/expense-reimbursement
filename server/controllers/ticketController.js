const Ticket = require('../models/Ticket');
const User = require('../models/User');
const mongoose = require('mongoose');
const emailService = require('../services/emailService');

// CREATE TICKET - Send email to admin
exports.createTicket = async (req, res) => {
  try {
    const { subject, category, description, expenseId } = req.body;

    const count = await Ticket.countDocuments();
    const ticketId = `TKT${String(count + 1).padStart(3, '0')}`;

    // Validate expenseId if provided (just store as text)
    const ticket = await Ticket.create({
      ticketId,
      employeeId: req.user._id,
      subject,
      category,
      description,
      expenseId: expenseId || null
    });

    await ticket.populate('employeeId', 'name email');

    // Send email to admin
    try {
      const admin = await User.findOne({ role: 'admin' });
      if (admin && admin.email) {
        await emailService.sendTicketRaisedEmail(
          ticket,
          req.user.name,
          admin.email
        );
        console.log('📧 Ticket notification sent to admin:', admin.email);
      }
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError.message);
    }

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET MY TICKETS
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ employeeId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ message: error.message });
  }
};


// GET ALL TICKETS (Admin)
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('employeeId', 'name email department')
      .populate('replies.userId', 'name role')
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: error.message });
  }
};


// GET TICKET BY ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('employeeId', 'name email department')
      .populate('replies.userId', 'name role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};


// ADD REPLY - Send email to employee
exports.addReply = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id)
      .populate('employeeId', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.replies.push({
      userId: req.user._id,
      message
    });

    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();
    await ticket.populate('replies.userId', 'name role');

    // Send email to employee (only if admin replied)
    try {
      if (req.user.role === 'admin' && ticket.employeeId.email) {
        await emailService.sendTicketReplyEmail(
          ticket,
          ticket.employeeId.email,
          message
        );
        console.log('📧 Reply notification sent to:', ticket.employeeId.email);
      }
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError.message);
    }

    res.json({ message: 'Reply added and employee notified', ticket });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE TICKET STATUS
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id)
      .populate('employeeId', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedBy = req.user._id;
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    console.log('🔍 DEBUG: Ticket status changed to:', status);

    // Send email if ticket is resolved
    if (status === 'resolved' && oldStatus !== 'resolved') {
      try {
        const result = await emailService.sendTicketResolvedEmail(
          ticket,
          ticket.employeeId.email
        );
        console.log('📧 Ticket resolved email result:', result);
        
        if (result.success) {
          console.log('✅ Ticket resolved notification sent to:', ticket.employeeId.email);
        }
      } catch (emailError) {
        console.error('❌ Ticket resolved email error:', emailError.message);
      }
    }

    res.json({ 
      message: 'Ticket status updated and employee notified', 
      ticket 
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ message: error.message });
  }
};


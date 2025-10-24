const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { auth, adminAuth } = require('../middleware/auth');

// Employee routes
router.post('/', auth, ticketController.createTicket);
router.get('/my-tickets', auth, ticketController.getMyTickets);

// Admin routes - make sure adminAuth comes AFTER auth
router.get('/', auth, adminAuth, ticketController.getAllTickets);
router.get('/:id', auth, ticketController.getTicketById);
router.post('/:id/reply', auth, ticketController.addReply);
router.put('/:id/status', auth, adminAuth, ticketController.updateTicketStatus);

module.exports = router;

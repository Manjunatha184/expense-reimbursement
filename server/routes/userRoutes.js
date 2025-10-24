const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', auth, adminAuth, userController.getAllUsers);
router.get('/stats', auth, adminAuth, userController.getUserStats);
router.get('/:id', auth, adminAuth, userController.getUserById);
router.put('/:id', auth, adminAuth, userController.updateUser);
router.delete('/:id', auth, adminAuth, userController.deleteUser);

module.exports = router;

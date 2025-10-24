const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { auth, adminAuth } = require('../middleware/auth');

// Admin routes
router.post('/', auth, adminAuth, policyController.createPolicy);
router.get('/', auth, policyController.getAllPolicies);
router.get('/active', auth, policyController.getActivePolicies);
router.put('/:id', auth, adminAuth, policyController.updatePolicy);
router.delete('/:id', auth, adminAuth, policyController.deletePolicy);

// Employee routes
router.post('/check-compliance', auth, policyController.checkCompliance);

module.exports = router;

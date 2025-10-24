const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', auth, adminAuth, categoryController.createCategory);
router.get('/', auth, categoryController.getAllCategories);
router.get('/:id', auth, categoryController.getCategoryById);
router.put('/:id', auth, adminAuth, categoryController.updateCategory);
router.delete('/:id', auth, adminAuth, categoryController.deleteCategory);

module.exports = router;

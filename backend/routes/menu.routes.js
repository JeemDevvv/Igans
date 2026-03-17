const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allow } = require('../middleware/role.middleware');
const {
  getAll, getOne, create, update, remove,
  getCategories, createCategory, deleteCategory
} = require('../controllers/menu.controller');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', protect, allow('admin'), create);
router.put('/:id', protect, allow('admin'), update);
router.delete('/:id', protect, allow('admin'), remove);

router.get('/meta/categories', getCategories);
router.post('/meta/categories', protect, allow('admin'), createCategory);
router.delete('/meta/categories/:id', protect, allow('admin'), deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allow } = require('../middleware/role.middleware');
const { getStats, getUsers, deleteUser } = require('../controllers/admin.controller');

router.use(protect, allow('admin'));
router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
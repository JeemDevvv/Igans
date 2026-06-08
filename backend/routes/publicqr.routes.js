const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allow } = require('../middleware/role.middleware');
const {
  createPublicQR,
  getAllPublicQRs,
  getPublicQRById,
  deletePublicQR
} = require('../controllers/publicqr.controller');
router.post('/', protect, allow('admin'), createPublicQR);
router.get('/', protect, allow('admin'), getAllPublicQRs);
router.get('/:id', getPublicQRById);
router.delete('/:id', protect, allow('admin'), deletePublicQR);
module.exports = router;
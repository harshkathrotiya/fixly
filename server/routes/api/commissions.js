const express = require('express');
const {
  getAllCommissions,
  getCommissionById,
  updateCommission,
  getProviderCommissions
} = require('../../controllers/commissionController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
// None

// Protected routes - all admin only
router.get('/', protect, authorize('admin'), getAllCommissions);
router.get('/provider/:providerId', protect, authorize('admin'), getProviderCommissions);
router.get('/:id', protect, authorize('admin'), getCommissionById);
router.put('/:id', protect, authorize('admin'), updateCommission);

module.exports = router;
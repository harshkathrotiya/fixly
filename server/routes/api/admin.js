const express = require('express');
const {
  getAllEarnings,
  getEarningsById,
  getEarningsSummary,
  updateEarnings
} = require('../../controllers/adminEarningsController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
// None

// Protected routes - all admin only
router.get('/earnings', protect, authorize('admin'), getAllEarnings);
router.get('/earnings/summary', protect, authorize('admin'), getEarningsSummary);
router.get('/earnings/:id', protect, authorize('admin'), getEarningsById);
router.put('/earnings/:id', protect, authorize('admin'), updateEarnings);

module.exports = router;
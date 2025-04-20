const express = require('express');
const {
  getAllEarnings,
  getEarningsById,
  getEarningsSummary,
  updateEarnings
} = require('../../controllers/adminEarningsController');

const {
  getDashboardStats,
  updateProviderVerificationStatus
} = require('../../controllers/adminController');

const adminListingsRoutes = require('./adminListings');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
// None

// Protected routes - all admin only

// Dashboard routes
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

// Provider management routes
router.put('/providers/:id/verify', protect, authorize('admin'), updateProviderVerificationStatus);

// Earnings routes
router.get('/earnings', protect, authorize('admin'), getAllEarnings);
router.get('/earnings/summary', protect, authorize('admin'), getEarningsSummary);
router.get('/earnings/:id', protect, authorize('admin'), getEarningsById);
router.put('/earnings/:id', protect, authorize('admin'), updateEarnings);

// Mount admin listings routes
router.use('/listings', adminListingsRoutes);

module.exports = router;
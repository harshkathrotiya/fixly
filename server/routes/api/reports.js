const express = require('express');
const {
  generateReport,
  getAllReports,
  getReportById,
  deleteReport
} = require('../../controllers/reportController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
// None

// Protected routes - all admin only
router.post('/', protect, authorize('admin'), generateReport);
router.get('/', protect, authorize('admin'), getAllReports);
router.get('/:id', protect, authorize('admin'), getReportById);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router;
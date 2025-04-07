const express = require('express');
const {
  createComplaint,
  getCustomerComplaints,
  getComplaintById,
  updateComplaint,
  getAllComplaints
} = require('../../controllers/complaintController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
// None

// Protected routes
router.post('/', protect, authorize('customer'), createComplaint);
router.get('/customer', protect, authorize('customer'), getCustomerComplaints);
router.get('/admin', protect, authorize('admin'), getAllComplaints);
router.get('/:id', protect, getComplaintById);
router.put('/:id', protect, authorize('admin'), updateComplaint);

module.exports = router;
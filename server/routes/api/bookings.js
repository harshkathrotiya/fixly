const express = require('express');
const {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings
} = require('../../controllers/bookingController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Routes
router.get('/provider', protect, authorize('service_provider'), getProviderBookings);
router.get('/customer', protect, authorize('user'), getCustomerBookings);
router.get('/:id', protect, authorize('user', 'service_provider', 'admin'), getBookingById);
router.put('/:id/status', protect, authorize('user', 'service_provider', 'admin'), updateBookingStatus);
router.post('/', protect, authorize('user'), createBooking);
router.get('/', protect, authorize('admin'), getAllBookings);

module.exports = router;
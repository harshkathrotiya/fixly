const express = require('express');
const {
  createPayment,
  getPaymentById,
  getCustomerPayments,
  getProviderPayments,
  updatePaymentStatus,
  getAllPayments
} = require('../../controllers/paymentController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
// None

// Protected routes
router.post('/', protect, authorize('customer'), createPayment);
router.get('/customer', protect, authorize('customer'), getCustomerPayments);
router.get('/provider', protect, authorize('service_provider'), getProviderPayments);
router.get('/admin', protect, authorize('admin'), getAllPayments);
router.get('/:id', protect, getPaymentById);
router.put('/:id/status', protect, authorize('admin'), updatePaymentStatus);

module.exports = router;
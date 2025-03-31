const express = require('express');
const {
  registerAsProvider,
  getProviderProfile,
  updateProviderProfile,
  getServiceProviders,
  getServiceProviderById,
  updateProviderLocation,
  getProviderListings
} = require('../../controllers/serviceProviderController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getServiceProviders);
router.get('/:id', getServiceProviderById);

// Register as service provider (public)
router.post('/register', registerAsProvider);

// Protected routes
router.get('/me', protect, authorize('service_provider'), getProviderProfile);
router.put('/profile', protect, authorize('service_provider'), updateProviderProfile);
router.put('/location', protect, authorize('service_provider'), updateProviderLocation);
router.get('/me/listings', protect, authorize('service_provider'), getProviderListings);

module.exports = router;
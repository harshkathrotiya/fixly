const express = require('express');
const {
  createListing,
  uploadListingImage,
  getListings,
  getListingById,
  updateListing,
  updateListingStatus,
  deleteListing,
  getListingsByProviderId,
  getProviderListings
} = require('../../controllers/serviceListingController');

const { protect, authorize } = require('../../middleware/auth');
const { serviceImageUpload } = require('../../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', getListings);
router.get('/:id', getListingById);

// Service provider routes
router.post(
  '/',
  protect,
  authorize('service_provider'),
  serviceImageUpload.single('serviceImage'),
  createListing
);

router.put(
  '/:id',
  protect,
  authorize('service_provider'),
  updateListing
);

router.delete(
  '/:id',
  protect,
  authorize('service_provider'),
  deleteListing
);

router.put(
  '/:id/status',
  protect,
  authorize('service_provider'),
  updateListingStatus
);

router.put(
  '/:id/image',
  protect,
  authorize('service_provider'),
  serviceImageUpload.single('image'),
  uploadListingImage
);

// Get provider's own listings
router.get('/provider', protect, authorize('service_provider'), getProviderListings);

// Get listings by provider ID
router.get('/provider/:providerId', getListingsByProviderId);

module.exports = router;
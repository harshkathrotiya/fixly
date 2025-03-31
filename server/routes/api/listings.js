const express = require('express');
const {
  createListing,
  uploadListingImage,
  getListings,
  getListingById,
  updateListing,
  deleteListing
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
  '/:id/image',
  protect,
  authorize('service_provider'),
  serviceImageUpload.single('image'),
  uploadListingImage
);

module.exports = router;
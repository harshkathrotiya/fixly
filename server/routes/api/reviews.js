const express = require('express');
const {
  createReview,
  getProviderReviews,
  getListingReviews,
  getReviewById,
  updateReview,
  deleteReview
} = require('../../controllers/reviewController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getProviderReviews);
router.get('/listing/:listingId', getListingReviews);
router.get('/:id', getReviewById);

// Protected routes
router.post('/', protect, authorize('customer'), createReview);
router.put('/:id', protect, authorize('customer'), updateReview);
router.delete('/:id', protect, authorize('customer', 'admin'), deleteReview);

module.exports = router;
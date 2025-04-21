const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const ServiceListing = require('../../models/ServiceListing');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// @desc    Admin update listing status
// @route   PUT /api/admin/listings/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: 'isActive field is required'
    });
  }

  let listing = await ServiceListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }

  // Update status
  listing.isActive = isActive;
  await listing.save();

  res.status(200).json({
    success: true,
    data: listing
  });
}));

// @desc    Admin update listing
// @route   PUT /api/admin/listings/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { serviceTitle, servicePrice, serviceDetails, serviceImage, isActive, tags, duration, serviceLocation } = req.body;

  let listing = await ServiceListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }

  // Update fields
  if (serviceTitle) listing.serviceTitle = serviceTitle;
  
  if (servicePrice) {
    const parsedPrice = parseFloat(servicePrice);
    if (!isNaN(parsedPrice)) {
      listing.servicePrice = parsedPrice;
    }
  }

  if (serviceDetails) listing.serviceDetails = serviceDetails;
  if (serviceImage) listing.serviceImage = serviceImage;

  if (duration) {
    const parsedDuration = parseInt(duration);
    if (!isNaN(parsedDuration)) {
      listing.duration = parsedDuration;
    }
  }

  if (serviceLocation) listing.serviceLocation = serviceLocation;
  if (isActive !== undefined) listing.isActive = isActive;
  
  if (tags) {
    if (typeof tags === 'string') {
      listing.tags = tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(tags)) {
      listing.tags = tags;
    }
  }

  await listing.save();

  res.status(200).json({
    success: true,
    data: listing
  });
}));

module.exports = router;

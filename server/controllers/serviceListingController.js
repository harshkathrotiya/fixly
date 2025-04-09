const ServiceListing = require('../models/ServiceListing');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create a new service listing
// @route   POST /api/listings
// @access  Private (Service providers only)
exports.createListing = asyncHandler(async (req, res) => {
  const {
    categoryId,
    serviceTitle,
    servicePrice,
    serviceDetails,
    tags,
    serviceImage  // Extract from request body
  } = req.body;

  console.log('Received data:', req.body);
  console.log('Image URL received:', serviceImage);

  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider profile not found. Please complete your profile first.'
    });
  }

  // Check if provider is verified
  if (serviceProvider.verificationStatus !== 'Verified') {
    return res.status(403).json({
      success: false,
      message: 'Your account must be verified before creating service listings'
    });
  }

  // Create the service listing with the image URL
  const listing = await ServiceListing.create({
    serviceProviderId: serviceProvider._id,
    categoryId,
    serviceTitle,
    servicePrice,
    serviceDetails,
    serviceImage: serviceImage || '', // Ensure we have a default value
    tags: tags ? tags.split(',').map(tag => tag.trim()) : []
  });

  console.log('Created listing with image:', listing);

  res.status(201).json({
    success: true,
    data: listing
  });
});

// @desc    Upload service listing image
// @route   PUT /api/listings/:id/image
// @access  Private (Service provider who owns the listing)
exports.uploadListingImage = asyncHandler(async (req, res) => {
  const listing = await ServiceListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }

  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  // Check if the listing belongs to the provider
  if (!serviceProvider || listing.serviceProviderId.toString() !== serviceProvider._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this listing'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  // Update listing with image URL
  listing.serviceImage = req.file.path;
  await listing.save();

  res.status(200).json({
    success: true,
    data: listing
  });
});

// @desc    Get all service listings (with filtering)
// @route   GET /api/listings
// @access  Public
exports.getListings = asyncHandler(async (req, res) => {
  let query = { isActive: true };

  // Filter by category if provided
  if (req.query.category) {
    query.categoryId = req.query.category;
  }

  // Filter by provider if provided
  if (req.query.provider) {
    query.serviceProviderId = req.query.provider;
  }

  // Filter by price range if provided
  if (req.query.minPrice || req.query.maxPrice) {
    query.servicePrice = {};
    if (req.query.minPrice) query.servicePrice.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.servicePrice.$lte = parseFloat(req.query.maxPrice);
  }

  // Filter by tags if provided
  if (req.query.tags) {
    const tagList = req.query.tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tagList };
  }

  // Search by title or details
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { serviceTitle: searchRegex },
      { serviceDetails: searchRegex }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Sorting
  let sort = {};
  if (req.query.sort) {
    if (req.query.sort === 'price-asc') {
      sort = { servicePrice: 1 };
    } else if (req.query.sort === 'price-desc') {
      sort = { servicePrice: -1 };
    } else if (req.query.sort === 'rating') {
      sort = { averageRating: -1 };
    } else if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    }
  } else {
    sort = { createdAt: -1 }; // Default sort by newest
  }

  const listings = await ServiceListing.find(query)
    .populate('serviceProviderId', 'rating')
    .populate('categoryId', 'categoryName')
    .sort(sort)
    .skip(startIndex)
    .limit(limit);

  const total = await ServiceListing.countDocuments(query);

  res.status(200).json({
    success: true,
    count: listings.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: listings
  });
});

// @desc    Get service listing by ID
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = asyncHandler(async (req, res) => {
  const listing = await ServiceListing.findById(req.params.id)
    .populate({
      path: 'serviceProviderId',
      select: 'rating',
      populate: {
        path: 'userId',
        select: 'firstName lastName profilePicture'
      }
    })
    .populate('categoryId', 'categoryName categoryDescription');

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }

  res.status(200).json({
    success: true,
    data: listing
  });
});

// @desc    Update service listing
// @route   PUT /api/listings/:id
// @access  Private (Service provider who owns the listing)
exports.updateListing = asyncHandler(async (req, res) => {
  console.log('Update listing request body:', req.body);

  // For debugging FormData
  for (let key in req.body) {
    console.log(`${key}: ${req.body[key]}`);
  }

  // Extract fields from request body
  const { serviceTitle, servicePrice, serviceDetails, serviceImage, isActive, tags, duration, serviceLocation } = req.body;

  console.log('Extracted servicePrice:', servicePrice, typeof servicePrice);

  let listing = await ServiceListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }

  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  // Check if the listing belongs to the provider
  if (!serviceProvider || listing.serviceProviderId.toString() !== serviceProvider._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this listing'
    });
  }

  console.log('Before update - listing.servicePrice:', listing.servicePrice);

  // Update fields
  if (serviceTitle) listing.serviceTitle = serviceTitle;

  // Handle price specifically
  if (servicePrice) {
    const parsedPrice = parseFloat(servicePrice);
    console.log('Parsed price:', parsedPrice);
    if (!isNaN(parsedPrice)) {
      listing.servicePrice = parsedPrice;
      console.log('Updated price to:', listing.servicePrice);
    } else {
      console.log('Failed to parse price:', servicePrice);
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

  console.log('Updated listing before save:', listing);

  try {
    await listing.save();
    console.log('Listing saved successfully');
    console.log('After save - listing.servicePrice:', listing.servicePrice);
  } catch (error) {
    console.error('Error saving listing:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save listing',
      error: error.message
    });
  }

  res.status(200).json({
    success: true,
    data: listing
  });
});

// @desc    Update service listing status
// @route   PUT /api/listings/:id/status
// @access  Private (Service provider who owns the listing)
exports.updateListingStatus = asyncHandler(async (req, res) => {
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

  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  // Check if the listing belongs to the provider
  if (!serviceProvider || listing.serviceProviderId.toString() !== serviceProvider._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this listing'
    });
  }

  // Update status
  listing.isActive = isActive;
  await listing.save();

  res.status(200).json({
    success: true,
    data: listing
  });
});

// @desc    Delete service listing
// @route   DELETE /api/listings/:id
// @access  Private (Service provider who owns the listing)
exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await ServiceListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }

  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  // Check if the listing belongs to the provider
  if (!serviceProvider || listing.serviceProviderId.toString() !== serviceProvider._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to delete this listing'
    });
  }

  // Instead of deleting, mark as inactive
  listing.isActive = false;
  await listing.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get provider's own listings
// @route   GET /api/listings/provider
// @access  Private (Service providers only)
exports.getProviderListings = asyncHandler(async (req, res) => {
  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider profile not found'
    });
  }

  const listings = await ServiceListing.find({
    serviceProviderId: serviceProvider._id
  })
    .populate('categoryId', 'categoryName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: listings.length,
    data: listings
  });
});

// @desc    Get listings by provider ID
// @route   GET /api/listings/provider/:providerId
// @access  Public
exports.getListingsByProviderId = asyncHandler(async (req, res) => {
  const providerId = req.params.providerId;

  // Check if provider exists
  const serviceProvider = await ServiceProvider.findById(providerId);

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider not found'
    });
  }

  const listings = await ServiceListing.find({
    serviceProviderId: providerId,
    isActive: true
  })
    .populate('categoryId', 'categoryName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: listings.length,
    data: listings
  });
});
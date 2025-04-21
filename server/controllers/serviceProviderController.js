const ServiceProvider = require('../models/ServiceProvider');
const ServiceListing = require('../models/ServiceListing');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Register as a service provider
// @route   POST /api/providers/register
// @access  Public
exports.registerAsProvider = asyncHandler(async (req, res) => {
  const {
    serviceDescription,
    serviceCategory,
    availability,
    bankDetails,
    // User information fields
    firstName,
    lastName,
    email,
    password,
    phone
  } = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !serviceDescription || !serviceCategory) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required information'
    });
  }

  // Check if user with this email already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists. Please use a different email.'
    });
  }

  // Create new user
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    userType: 'service_provider'
  });

  // Create service provider profile
  const serviceProvider = await ServiceProvider.create({
    userId: newUser._id,
    serviceDescription,
    serviceCategory,
    availability,
    bankDetails,
    verificationStatus: 'Pending'
  });

  // Generate token for the new user
  const token = newUser.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    data: serviceProvider
  });
});

// @desc    Get service provider profile
// @route   GET /api/providers/me
// @access  Private (service providers only)
exports.getProviderProfile = asyncHandler(async (req, res) => {
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id })
    .populate('serviceCategory', 'categoryName categoryDescription');

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider profile not found'
    });
  }

  res.status(200).json({
    success: true,
    data: serviceProvider
  });
});

// @desc    Update service provider profile
// @route   PUT /api/providers/profile
// @access  Private (service providers only)
exports.updateProviderProfile = asyncHandler(async (req, res) => {
  const { serviceDescription, serviceCategory, availability, availabilityDetails, bankDetails } = req.body;

  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider profile not found'
    });
  }

  // Update fields
  if (serviceDescription) serviceProvider.serviceDescription = serviceDescription;
  if (serviceCategory) serviceProvider.serviceCategory = serviceCategory;
  if (availability) serviceProvider.availability = availability;
  if (availabilityDetails) serviceProvider.availabilityDetails = availabilityDetails;
  if (bankDetails) serviceProvider.bankDetails = bankDetails;

  await serviceProvider.save();

  res.status(200).json({
    success: true,
    data: serviceProvider
  });
});

// @desc    Get all service providers (with filtering)
// @route   GET /api/providers
// @access  Public
exports.getServiceProviders = asyncHandler(async (req, res) => {
  let query = {};

  // For admin, show all providers regardless of verification status
  // For public, only show verified providers
  if (req.user && req.user.userType === 'admin') {
    // If admin is filtering by verification status
    if (req.query.verificationStatus && req.query.verificationStatus !== 'all') {
      query.verificationStatus = req.query.verificationStatus;
    }
  } else {
    // For public users, only show verified providers
    query.verificationStatus = 'Verified';
  }

  // Filter by category if provided
  if (req.query.category) {
    query.serviceCategory = req.query.category;
  }

  // Filter by rating if provided
  if (req.query.minRating) {
    query.rating = { $gte: parseFloat(req.query.minRating) };
  }

  // Filter by availability if provided
  if (req.query.availability) {
    query.availability = req.query.availability;
  }

  // Search by name or email
  if (req.query.search) {
    // We need to search in the User model since name and email are stored there
    const users = await User.find({
      $or: [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ],
      userType: 'service_provider'
    }).select('_id');

    // Get the user IDs from the search results
    const userIds = users.map(user => user._id);

    // Add the user IDs to the query
    if (userIds.length > 0) {
      query.userId = { $in: userIds };
    } else if (req.query.search) {
      // If search term is provided but no users found, return empty result
      return res.status(200).json({
        success: true,
        count: 0,
        pagination: {
          total: 0,
          page: 1,
          pages: 0
        },
        data: []
      });
    }
  }

  // Location-based search (if coordinates provided)
  if (req.query.lat && req.query.lng && req.query.distance) {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const distance = parseFloat(req.query.distance) || 10; // Default 10km

    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: distance * 1000 // Convert to meters
      }
    };
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Sorting
  let sort = {};
  if (req.query.sort) {
    if (req.query.sort === 'rating') {
      sort = { rating: -1 };
    } else if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    }
  } else {
    sort = { rating: -1 }; // Default sort by highest rating
  }

  const providers = await ServiceProvider.find(query)
    .populate('userId', 'firstName lastName email profilePicture')
    .populate('serviceCategory', 'categoryName')
    .sort(sort)
    .skip(startIndex)
    .limit(limit);

  const total = await ServiceProvider.countDocuments(query);

  res.status(200).json({
    success: true,
    count: providers.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: providers
  });
});

// @desc    Get service provider by ID
// @route   GET /api/providers/:id
// @access  Public
exports.getServiceProviderById = asyncHandler(async (req, res) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id)
    .populate('userId', 'firstName lastName email profilePicture')
    .populate('serviceCategory', 'categoryName categoryDescription');

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider not found'
    });
  }

  res.status(200).json({
    success: true,
    data: serviceProvider
  });
});

// @desc    Update provider location
// @route   PUT /api/providers/location
// @access  Private (service providers only)
exports.updateProviderLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Please provide latitude and longitude'
    });
  }

  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider profile not found'
    });
  }

  serviceProvider.location = {
    type: 'Point',
    coordinates: [parseFloat(longitude), parseFloat(latitude)]
  };

  await serviceProvider.save();

  res.status(200).json({
    success: true,
    data: serviceProvider
  });
});

// Make sure getProviderListings is defined and exported
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
const Booking = require('../models/Booking');
const ServiceListing = require('../models/ServiceListing');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer only)
exports.createBooking = asyncHandler(async (req, res) => {
  const { 
    serviceListingId, 
    serviceDateTime, 
    specialInstructions 
  } = req.body;
  
  // Validate required fields
  if (!serviceListingId || !serviceDateTime) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  // Get service listing details
  const serviceListing = await ServiceListing.findById(serviceListingId);
  
  if (!serviceListing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }
  
  // Check if service listing is active
  if (!serviceListing.isActive) {
    return res.status(400).json({
      success: false,
      message: 'This service is currently unavailable'
    });
  }
  
  // Create booking
  const booking = await Booking.create({
    customerId: req.user.id,
    serviceProviderId: serviceListing.serviceProviderId,
    serviceListingId,
    serviceDateTime: new Date(serviceDateTime),
    specialInstructions,
    totalAmount: serviceListing.servicePrice
  });
  
  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get all bookings for a customer
// @route   GET /api/bookings/customer
// @access  Private (Customer only)
exports.getCustomerBookings = asyncHandler(async (req, res) => {
  console.log('User ID:', req.user.id);
  console.log('User Type:', req.user.userType);
  
  const bookings = await Booking.find({ customerId: req.user.id })
    .populate({
      path: 'serviceListingId',
      select: 'serviceTitle servicePrice serviceImage',
      populate: {
        path: 'categoryId',
        select: 'categoryName'
      }
    })
    .populate({
      path: 'serviceProviderId',
      select: 'userId',
      populate: {
        path: 'userId',
        select: 'firstName lastName profilePicture'
      }
    })
    .sort({ bookingDateTime: -1 });
  
  console.log('Found bookings:', bookings.length);
  
  // Mongoose find() returns an empty array if no bookings found, so no need for explicit check
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get all bookings for a service provider
// @route   GET /api/bookings/provider
// @access  Private (Service Provider only)
exports.getProviderBookings = asyncHandler(async (req, res) => {
  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });
  
  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider profile not found'
    });
  }
  
  const bookings = await Booking.find({ serviceProviderId: serviceProvider._id })
    .populate({
      path: 'serviceListingId',
      select: 'serviceTitle servicePrice serviceImage'
    })
    .populate({
      path: 'customerId',
      select: 'firstName lastName profilePicture'
    })
    .sort({ bookingDateTime: -1 });
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Customer or Service Provider)
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: 'serviceListingId',
      select: 'serviceTitle servicePrice serviceDetails serviceImage',
      populate: {
        path: 'categoryId',
        select: 'categoryName'
      }
    })
    .populate({
      path: 'serviceProviderId',
      select: 'userId serviceDescription rating',
      populate: {
        path: 'userId',
        select: 'firstName lastName profilePicture phone email'
      }
    })
    .populate({
      path: 'customerId',
      select: 'firstName lastName profilePicture phone email address'
    });
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }
  
  // Check if the user is authorized to view this booking
  if (
    req.user.userType === 'customer' && booking.customerId._id.toString() !== req.user.id &&
    req.user.userType === 'service_provider' && 
    booking.serviceProviderId.userId._id.toString() !== req.user.id &&
    req.user.userType !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this booking'
    });
  }
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Customer or Service Provider)
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a status'
    });
  }
  
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }
  
  // Check if the user is authorized to update this booking
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });
  
  if (
    req.user.userType === 'customer' && booking.customerId.toString() !== req.user.id &&
    req.user.userType === 'service_provider' && 
    serviceProvider && booking.serviceProviderId.toString() !== serviceProvider._id.toString() &&
    req.user.userType !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this booking'
    });
  }
  
  // Validate status transitions
  const validTransitions = {
    'Pending': ['Confirmed', 'Cancelled', 'Rejected'],
    'Confirmed': ['Completed', 'Cancelled'],
    'Completed': [],
    'Cancelled': [],
    'Rejected': []
  };
  
  if (!validTransitions[booking.bookingStatus].includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot change status from ${booking.bookingStatus} to ${status}`
    });
  }
  
  // Update booking status
  booking.bookingStatus = status;
  await booking.save();
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Get all bookings (admin)
// @route   GET /api/bookings/admin
// @access  Private (Admin only)
exports.getAllBookings = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filtering
  let query = {};
  
  if (req.query.status) {
    query.bookingStatus = req.query.status;
  }
  
  if (req.query.from && req.query.to) {
    query.serviceDateTime = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to)
    };
  }
  
  const bookings = await Booking.find(query)
    .populate({
      path: 'serviceListingId',
      select: 'serviceTitle servicePrice'
    })
    .populate({
      path: 'serviceProviderId',
      select: 'userId',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'customerId',
      select: 'firstName lastName'
    })
    .sort({ bookingDateTime: -1 })
    .skip(startIndex)
    .limit(limit);
  
  const total = await Booking.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: bookings
  });
});
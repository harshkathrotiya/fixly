const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Commission = require('../models/Commission');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private (Customer only)
exports.createPayment = asyncHandler(async (req, res) => {
  const { 
    bookingId, 
    paymentMethod, 
    transactionId 
  } = req.body;
  
  // Validate required fields
  if (!bookingId || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  // Get booking details
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }
  
  // Check if the user is authorized to make this payment
  if (booking.customerId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to make payment for this booking'
    });
  }
  
  // Check if payment already exists
  const existingPayment = await Payment.findOne({ bookingId });
  
  if (existingPayment) {
    return res.status(400).json({
      success: false,
      message: 'Payment already exists for this booking'
    });
  }
  
  // Create payment
  const payment = await Payment.create({
    bookingId,
    paymentAmount: booking.totalAmount,
    paymentMethod,
    transactionId,
    commissionAmount: booking.commissionAmount,
    providerAmount: booking.providerEarning
  });
  
  // Update booking status to confirmed
  booking.bookingStatus = 'Confirmed';
  await booking.save();
  
  // Create commission record
  await Commission.create({
    bookingId,
    serviceProviderId: booking.serviceProviderId,
    amount: booking.commissionAmount,
    rate: (booking.commissionAmount / booking.totalAmount) * 100,
    paymentId: payment._id,
    status: 'Pending'
  });
  
  res.status(201).json({
    success: true,
    data: payment
  });
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private (Customer, Service Provider, or Admin)
exports.getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate({
      path: 'bookingId',
      populate: [
        {
          path: 'serviceListingId',
          select: 'serviceTitle'
        },
        {
          path: 'customerId',
          select: 'firstName lastName'
        },
        {
          path: 'serviceProviderId',
          select: 'userId',
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        }
      ]
    });
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }
  
  // Check if the user is authorized to view this payment
  const booking = payment.bookingId;
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });
  
  if (
    req.user.userType === 'customer' && booking.customerId._id.toString() !== req.user.id &&
    req.user.userType === 'service_provider' && 
    serviceProvider && booking.serviceProviderId._id.toString() !== serviceProvider._id.toString() &&
    req.user.userType !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this payment'
    });
  }
  
  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Get all payments for a customer
// @route   GET /api/payments/customer
// @access  Private (Customer only)
exports.getCustomerPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({})
    .populate({
      path: 'bookingId',
      match: { customerId: req.user.id },
      populate: {
        path: 'serviceListingId',
        select: 'serviceTitle servicePrice'
      }
    })
    .sort({ paymentDateTime: -1 });
  
  // Filter out null bookings (where the match condition failed)
  const filteredPayments = payments.filter(payment => payment.bookingId);
  
  res.status(200).json({
    success: true,
    count: filteredPayments.length,
    data: filteredPayments
  });
});

// @desc    Get all payments for a service provider
// @route   GET /api/payments/provider
// @access  Private (Service Provider only)
exports.getProviderPayments = asyncHandler(async (req, res) => {
  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });
  
  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider profile not found'
    });
  }
  
  const payments = await Payment.find({})
    .populate({
      path: 'bookingId',
      match: { serviceProviderId: serviceProvider._id },
      populate: [
        {
          path: 'serviceListingId',
          select: 'serviceTitle servicePrice'
        },
        {
          path: 'customerId',
          select: 'firstName lastName'
        }
      ]
    })
    .sort({ paymentDateTime: -1 });
  
  // Filter out null bookings (where the match condition failed)
  const filteredPayments = payments.filter(payment => payment.bookingId);
  
  res.status(200).json({
    success: true,
    count: filteredPayments.length,
    data: filteredPayments
  });
});

// @desc    Update payment status (admin)
// @route   PUT /api/payments/:id/status
// @access  Private (Admin only)
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, commissionTransferStatus, providerTransferStatus } = req.body;
  
  const payment = await Payment.findById(req.params.id);
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }
  
  // Update payment status
  if (paymentStatus) payment.paymentStatus = paymentStatus;
  if (commissionTransferStatus) payment.commissionTransferStatus = commissionTransferStatus;
  if (providerTransferStatus) payment.providerTransferStatus = providerTransferStatus;
  
  await payment.save();
  
  // If commission is transferred, update commission status
  if (commissionTransferStatus === 'Completed') {
    const commission = await Commission.findOne({ paymentId: payment._id });
    if (commission) {
      commission.status = 'Collected';
      commission.collectionDate = Date.now();
      await commission.save();
    }
  }
  
  // If provider payment is transferred, update provider earnings
  if (providerTransferStatus === 'Completed') {
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      const provider = await ServiceProvider.findById(booking.serviceProviderId);
      if (provider) {
        provider.totalEarnings += payment.providerAmount;
        await provider.save();
      }
    }
  }
  
  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Get all payments (admin)
// @route   GET /api/payments/admin
// @access  Private (Admin only)
exports.getAllPayments = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filtering
  let query = {};
  
  if (req.query.status) {
    query.paymentStatus = req.query.status;
  }
  
  if (req.query.from && req.query.to) {
    query.paymentDateTime = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to)
    };
  }
  
  const payments = await Payment.find(query)
    .populate({
      path: 'bookingId',
      populate: [
        {
          path: 'serviceListingId',
          select: 'serviceTitle'
        },
        {
          path: 'customerId',
          select: 'firstName lastName'
        },
        {
          path: 'serviceProviderId',
          select: 'userId',
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        }
      ]
    })
    .sort({ paymentDateTime: -1 })
    .skip(startIndex)
    .limit(limit);
  
  const total = await Payment.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: payments.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: payments
  });
});
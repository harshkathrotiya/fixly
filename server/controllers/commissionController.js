const Commission = require('../models/Commission');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const ServiceProvider = require('../models/ServiceProvider');
const AdminEarnings = require('../models/AdminEarnings');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all commissions
// @route   GET /api/commissions
// @access  Private (Admin only)
exports.getAllCommissions = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filtering
  let query = {};
  
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  if (req.query.from && req.query.to) {
    query.createdAt = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to)
    };
  }
  
  const commissions = await Commission.find(query)
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
        }
      ]
    })
    .populate({
      path: 'serviceProviderId',
      select: 'userId',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
      }
    })
    .populate('paymentId')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  const total = await Commission.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: commissions.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: commissions
  });
});

// @desc    Get commission by ID
// @route   GET /api/commissions/:id
// @access  Private (Admin only)
exports.getCommissionById = asyncHandler(async (req, res) => {
  const commission = await Commission.findById(req.params.id)
    .populate({
      path: 'bookingId',
      populate: [
        {
          path: 'serviceListingId',
          select: 'serviceTitle servicePrice'
        },
        {
          path: 'customerId',
          select: 'firstName lastName email'
        }
      ]
    })
    .populate({
      path: 'serviceProviderId',
      select: 'userId commissionRate',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate('paymentId');
  
  if (!commission) {
    return res.status(404).json({
      success: false,
      message: 'Commission not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: commission
  });
});

// @desc    Update commission status
// @route   PUT /api/commissions/:id
// @access  Private (Admin only)
exports.updateCommission = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  
  const commission = await Commission.findById(req.params.id);
  
  if (!commission) {
    return res.status(404).json({
      success: false,
      message: 'Commission not found'
    });
  }
  
  // Update commission
  if (status) {
    commission.status = status;
    
    // If status is changed to collected, update collection date
    if (status === 'Collected') {
      commission.collectionDate = Date.now();
      
      // Update service provider's total commission paid
      const provider = await ServiceProvider.findById(commission.serviceProviderId);
      if (provider) {
        provider.totalCommissionPaid += commission.amount;
        await provider.save();
      }
      
      // Update or create admin earnings for this date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let adminEarnings = await AdminEarnings.findOne({ 
        date: { 
          $gte: today, 
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
        } 
      });
      
      if (adminEarnings) {
        adminEarnings.totalCommissionEarned += commission.amount;
        adminEarnings.commissions.push(commission._id);
        await adminEarnings.save();
      } else {
        adminEarnings = await AdminEarnings.create({
          date: today,
          totalCommissionEarned: commission.amount,
          totalBookings: 1,
          commissions: [commission._id]
        });
      }
    }
  }
  
  if (notes) commission.notes = notes;
  
  await commission.save();
  
  res.status(200).json({
    success: true,
    data: commission
  });
});

// @desc    Get commissions for a service provider
// @route   GET /api/commissions/provider/:providerId
// @access  Private (Admin only)
exports.getProviderCommissions = asyncHandler(async (req, res) => {
  const providerId = req.params.providerId;
  
  const commissions = await Commission.find({ serviceProviderId: providerId })
    .populate({
      path: 'bookingId',
      populate: {
        path: 'serviceListingId',
        select: 'serviceTitle'
      }
    })
    .populate('paymentId')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: commissions.length,
    data: commissions
  });
});
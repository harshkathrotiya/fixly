const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Customer only)
exports.createComplaint = asyncHandler(async (req, res) => {
  const { bookingId, complaintText } = req.body;
  
  // Validate required fields
  if (!bookingId || !complaintText) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  // Check if booking exists and belongs to the customer
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }
  
  // Verify the booking belongs to the customer
  if (booking.customerId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to file a complaint for this booking'
    });
  }
  
  // Check if complaint already exists
  const existingComplaint = await Complaint.findOne({ bookingId });
  
  if (existingComplaint) {
    return res.status(400).json({
      success: false,
      message: 'Complaint already exists for this booking'
    });
  }
  
  // Create complaint
  const complaint = await Complaint.create({
    bookingId,
    customerId: req.user.id,
    complaintText
  });
  
  res.status(201).json({
    success: true,
    data: complaint
  });
});

// @desc    Get all complaints for a customer
// @route   GET /api/complaints/customer
// @access  Private (Customer only)
exports.getCustomerComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ customerId: req.user.id })
    .populate({
      path: 'bookingId',
      populate: [
        {
          path: 'serviceListingId',
          select: 'serviceTitle'
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
    .sort({ complaintDateTime: -1 });
  
  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints
  });
});

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private (Customer or Admin)
exports.getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate({
      path: 'customerId',
      select: 'firstName lastName email phone'
    })
    .populate({
      path: 'bookingId',
      populate: [
        {
          path: 'serviceListingId',
          select: 'serviceTitle serviceDetails'
        },
        {
          path: 'serviceProviderId',
          select: 'userId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email phone'
          }
        }
      ]
    })
    .populate({
      path: 'resolvedBy',
      select: 'firstName lastName'
    });
  
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }
  
  // Check if the user is authorized to view this complaint
  if (req.user.userType !== 'admin' && complaint.customerId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this complaint'
    });
  }
  
  res.status(200).json({
    success: true,
    data: complaint
  });
});

// @desc    Update complaint status (admin only)
// @route   PUT /api/complaints/:id
// @access  Private (Admin only)
exports.updateComplaint = asyncHandler(async (req, res) => {
  const { complaintStatus, resolutionNotes } = req.body;
  
  let complaint = await Complaint.findById(req.params.id);
  
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }
  
  // Update complaint
  if (complaintStatus) complaint.complaintStatus = complaintStatus;
  if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
  
  // If status is changed to resolved, add resolver info
  if (complaintStatus === 'Resolved') {
    complaint.resolvedBy = req.user.id;
    complaint.resolvedDateTime = Date.now();
  }
  
  await complaint.save();
  
  res.status(200).json({
    success: true,
    data: complaint
  });
});

// @desc    Get all complaints (admin)
// @route   GET /api/complaints/admin
// @access  Private (Admin only)
exports.getAllComplaints = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filtering
  let query = {};
  
  if (req.query.status) {
    query.complaintStatus = req.query.status;
  }
  
  if (req.query.from && req.query.to) {
    query.complaintDateTime = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to)
    };
  }
  
  const complaints = await Complaint.find(query)
    .populate({
      path: 'customerId',
      select: 'firstName lastName'
    })
    .populate({
      path: 'bookingId',
      populate: {
        path: 'serviceListingId',
        select: 'serviceTitle'
      }
    })
    .sort({ complaintDateTime: -1 })
    .skip(startIndex)
    .limit(limit);
  
  const total = await Complaint.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: complaints.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: complaints
  });
});
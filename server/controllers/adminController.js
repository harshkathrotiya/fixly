const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const ServiceListing = require('../models/ServiceListing');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const AdminEarnings = require('../models/AdminEarnings');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Update service provider verification status
// @route   PUT /api/admin/providers/:id/verify
// @access  Private (Admin only)
exports.updateProviderVerificationStatus = asyncHandler(async (req, res) => {
  const { verificationStatus } = req.body;

  // Validate status
  if (!verificationStatus || !['Pending', 'Verified', 'Rejected'].includes(verificationStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid verification status'
    });
  }

  // Find the service provider
  const serviceProvider = await ServiceProvider.findById(req.params.id);

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider not found'
    });
  }

  // Update verification status
  serviceProvider.verificationStatus = verificationStatus;
  await serviceProvider.save();

  // Get the updated provider with populated fields
  const updatedProvider = await ServiceProvider.findById(req.params.id)
    .populate('userId', 'firstName lastName email profilePicture')
    .populate('serviceCategory', 'categoryName');

  res.status(200).json({
    success: true,
    data: updatedProvider
  });
});

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const totalUsers = await User.countDocuments({ userType: 'customer' });
  const totalProviders = await ServiceProvider.countDocuments();
  const verifiedProviders = await ServiceProvider.countDocuments({ verificationStatus: 'Verified' });
  const pendingProviders = await ServiceProvider.countDocuments({ verificationStatus: 'Pending' });

  // Get additional statistics
  const totalListings = await ServiceListing.countDocuments({ isActive: true });
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({ bookingStatus: 'Pending' });
  const completedBookings = await Booking.countDocuments({ bookingStatus: 'Completed' });
  const openComplaints = await Complaint.countDocuments({ complaintStatus: 'Open' });

  // Get earnings data
  const earnings = await AdminEarnings.find().sort({ date: -1 }).limit(30);
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.totalCommissionEarned, 0);
  const averageDailyEarnings = totalEarnings / (earnings.length || 1);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProviders,
      verifiedProviders,
      pendingProviders,
      totalListings,
      totalBookings,
      pendingBookings,
      completedBookings,
      openComplaints,
      totalEarnings,
      averageDailyEarnings
    }
  });
});

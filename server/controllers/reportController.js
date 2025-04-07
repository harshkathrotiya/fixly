const Report = require('../models/Report');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Commission = require('../models/Commission');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Generate a new report
// @route   POST /api/reports
// @access  Private (Admin only)
exports.generateReport = asyncHandler(async (req, res) => {
  const { 
    reportType, 
    startDate, 
    endDate, 
    reportSummary 
  } = req.body;
  
  // Validate required fields
  if (!reportType || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  // Parse dates
  const timeFrame = {
    startDate: new Date(startDate),
    endDate: new Date(endDate)
  };
  
  // Generate report data based on type
  let reportData = {};
  let totalCommission = 0;
  let totalRevenue = 0;
  
  switch (reportType) {
    case 'Revenue':
      // Get all payments in the time frame
      const payments = await Payment.find({
        paymentDateTime: { $gte: timeFrame.startDate, $lte: timeFrame.endDate },
        paymentStatus: 'Completed'
      });
      
      // Calculate totals
      totalRevenue = payments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
      totalCommission = payments.reduce((sum, payment) => sum + payment.commissionAmount, 0);
      
      // Group by day
      const dailyRevenue = {};
      payments.forEach(payment => {
        const date = payment.paymentDateTime.toISOString().split('T')[0];
        if (!dailyRevenue[date]) {
          dailyRevenue[date] = {
            revenue: 0,
            commission: 0,
            count: 0
          };
        }
        dailyRevenue[date].revenue += payment.paymentAmount;
        dailyRevenue[date].commission += payment.commissionAmount;
        dailyRevenue[date].count += 1;
      });
      
      reportData = {
        totalRevenue,
        totalCommission,
        paymentCount: payments.length,
        dailyBreakdown: dailyRevenue
      };
      break;
      
    case 'Bookings':
      // Get all bookings in the time frame
      const bookings = await Booking.find({
        bookingDateTime: { $gte: timeFrame.startDate, $lte: timeFrame.endDate }
      });
      
      // Count by status
      const statusCounts = {
        Pending: 0,
        Confirmed: 0,
        Completed: 0,
        Cancelled: 0,
        Rejected: 0
      };
      
      bookings.forEach(booking => {
        statusCounts[booking.bookingStatus] += 1;
      });
      
      // Calculate totals for completed bookings
      const completedBookings = bookings.filter(booking => booking.bookingStatus === 'Completed');
      totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
      totalCommission = completedBookings.reduce((sum, booking) => sum + booking.commissionAmount, 0);
      
      reportData = {
        totalBookings: bookings.length,
        statusCounts,
        completedBookings: completedBookings.length,
        totalRevenue,
        totalCommission
      };
      break;
      
    case 'Providers':
      // Get all service providers
      const providers = await ServiceProvider.find()
        .populate({
          path: 'userId',
          select: 'firstName lastName email'
        });
      
      // Get bookings for each provider in the time frame
      const providerStats = await Promise.all(providers.map(async (provider) => {
        const providerBookings = await Booking.find({
          serviceProviderId: provider._id,
          bookingDateTime: { $gte: timeFrame.startDate, $lte: timeFrame.endDate }
        });
        
        const completedBookings = providerBookings.filter(booking => booking.bookingStatus === 'Completed');
        const providerRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        const providerCommission = completedBookings.reduce((sum, booking) => sum + booking.commissionAmount, 0);
        
        return {
          providerId: provider._id,
          name: `${provider.userId.firstName} ${provider.userId.lastName}`,
          email: provider.userId.email,
          totalBookings: providerBookings.length,
          completedBookings: completedBookings.length,
          revenue: providerRevenue,
          commission: providerCommission,
          rating: provider.rating
        };
      }));
      
      // Calculate totals
      totalRevenue = providerStats.reduce((sum, provider) => sum + provider.revenue, 0);
      totalCommission = providerStats.reduce((sum, provider) => sum + provider.commission, 0);
      
      reportData = {
        totalProviders: providers.length,
        providerStats,
        totalRevenue,
        totalCommission
      };
      break;
      
    case 'Customers':
      // Get all customers
      const customers = await User.find({ userType: 'customer' });
      
      // Get bookings for each customer in the time frame
      const customerStats = await Promise.all(customers.map(async (customer) => {
        const customerBookings = await Booking.find({
          customerId: customer._id,
          bookingDateTime: { $gte: timeFrame.startDate, $lte: timeFrame.endDate }
        });
        
        const completedBookings = customerBookings.filter(booking => booking.bookingStatus === 'Completed');
        const customerSpending = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        
        return {
          customerId: customer._id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          totalBookings: customerBookings.length,
          completedBookings: completedBookings.length,
          spending: customerSpending
        };
      }));
      
      // Calculate totals
      totalRevenue = customerStats.reduce((sum, customer) => sum + customer.spending, 0);
      
      reportData = {
        totalCustomers: customers.length,
        customerStats,
        totalRevenue
      };
      break;
      
    case 'Complaints':
      // Get all complaints in the time frame
      const complaints = await Complaint.find({
        complaintDateTime: { $gte: timeFrame.startDate, $lte: timeFrame.endDate }
      })
      .populate({
        path: 'customerId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'bookingId',
        populate: {
          path: 'serviceProviderId',
          select: 'userId',
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        }
      });
      
      // Count by status
      const complaintStatusCounts = {
        Open: 0,
        'Under Review': 0,
        Resolved: 0,
        Closed: 0
      };
      
      complaints.forEach(complaint => {
        complaintStatusCounts[complaint.complaintStatus] += 1;
      });
      
      reportData = {
        totalComplaints: complaints.length,
        statusCounts: complaintStatusCounts,
        complaints: complaints.map(complaint => ({
          id: complaint._id,
          customer: `${complaint.customerId.firstName} ${complaint.customerId.lastName}`,
          provider: complaint.bookingId.serviceProviderId ? 
            `${complaint.bookingId.serviceProviderId.userId.firstName} ${complaint.bookingId.serviceProviderId.userId.lastName}` : 
            'Unknown',
          status: complaint.complaintStatus,
          date: complaint.complaintDateTime
        }))
      };
      break;
      
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
  }
  
  // Create report
  const report = await Report.create({
    adminId: req.user.id,
    reportType,
    reportData,
    reportSummary: reportSummary || `${reportType} report from ${startDate} to ${endDate}`,
    timeFrame,
    totalCommission,
    totalRevenue
  });
  
  res.status(201).json({
    success: true,
    data: report
  });
});

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Admin only)
exports.getAllReports = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filtering
  let query = {};
  
  if (req.query.type) {
    query.reportType = req.query.type;
  }
  
  if (req.query.from && req.query.to) {
    query.generatedAt = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to)
    };
  }
  
  const reports = await Report.find(query)
    .populate({
      path: 'adminId',
      select: 'firstName lastName'
    })
    .sort({ generatedAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  const total = await Report.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: reports.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: reports
  });
});

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private (Admin only)
exports.getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate({
      path: 'adminId',
      select: 'firstName lastName'
    });
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: report
  });
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Admin only)
exports.deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found'
    });
  }
  
  await report.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});
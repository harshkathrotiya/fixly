const AdminEarnings = require('../models/AdminEarnings');
const Commission = require('../models/Commission');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all admin earnings
// @route   GET /api/admin/earnings
// @access  Private (Admin only)
exports.getAllEarnings = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filtering
  let query = {};
  
  if (req.query.from && req.query.to) {
    query.date = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to)
    };
  }
  
  const earnings = await AdminEarnings.find(query)
    .sort({ date: -1 })
    .skip(startIndex)
    .limit(limit);
  
  const total = await AdminEarnings.countDocuments(query);
  
  // Calculate totals
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.totalCommissionEarned, 0);
  const totalBookings = earnings.reduce((sum, earning) => sum + earning.totalBookings, 0);
  
  res.status(200).json({
    success: true,
    count: earnings.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    summary: {
      totalEarnings,
      totalBookings
    },
    data: earnings
  });
});

// @desc    Get earnings by ID
// @route   GET /api/admin/earnings/:id
// @access  Private (Admin only)
exports.getEarningsById = asyncHandler(async (req, res) => {
  const earnings = await AdminEarnings.findById(req.params.id)
    .populate({
      path: 'commissions',
      populate: [
        {
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
  
  if (!earnings) {
    return res.status(404).json({
      success: false,
      message: 'Earnings record not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: earnings
  });
});

// @desc    Get earnings summary
// @route   GET /api/admin/earnings/summary
// @access  Private (Admin only)
exports.getEarningsSummary = asyncHandler(async (req, res) => {
  // Get date range
  const { period } = req.query;
  let startDate, endDate;
  const now = new Date();
  
  switch (period) {
    case 'week':
      // Last 7 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      endDate = now;
      break;
    case 'month':
      // Last 30 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      endDate = now;
      break;
    case 'year':
      // Last 365 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 365);
      endDate = now;
      break;
    default:
      // Default to last 30 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      endDate = now;
  }
  
  // Get earnings in date range
  const earnings = await AdminEarnings.find({
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
  
  // Calculate totals
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.totalCommissionEarned, 0);
  const totalBookings = earnings.reduce((sum, earning) => sum + earning.totalBookings, 0);
  
  // Group by day/week/month for chart data
  let chartData = [];
  
  if (period === 'week') {
    // Group by day
    earnings.forEach(earning => {
      chartData.push({
        date: earning.date.toISOString().split('T')[0],
        earnings: earning.totalCommissionEarned,
        bookings: earning.totalBookings
      });
    });
  } else if (period === 'month') {
    // Group by day
    earnings.forEach(earning => {
      chartData.push({
        date: earning.date.toISOString().split('T')[0],
        earnings: earning.totalCommissionEarned,
        bookings: earning.totalBookings
      });
    });
  } else {
    // Group by month
    const monthlyData = {};
    
    earnings.forEach(earning => {
      const monthYear = earning.date.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          earnings: 0,
          bookings: 0
        };
      }
      
      monthlyData[monthYear].earnings += earning.totalCommissionEarned;
      monthlyData[monthYear].bookings += earning.totalBookings;
    });
    
    // Convert to array
    for (const [monthYear, data] of Object.entries(monthlyData)) {
      chartData.push({
        date: monthYear,
        earnings: data.earnings,
        bookings: data.bookings
      });
    }
    
    // Sort by date
    chartData.sort((a, b) => a.date.localeCompare(b.date));
  }
  
  res.status(200).json({
    success: true,
    summary: {
      period,
      totalEarnings,
      totalBookings,
      averageDailyEarnings: totalEarnings / earnings.length || 0
    },
    chartData
  });
});

// @desc    Update earnings notes
// @route   PUT /api/admin/earnings/:id
// @access  Private (Admin only)
exports.updateEarnings = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  
  const earnings = await AdminEarnings.findById(req.params.id);
  
  if (!earnings) {
    return res.status(404).json({
      success: false,
      message: 'Earnings record not found'
    });
  }
  
  if (notes) earnings.notes = notes;
  
  await earnings.save();
  
  res.status(200).json({
    success: true,
    data: earnings
  });
});
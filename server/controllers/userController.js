const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all users with pagination, sorting, and filtering
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res) => {
  // Extract query parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const sortField = req.query.sort || 'createdAt';
  const sortOrder = req.query.order === 'desc' ? -1 : 1;
  const role = req.query.role;
  const search = req.query.search;
  const status = req.query.status;

  // Build query
  let query = {};

  // Filter by role if provided
  if (role && role !== 'all') {
    query.userType = role;
  }

  // Filter by status if provided
  if (status && status !== 'all') {
    query.isActive = status === 'active';
  }

  // Search by name or email
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination and sorting
  const total = await User.countDocuments(query);

  // Create sort object
  const sortObj = {};
  sortObj[sortField] = sortOrder;

  const users = await User.find(query)
    .select('-password')
    .sort(sortObj)
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users
  });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create a user
// @route   POST /api/users
// @access  Private (Admin only)
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = asyncHandler(async (req, res) => {
  // Check if user is an admin and prevent deletion of the last admin
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // If user is an admin, check if they're the last admin
  if (user.userType === 'admin') {
    const adminCount = await User.countDocuments({ userType: 'admin' });
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last admin user'
      });
    }
  }

  // If user is a service provider, check if they have associated data
  if (user.userType === 'service_provider') {
    const provider = await ServiceProvider.findOne({ userId: user._id });
    if (provider) {
      // Instead of deleting, mark as inactive
      user.isActive = false;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'User has been deactivated instead of deleted due to associated provider data',
        data: user
      });
    }
  }

  // Delete the user
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: {}
  });
});

// @desc    Toggle user active status
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // If user is an admin and active, check if they're the last active admin
  if (user.userType === 'admin' && user.isActive) {
    const activeAdminCount = await User.countDocuments({
      userType: 'admin',
      isActive: true
    });

    if (activeAdminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate the last active admin user'
      });
    }
  }

  // Toggle the status
  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});
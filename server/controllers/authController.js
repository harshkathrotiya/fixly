const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');
const { error } = require('console');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const {
    userType,
    username,
    password,
    firstName,
    lastName,
    email,
    phone,
    address
  } = req.body;

  // Create user
  try{
  const user = await User.create({
    userType,
    username,
    password,
    firstName,
    lastName,
    email,
    phone,
    address
  });

  sendTokenResponse(user, 201, res);
}catch(err){
  console.error(err);
  res.status(500).json({
    sucess : false,
    message : 'Server error'
  });
}
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.'
    });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  // Create an object with only the fields that are provided in the request
  const fieldsToUpdate = {};

  // Only add fields that are present in the request body
  if (req.body.firstName) fieldsToUpdate.firstName = req.body.firstName;
  if (req.body.lastName) fieldsToUpdate.lastName = req.body.lastName;
  if (req.body.email) fieldsToUpdate.email = req.body.email;
  if (req.body.phone) fieldsToUpdate.phone = req.body.phone;

  // Handle address field - can be either direct or from businessAddress
  if (req.body.address) fieldsToUpdate.address = req.body.address;
  else if (req.body.businessAddress) fieldsToUpdate.address = req.body.businessAddress;

  if (req.body.businessName) fieldsToUpdate.businessName = req.body.businessName;
  if (req.body.description) fieldsToUpdate.description = req.body.description;

  // Add profile picture if it's in the request
  if (req.body.profilePicture) {
    fieldsToUpdate.profilePicture = req.body.profilePicture;
  }

  console.log('Fields to update:', fieldsToUpdate);

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    console.log('Updated user:', user);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
// Update password function
exports.updatePassword = asyncHandler(async (req, res) => {
  // Make sure to include the password field with .select('+password')
  const user = await User.findById(req.user.id).select('+password');

  // Check if user exists and has a password field
  if (!user || !user.password) {
    return res.status(400).json({
      success: false,
      message: 'User not found or password field is missing'
    });
  }

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  console.log('Forgot password request received for email:', req.body.email);

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    console.log('No user found with email:', req.body.email);
    return res.status(404).json({
      success: false,
      message: 'There is no user with that email'
    });
  }

  console.log('User found, generating reset token');

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  console.log('Generated reset token:', resetToken);

  await user.save({ validateBeforeSave: false });

  // Create reset url - point to frontend instead of API
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  console.log('Reset password request received with token:', req.params.resettoken);

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  console.log('Hashed token:', resetPasswordToken);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  console.log('User found:', user ? 'Yes' : 'No');

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    count: users.length,
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

// Generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};
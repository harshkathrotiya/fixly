const ServiceCategory = require('../models/ServiceCategory');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create a new service category
// @route   POST /api/categories
// @access  Private (Admin only)
exports.createCategory = asyncHandler(async (req, res) => {
  const { categoryName, categoryDescription, parentCategory } = req.body;

  // Check if category already exists
  const existingCategory = await ServiceCategory.findOne({ categoryName });

  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category already exists'
    });
  }

  // Create category
  const category = await ServiceCategory.create({
    categoryName,
    categoryDescription,
    parentCategory: parentCategory || null
  });

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Upload category image
// @route   PUT /api/categories/:id/image
// @access  Private (Admin only)
exports.uploadCategoryImage = asyncHandler(async (req, res) => {
  try {
    console.log('Uploading category image, request file:', req.file);

    const category = await ServiceCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    console.log('File received:', req.file);
    console.log('File path:', req.file.path);

    // Update category with image URL
    category.categoryImage = req.file.path;
    await category.save();

    console.log('Category updated with image:', category);

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error in uploadCategoryImage:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await ServiceCategory.find({ isActive: true })
    .populate('parentCategory', 'categoryName');

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id)
    .populate('parentCategory', 'categoryName categoryDescription');

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
exports.updateCategory = asyncHandler(async (req, res) => {
  const { categoryName, categoryDescription, isActive, parentCategory } = req.body;

  let category = await ServiceCategory.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Update fields
  if (categoryName) category.categoryName = categoryName;
  if (categoryDescription) category.categoryDescription = categoryDescription;
  if (isActive !== undefined) category.isActive = isActive;
  if (parentCategory !== undefined) category.parentCategory = parentCategory || null;

  await category.save();

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Instead of deleting, mark as inactive
  category.isActive = false;
  await category.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
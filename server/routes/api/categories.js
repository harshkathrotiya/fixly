const express = require('express');
const {
  createCategory,
  uploadCategoryImage,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../../controllers/serviceCategoryController');

const { protect, authorize } = require('../../middleware/auth');
const { categoryImageUpload } = require('../../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin only routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.put(
  '/:id/image',
  protect,
  authorize('admin'),
  categoryImageUpload.single('image'),
  uploadCategoryImage
);

module.exports = router;
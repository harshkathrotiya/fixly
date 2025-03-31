const mongoose = require('mongoose');

const ServiceCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  categoryDescription: {
    type: String,
    required: [true, 'Please provide a category description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  categoryImage: {
    type: String,
    default: 'default-category.jpg'
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategory', ServiceCategorySchema);
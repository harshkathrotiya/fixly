const mongoose = require('mongoose');

const ServiceListingSchema = new mongoose.Schema({
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: true
  },
  serviceTitle: {
    type: String,
    required: [true, 'Please provide a service title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  servicePrice: {
    type: Number,
    required: [true, 'Please provide a service price'],
    min: [0, 'Price cannot be negative']
  },
  serviceDetails: {
    type: String,
    required: [true, 'Please provide service details'],
    maxlength: [1000, 'Details cannot be more than 1000 characters']
  },
  serviceImage: {
    type: String,
    default: 'default-service.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  commissionAmount: {
    type: Number,
    default: 0
  },
  providerEarning: {
    type: Number,
    default: 0
  },
  tags: [String],
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Calculate commission and provider earnings before saving
ServiceListingSchema.pre('save', async function(next) {
  if (this.isModified('servicePrice')) {
    try {
      const ServiceProvider = mongoose.model('ServiceProvider');
      const provider = await ServiceProvider.findById(this.serviceProviderId);
      
      if (provider) {
        const commissionRate = provider.commissionRate || 10; // Default 10% if not set
        this.commissionAmount = (this.servicePrice * commissionRate) / 100;
        this.providerEarning = this.servicePrice - this.commissionAmount;
      }
    } catch (err) {
      console.error('Error calculating commission:', err);
    }
  }
  next();
});

module.exports = mongoose.model('ServiceListing', ServiceListingSchema);
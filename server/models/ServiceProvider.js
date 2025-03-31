const mongoose = require('mongoose');

const ServiceProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  serviceCategory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  }],
  serviceDescription: {
    type: String,
    required: [true, 'Please provide a service description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  availability: {
    type: String,
    enum: ['Weekdays', 'Weekends', 'All Days', 'Custom'],
    default: 'All Days'
  },
  availabilityDetails: {
    type: Object,
    default: {}
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  commissionRate: {
    type: Number,
    default: 10, // Default 10% commission
    min: 0,
    max: 30
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalCommissionPaid: {
    type: Number,
    default: 0
  },
  documentsVerified: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  }
}, { timestamps: true });

// Create geospatial index for location-based queries
ServiceProviderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);
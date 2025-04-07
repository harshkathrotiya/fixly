const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  serviceListingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceListing',
    required: true
  },
  bookingDateTime: {
    type: Date,
    default: Date.now
  },
  serviceDateTime: {
    type: Date,
    required: [true, 'Please provide service date and time']
  },
  bookingStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'],
    default: 'Pending'
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot be more than 500 characters']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  commissionAmount: {
    type: Number,
    default: 0
  },
  providerEarning: {
    type: Number,
    default: 0
  },
  commissionPaid: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Calculate commission and provider earnings before saving
BookingSchema.pre('save', async function(next) {
  if (this.isModified('totalAmount')) {
    try {
      const ServiceProvider = mongoose.model('ServiceProvider');
      const provider = await ServiceProvider.findById(this.serviceProviderId);
      
      if (provider) {
        const commissionRate = provider.commissionRate || 10; // Default 10% if not set
        this.commissionAmount = (this.totalAmount * commissionRate) / 100;
        this.providerEarning = this.totalAmount - this.commissionAmount;
      }
    } catch (err) {
      console.error('Error calculating commission:', err);
    }
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
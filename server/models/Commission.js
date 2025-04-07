const mongoose = require('mongoose');

const CommissionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  status: {
    type: String,
    enum: ['Pending', 'Collected', 'Refunded'],
    default: 'Pending'
  },
  collectionDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, { timestamps: true });

module.exports = mongoose.model('Commission', CommissionSchema);
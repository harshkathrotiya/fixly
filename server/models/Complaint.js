const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  complaintDateTime: {
    type: Date,
    default: Date.now
  },
  complaintText: {
    type: String,
    required: [true, 'Please provide complaint details'],
    maxlength: [1000, 'Complaint text cannot be more than 1000 characters']
  },
  complaintStatus: {
    type: String,
    enum: ['Open', 'Under Review', 'Resolved', 'Closed'],
    default: 'Open'
  },
  resolutionNotes: {
    type: String,
    maxlength: [1000, 'Resolution notes cannot be more than 1000 characters']
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedDateTime: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
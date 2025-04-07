const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Cash'],
    required: true
  },
  paymentDateTime: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  providerAmount: {
    type: Number,
    required: true
  },
  commissionTransferStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  providerTransferStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
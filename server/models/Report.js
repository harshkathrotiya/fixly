const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['Revenue', 'Bookings', 'Providers', 'Customers', 'Complaints', 'Custom'],
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  reportData: {
    type: Object,
    required: true
  },
  reportSummary: {
    type: String,
    required: true
  },
  timeFrame: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
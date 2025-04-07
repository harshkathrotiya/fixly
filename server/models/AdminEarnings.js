const mongoose = require('mongoose');

const AdminEarningsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  totalCommissionEarned: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  commissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commission'
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminEarnings', AdminEarningsSchema);
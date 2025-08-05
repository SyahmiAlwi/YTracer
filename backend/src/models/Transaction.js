const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Amount must be greater than 0'
    }
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    default: null // Null for general outgoing costs (e.g., YouTube subscription itself)
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['Incoming', 'Outgoing'],
      message: 'Transaction type must be either Incoming or Outgoing'
    }
  },
  category: {
    type: String,
    enum: {
      values: ['Subscription', 'Member Payment', 'General', 'Refund', 'Other'],
      message: 'Invalid category'
    },
    default: 'Other'
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['Bank Transfer', 'Cash', 'Credit Card', 'E-Wallet', 'Other'],
      message: 'Invalid payment method'
    },
    default: 'Other'
  },
  status: {
    type: String,
    enum: {
      values: ['Completed', 'Pending', 'Failed', 'Cancelled'],
      message: 'Invalid status'
    },
    default: 'Completed'
  },
  receiptNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Receipt number cannot exceed 50 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `RM${this.amount.toFixed(2)}`;
});

// Virtual for formatted date
transactionSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-MY');
});

// Indexes for better query performance
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ memberId: 1, date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ status: 1 });

// Pre-save middleware to validate memberId
transactionSchema.pre('save', function(next) {
  if (this.type === 'Incoming' && !this.memberId) {
    next(new Error('Incoming transactions must be associated with a member'));
  }
  next();
});

// Static method to get total income
transactionSchema.statics.getTotalIncome = function(startDate, endDate) {
  const query = { type: 'Incoming' };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
};

// Static method to get total outgoing
transactionSchema.statics.getTotalOutgoing = function(startDate, endDate) {
  const query = { type: 'Outgoing' };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
};

// Static method to get net balance
transactionSchema.statics.getNetBalance = function(startDate, endDate) {
  const dateFilter = startDate && endDate ? { date: { $gte: startDate, $lte: endDate } } : {};
  
  return this.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        income: {
          $sum: {
            $cond: [{ $eq: ['$type', 'Incoming'] }, '$amount', 0]
          }
        },
        outgoing: {
          $sum: {
            $cond: [{ $eq: ['$type', 'Outgoing'] }, '$amount', 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        netBalance: { $subtract: ['$income', '$outgoing'] },
        totalIncome: '$income',
        totalOutgoing: '$outgoing'
      }
    }
  ]);
};

// Static method to get transactions by member
transactionSchema.statics.getTransactionsByMember = function(memberId, limit = 10) {
  return this.find({ memberId })
    .sort({ date: -1 })
    .limit(limit)
    .populate('memberId', 'name');
};

// Static method to get recent transactions
transactionSchema.statics.getRecentTransactions = function(limit = 10) {
  return this.find()
    .sort({ date: -1 })
    .limit(limit)
    .populate('memberId', 'name');
};

module.exports = mongoose.model('Transaction', transactionSchema); 
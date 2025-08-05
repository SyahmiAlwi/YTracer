const mongoose = require('mongoose');

const cardTransactionSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CardDetail',
    required: [true, 'Card ID is required']
  },
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
      values: ['Deposit', 'Withdrawal'],
      message: 'Transaction type must be either Deposit or Withdrawal'
    }
  },
  category: {
    type: String,
    enum: {
      values: ['YouTube Premium', 'Manual Deposit', 'Automatic Payment', 'Refund', 'Other'],
      message: 'Invalid category'
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
  referenceNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Reference number cannot exceed 50 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  balanceAfter: {
    type: Number,
    required: [true, 'Balance after transaction is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted amount
cardTransactionSchema.virtual('formattedAmount').get(function() {
  return `RM${this.amount.toFixed(2)}`;
});

// Virtual for formatted date
cardTransactionSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-MY');
});

// Virtual for formatted balance after
cardTransactionSchema.virtual('formattedBalanceAfter').get(function() {
  return `RM${this.balanceAfter.toFixed(2)}`;
});

// Indexes for better query performance
cardTransactionSchema.index({ cardId: 1, date: -1 });
cardTransactionSchema.index({ date: -1 });
cardTransactionSchema.index({ type: 1, date: -1 });
cardTransactionSchema.index({ category: 1 });
cardTransactionSchema.index({ status: 1 });

// Pre-save middleware to update card balance
cardTransactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const CardDetail = mongoose.model('CardDetail');
      const card = await CardDetail.findById(this.cardId);
      
      if (!card) {
        throw new Error('Card not found');
      }
      
      if (this.type === 'Deposit') {
        this.balanceAfter = card.currentBalance + this.amount;
        card.currentBalance = this.balanceAfter;
      } else if (this.type === 'Withdrawal') {
        if (card.currentBalance < this.amount) {
          throw new Error('Insufficient balance');
        }
        this.balanceAfter = card.currentBalance - this.amount;
        card.currentBalance = this.balanceAfter;
      }
      
      await card.save();
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Static method to get card balance
cardTransactionSchema.statics.getCardBalance = function(cardId) {
  return this.findOne({ cardId })
    .sort({ date: -1 })
    .select('balanceAfter');
};

// Static method to get total deposits
cardTransactionSchema.statics.getTotalDeposits = function(cardId, startDate, endDate) {
  const query = { cardId, type: 'Deposit' };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
};

// Static method to get total withdrawals
cardTransactionSchema.statics.getTotalWithdrawals = function(cardId, startDate, endDate) {
  const query = { cardId, type: 'Withdrawal' };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
};

// Static method to get recent transactions for a card
cardTransactionSchema.statics.getRecentCardTransactions = function(cardId, limit = 10) {
  return this.find({ cardId })
    .sort({ date: -1 })
    .limit(limit)
    .populate('cardId', 'cardName lastFourDigits');
};

// Static method to get transactions by category
cardTransactionSchema.statics.getTransactionsByCategory = function(cardId, category, limit = 10) {
  return this.find({ cardId, category })
    .sort({ date: -1 })
    .limit(limit)
    .populate('cardId', 'cardName lastFourDigits');
};

module.exports = mongoose.model('CardTransaction', cardTransactionSchema); 
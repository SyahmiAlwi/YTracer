const mongoose = require('mongoose');

const cardDetailSchema = new mongoose.Schema({
  cardName: {
    type: String,
    required: [true, 'Card name is required'],
    trim: true,
    maxlength: [100, 'Card name cannot exceed 100 characters']
  },
  lastFourDigits: {
    type: String,
    required: [true, 'Last four digits are required'],
    validate: {
      validator: function(v) {
        return /^\d{4}$/.test(v);
      },
      message: 'Last four digits must be exactly 4 digits'
    }
  },
  expiryDate: {
    type: String,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(v) {
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v);
      },
      message: 'Expiry date must be in MM/YY format'
    }
  },
  cardType: {
    type: String,
    enum: {
      values: ['Visa', 'Mastercard', 'American Express', 'Other'],
      message: 'Invalid card type'
    },
    default: 'Other'
  },
  bankName: {
    type: String,
    trim: true,
    maxlength: [100, 'Bank name cannot exceed 100 characters']
  },
  cardHolderName: {
    type: String,
    trim: true,
    maxlength: [100, 'Card holder name cannot exceed 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  monthlyLimit: {
    type: Number,
    min: [0, 'Monthly limit cannot be negative'],
    default: 1000
  },
  currentBalance: {
    type: Number,
    default: 0,
    min: [0, 'Current balance cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for masked card number
cardDetailSchema.virtual('maskedCardNumber').get(function() {
  return `**** **** **** ${this.lastFourDigits}`;
});

// Virtual for formatted expiry date
cardDetailSchema.virtual('formattedExpiryDate').get(function() {
  return this.expiryDate;
});

// Virtual for card status
cardDetailSchema.virtual('status').get(function() {
  if (!this.isActive) return 'Inactive';
  
  const [month, year] = this.expiryDate.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const today = new Date();
  
  if (expiryDate < today) return 'Expired';
  if (expiryDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) return 'Expiring Soon';
  return 'Active';
});

// Index for better query performance
cardDetailSchema.index({ isActive: 1 });
cardDetailSchema.index({ cardType: 1 });

// Pre-save middleware to validate expiry date
cardDetailSchema.pre('save', function(next) {
  const [month, year] = this.expiryDate.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const today = new Date();
  
  if (expiryDate < today) {
    this.isActive = false;
  }
  
  next();
});

// Static method to get active cards
cardDetailSchema.statics.getActiveCards = function() {
  return this.find({ isActive: true });
};

// Static method to get expiring cards
cardDetailSchema.statics.getExpiringCards = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    isActive: true,
    $expr: {
      $and: [
        {
          $let: {
            vars: {
              month: { $substr: ['$expiryDate', 0, 2] },
              year: { $substr: ['$expiryDate', 3, 2] }
            },
            in: {
              $lt: [
                { $dateFromString: { dateString: { $concat: ['2000', '$$year', '-', '$$month', '-01'] } } },
                futureDate
              ]
            }
          }
        }
      ]
    }
  });
};

module.exports = mongoose.model('CardDetail', cardDetailSchema); 
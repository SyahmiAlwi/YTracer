const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  paymentType: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: {
      values: ['Monthly', 'Yearly'],
      message: 'Payment type must be either Monthly or Yearly'
    }
  },
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['Paid', 'Unpaid'],
      message: 'Payment status must be either Paid or Unpaid'
    },
    default: 'Unpaid'
  },
  lastPaymentDate: {
    type: Date,
    required: [true, 'Last payment date is required']
  },
  nextDueDate: {
    type: Date,
    required: [true, 'Next due date is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  monthlyAmount: {
    type: Number,
    required: [true, 'Monthly amount is required'],
    min: [0, 'Monthly amount cannot be negative'],
    default: 3.79
  },
  yearlyAmount: {
    type: Number,
    required: [true, 'Yearly amount is required'],
    min: [0, 'Yearly amount cannot be negative'],
    default: 45.48
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting the current amount based on payment type
memberSchema.virtual('currentAmount').get(function() {
  return this.paymentType === 'Yearly' ? this.yearlyAmount : this.monthlyAmount;
});

// Virtual for checking if payment is overdue
memberSchema.virtual('isOverdue').get(function() {
  return this.paymentStatus === 'Unpaid' && new Date() > new Date(this.nextDueDate);
});

// Virtual for days until due
memberSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  const dueDate = new Date(this.nextDueDate);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Index for better query performance
memberSchema.index({ paymentStatus: 1, nextDueDate: 1 });
memberSchema.index({ name: 1 });

// Pre-save middleware to validate dates
memberSchema.pre('save', function(next) {
  if (this.lastPaymentDate > this.nextDueDate) {
    next(new Error('Last payment date cannot be after next due date'));
  }
  next();
});

// Static method to get overdue members
memberSchema.statics.getOverdueMembers = function() {
  return this.find({
    paymentStatus: 'Unpaid',
    nextDueDate: { $lt: new Date() }
  });
};

// Static method to get upcoming payments
memberSchema.statics.getUpcomingPayments = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    paymentStatus: 'Unpaid',
    nextDueDate: { 
      $gte: new Date(),
      $lte: futureDate
    }
  });
};

module.exports = mongoose.model('Member', memberSchema); 
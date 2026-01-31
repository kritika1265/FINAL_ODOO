const mongoose = require('mongoose');

const rentalPricingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  // Pricing tiers
  hourlyRate: {
    type: Number,
    min: 0,
    default: null
  },
  dailyRate: {
    type: Number,
    min: 0,
    default: null
  },
  weeklyRate: {
    type: Number,
    min: 0,
    default: null
  },
  monthlyRate: {
    type: Number,
    min: 0,
    default: null
  },
  // Custom pricing periods
  customPeriods: [{
    durationValue: {
      type: Number,
      required: true,
      min: 1
    },
    durationType: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: String
  }],
  // Minimum rental period
  minimumRentalPeriod: {
    value: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      default: 'days'
    }
  },
  // Maximum rental period
  maximumRentalPeriod: {
    value: {
      type: Number,
      default: null
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      default: null
    }
  },
  // Security deposit
  securityDeposit: {
    type: Number,
    min: 0,
    default: 0
  },
  securityDepositType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  // Late return fees
  lateReturnFee: {
    type: Number,
    min: 0,
    default: 0
  },
  lateReturnFeeType: {
    type: String,
    enum: ['per_hour', 'per_day', 'fixed'],
    default: 'per_day'
  },
  // Grace period for returns (in hours)
  gracePeriodHours: {
    type: Number,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
rentalPricingSchema.index({ product: 1 });

// Method to calculate rental price based on duration
rentalPricingSchema.methods.calculateRentalPrice = function(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;
  const diffWeeks = diffDays / 7;
  const diffMonths = diffDays / 30; // Approximate
  
  let calculatedPrice = 0;
  
  // Calculate based on best rate
  if (this.monthlyRate && diffMonths >= 1) {
    const months = Math.ceil(diffMonths);
    calculatedPrice = this.monthlyRate * months;
  } else if (this.weeklyRate && diffWeeks >= 1) {
    const weeks = Math.ceil(diffWeeks);
    calculatedPrice = this.weeklyRate * weeks;
  } else if (this.dailyRate && diffDays >= 1) {
    const days = Math.ceil(diffDays);
    calculatedPrice = this.dailyRate * days;
  } else if (this.hourlyRate) {
    const hours = Math.ceil(diffHours);
    calculatedPrice = this.hourlyRate * hours;
  }
  
  return calculatedPrice;
};

// Method to calculate security deposit
rentalPricingSchema.methods.calculateSecurityDeposit = function(rentalPrice) {
  if (this.securityDepositType === 'percentage') {
    return (rentalPrice * this.securityDeposit) / 100;
  }
  return this.securityDeposit;
};

// Method to calculate late fees
rentalPricingSchema.methods.calculateLateFee = function(expectedReturnDate, actualReturnDate) {
  const expected = new Date(expectedReturnDate);
  const actual = new Date(actualReturnDate);
  
  // Add grace period
  expected.setHours(expected.getHours() + this.gracePeriodHours);
  
  if (actual <= expected) {
    return 0;
  }
  
  const lateDiffMs = actual - expected;
  const lateHours = lateDiffMs / (1000 * 60 * 60);
  const lateDays = Math.ceil(lateHours / 24);
  
  if (this.lateReturnFeeType === 'per_hour') {
    return Math.ceil(lateHours) * this.lateReturnFee;
  } else if (this.lateReturnFeeType === 'per_day') {
    return lateDays * this.lateReturnFee;
  } else {
    return this.lateReturnFee;
  }
};

const RentalPricing = mongoose.model('RentalPricing', rentalPricingSchema);

module.exports = RentalPricing;
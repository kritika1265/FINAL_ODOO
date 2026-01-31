const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    required: [true, 'Quotation is required']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  // Product details snapshot (for historical accuracy)
  productSnapshot: {
    name: String,
    description: String,
    sku: String,
    attributes: [{
      name: String,
      value: String
    }]
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1,
    default: 1
  },
  // Rental period
  rentalStartDate: {
    type: Date,
    required: [true, 'Rental start date is required']
  },
  rentalEndDate: {
    type: Date,
    required: [true, 'Rental end date is required']
  },
  // Pricing
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: 0
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: 0
  },
  // Security deposit for this item
  securityDeposit: {
    type: Number,
    min: 0,
    default: 0
  },
  // Discount on this line item
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  // Tax on this line item
  taxRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  taxAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  // Calculated fields
  lineTotal: {
    type: Number,
    min: 0,
    default: 0
  },
  // Rental duration details
  rentalDuration: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months']
    }
  },
  // Notes specific to this item
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
quotationItemSchema.index({ quotation: 1 });
quotationItemSchema.index({ product: 1 });

// Validation: End date must be after start date
quotationItemSchema.pre('validate', function(next) {
  if (this.rentalEndDate <= this.rentalStartDate) {
    next(new Error('Rental end date must be after start date'));
  } else {
    next();
  }
});

// Pre-save hook to calculate totals
quotationItemSchema.pre('save', function(next) {
  // Calculate total price
  this.totalPrice = this.unitPrice * this.quantity;
  
  // Apply discount
  let discountedPrice = this.totalPrice;
  if (this.discountType === 'percentage') {
    discountedPrice = this.totalPrice - (this.totalPrice * this.discount / 100);
  } else {
    discountedPrice = this.totalPrice - this.discount;
  }
  
  // Calculate tax
  this.taxAmount = (discountedPrice * this.taxRate) / 100;
  
  // Calculate line total
  this.lineTotal = discountedPrice + this.taxAmount;
  
  next();
});

// Method to calculate rental duration
quotationItemSchema.methods.calculateRentalDuration = function() {
  const start = new Date(this.rentalStartDate);
  const end = new Date(this.rentalEndDate);
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;
  const diffWeeks = diffDays / 7;
  
  if (diffHours < 24) {
    return { value: Math.ceil(diffHours), unit: 'hours' };
  } else if (diffDays < 7) {
    return { value: Math.ceil(diffDays), unit: 'days' };
  } else {
    return { value: Math.ceil(diffWeeks), unit: 'weeks' };
  }
};

const QuotationItem = mongoose.model('QuotationItem', quotationItemSchema);

module.exports = QuotationItem;
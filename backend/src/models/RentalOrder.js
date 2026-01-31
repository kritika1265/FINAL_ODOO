const mongoose = require('mongoose');

const rentalOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor is required']
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'in_progress', 'completed', 'cancelled', 'overdue'],
    default: 'draft'
  },
  // Order lifecycle status
  pickupStatus: {
    type: String,
    enum: ['pending', 'ready', 'picked_up'],
    default: 'pending'
  },
  returnStatus: {
    type: String,
    enum: ['not_due', 'due_soon', 'overdue', 'returned'],
    default: 'not_due'
  },
  // Customer details snapshot
  customerDetails: {
    name: String,
    email: String,
    phone: String,
    companyName: String,
    gstin: String,
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  // Rental items (embedded or referenced)
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
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
      required: true,
      min: 1
    },
    rentalStartDate: {
      type: Date,
      required: true
    },
    rentalEndDate: {
      type: Date,
      required: true
    },
    unitPrice: Number,
    totalPrice: Number,
    securityDeposit: Number,
    discount: Number,
    discountType: {
      type: String,
      enum: ['fixed', 'percentage']
    },
    taxRate: Number,
    taxAmount: Number,
    lineTotal: Number,
    notes: String
  }],
  // Pricing summary
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalDiscount: {
    type: Number,
    min: 0,
    default: 0
  },
  totalTax: {
    type: Number,
    min: 0,
    default: 0
  },
  totalSecurityDeposit: {
    type: Number,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // Tax breakdown
  taxes: [{
    name: String,
    rate: Number,
    amount: Number
  }],
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  amountPaid: {
    type: Number,
    min: 0,
    default: 0
  },
  amountDue: {
    type: Number,
    min: 0,
    default: 0
  },
  // Late fees
  lateFees: {
    type: Number,
    min: 0,
    default: 0
  },
  // Pickup and return information
  expectedPickupDate: Date,
  actualPickupDate: Date,
  expectedReturnDate: Date,
  actualReturnDate: Date,
  // Pickup instructions
  pickupInstructions: {
    type: String,
    trim: true
  },
  // Return instructions
  returnInstructions: {
    type: String,
    trim: true
  },
  // Documents
  pickupDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup'
  },
  returnDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Return'
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  // Notes and terms
  notes: {
    type: String,
    trim: true
  },
  termsAndConditions: {
    type: String,
    trim: true
  },
  // Internal notes (vendor only)
  internalNotes: {
    type: String,
    trim: true
  },
  // Timestamps for workflow
  confirmedAt: Date,
  cancelledAt: Date,
  completedAt: Date,
  // Cancellation details
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
rentalOrderSchema.index({ customer: 1, status: 1 });
rentalOrderSchema.index({ vendor: 1, status: 1 });
rentalOrderSchema.index({ orderNumber: 1 });
rentalOrderSchema.index({ expectedReturnDate: 1 });
rentalOrderSchema.index({ pickupStatus: 1, returnStatus: 1 });

// Pre-save hook to generate order number
rentalOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('RentalOrder').countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `RO-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Calculate amount due
  this.amountDue = this.totalAmount - this.amountPaid;
  
  // Update payment status
  if (this.amountPaid === 0) {
    this.paymentStatus = 'pending';
  } else if (this.amountPaid >= this.totalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
  
  next();
});

// Method to check if order is overdue
rentalOrderSchema.methods.isOverdue = function() {
  if (!this.expectedReturnDate) return false;
  return new Date() > this.expectedReturnDate && this.returnStatus !== 'returned';
};

// Method to calculate days until return
rentalOrderSchema.methods.daysUntilReturn = function() {
  if (!this.expectedReturnDate) return null;
  const diffMs = this.expectedReturnDate - new Date();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Static method to update overdue orders
rentalOrderSchema.statics.updateOverdueOrders = async function() {
  const result = await this.updateMany(
    {
      expectedReturnDate: { $lt: new Date() },
      returnStatus: { $ne: 'returned' },
      status: { $in: ['confirmed', 'in_progress'] }
    },
    {
      $set: { 
        returnStatus: 'overdue',
        status: 'overdue'
      }
    }
  );
  return result;
};

// Static method to update due soon orders
rentalOrderSchema.statics.updateDueSoonOrders = async function() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  const result = await this.updateMany(
    {
      expectedReturnDate: { $lte: threeDaysFromNow, $gt: new Date() },
      returnStatus: 'not_due'
    },
    {
      $set: { returnStatus: 'due_soon' }
    }
  );
  return result;
};

const RentalOrder = mongoose.model('RentalOrder', rentalOrderSchema);

module.exports = RentalOrder;
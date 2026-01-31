const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  returnNumber: {
    type: String,
    unique: true,
    required: true
  },
  rentalOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalOrder',
    required: [true, 'Rental order is required']
  },
  pickup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup'
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
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'received', 'inspected', 'completed', 'disputed', 'cancelled'],
    default: 'pending'
  },
  // Return dates
  expectedReturnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: Date,
  receivedDate: Date,
  inspectedDate: Date,
  // Return location
  returnLocation: {
    type: {
      type: String,
      enum: ['vendor_location', 'customer_location', 'custom'],
      default: 'vendor_location'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      landmark: String
    },
    contactPerson: String,
    contactPhone: String
  },
  // Items being returned
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    productSku: String,
    quantityRented: {
      type: Number,
      required: true,
      min: 1
    },
    quantityReturned: {
      type: Number,
      default: 0,
      min: 0
    },
    quantityMissing: {
      type: Number,
      default: 0,
      min: 0
    },
    serialNumbers: [String],
    // Condition assessment
    conditionOnPickup: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor', 'damaged']
    },
    conditionOnReturn: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor', 'damaged']
    },
    conditionNotes: String,
    conditionImages: [String],
    // Damage assessment
    isDamaged: {
      type: Boolean,
      default: false
    },
    damageDescription: String,
    damageImages: [String],
    damageCharges: {
      type: Number,
      min: 0,
      default: 0
    },
    repairCost: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  // Return method
  returnMethod: {
    type: String,
    enum: ['self_return', 'pickup', 'courier'],
    default: 'self_return'
  },
  // Courier details (if applicable)
  courierDetails: {
    courierService: String,
    trackingNumber: String,
    shippedDate: Date,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date
  },
  // Late return assessment
  isLate: {
    type: Boolean,
    default: false
  },
  daysLate: {
    type: Number,
    default: 0,
    min: 0
  },
  lateFeeAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  lateFeeDetails: {
    feePerDay: Number,
    gracePeriodHours: Number,
    calculatedAt: Date
  },
  // Inspection details
  inspection: {
    performed: {
      type: Boolean,
      default: false
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: Date,
    passed: Boolean,
    notes: String,
    checklist: [{
      item: String,
      status: {
        type: String,
        enum: ['pass', 'fail', 'na']
      },
      notes: String
    }],
    images: [String]
  },
  // Damages and charges
  totalDamageCharges: {
    type: Number,
    min: 0,
    default: 0
  },
  totalLateFees: {
    type: Number,
    min: 0,
    default: 0
  },
  otherCharges: [{
    description: String,
    amount: Number,
    category: {
      type: String,
      enum: ['cleaning', 'missing_parts', 'wear_tear', 'other']
    }
  }],
  totalAdditionalCharges: {
    type: Number,
    min: 0,
    default: 0
  },
  // Security deposit
  securityDepositAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  securityDepositDeductions: {
    type: Number,
    min: 0,
    default: 0
  },
  securityDepositRefund: {
    type: Number,
    min: 0,
    default: 0
  },
  securityDepositRefunded: {
    type: Boolean,
    default: false
  },
  securityDepositRefundDate: Date,
  // Dispute
  disputed: {
    type: Boolean,
    default: false
  },
  disputeReason: String,
  disputeDetails: String,
  disputeResolvedAt: Date,
  disputeResolution: String,
  // Signatures
  vendorSignature: {
    signedBy: String,
    signedAt: Date,
    signature: String,
    designation: String
  },
  customerSignature: {
    signedBy: String,
    signedAt: Date,
    signature: String,
    designation: String
  },
  // Instructions
  returnInstructions: {
    type: String,
    trim: true
  },
  // Document
  documentUrl: String, // PDF of return document
  // Notes
  notes: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
  },
  // Timestamps
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  // Notifications
  notificationsSent: [{
    type: {
      type: String,
      enum: ['due_soon', 'overdue', 'received', 'inspected', 'completed']
    },
    sentAt: Date,
    recipient: String
  }]
}, {
  timestamps: true
});

// Indexes
returnSchema.index({ rentalOrder: 1 });
returnSchema.index({ customer: 1, status: 1 });
returnSchema.index({ vendor: 1, status: 1 });
returnSchema.index({ returnNumber: 1 });
returnSchema.index({ expectedReturnDate: 1, status: 1 });

// Pre-save hook to generate return number
returnSchema.pre('save', async function(next) {
  if (!this.returnNumber) {
    const count = await mongoose.model('Return').countDocuments();
    const year = new Date().getFullYear();
    this.returnNumber = `RTN-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Calculate if late
  if (this.actualReturnDate && this.expectedReturnDate) {
    const expected = new Date(this.expectedReturnDate);
    const actual = new Date(this.actualReturnDate);
    
    if (actual > expected) {
      this.isLate = true;
      const diffMs = actual - expected;
      this.daysLate = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
  }
  
  // Calculate total charges
  this.totalAdditionalCharges = 
    this.totalDamageCharges + 
    this.totalLateFees + 
    this.otherCharges.reduce((sum, charge) => sum + charge.amount, 0);
  
  // Calculate security deposit refund
  if (this.securityDepositAmount > 0) {
    this.securityDepositDeductions = this.totalAdditionalCharges;
    this.securityDepositRefund = Math.max(0, this.securityDepositAmount - this.securityDepositDeductions);
  }
  
  next();
});

// Method to mark return as received
returnSchema.methods.markAsReceived = async function() {
  this.status = 'received';
  this.receivedDate = new Date();
  if (!this.actualReturnDate) {
    this.actualReturnDate = new Date();
  }
  await this.save();
  return this;
};

// Method to complete inspection
returnSchema.methods.completeInspection = async function(inspectionData) {
  this.status = 'inspected';
  this.inspection = {
    performed: true,
    performedBy: inspectionData.performedBy,
    performedAt: new Date(),
    passed: inspectionData.passed,
    notes: inspectionData.notes,
    checklist: inspectionData.checklist || [],
    images: inspectionData.images || []
  };
  this.inspectedDate = new Date();
  
  await this.save();
  return this;
};

// Method to complete return process
returnSchema.methods.completeReturn = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  
  await this.save();
  
  // Update rental order
  const RentalOrder = mongoose.model('RentalOrder');
  const order = await RentalOrder.findById(this.rentalOrder);
  if (order) {
    order.returnStatus = 'returned';
    order.actualReturnDate = this.actualReturnDate;
    order.status = 'completed';
    order.completedAt = new Date();
    
    // Add late fees to order if any
    if (this.lateFeeAmount > 0) {
      order.lateFees = this.lateFeeAmount;
      order.totalAmount += this.lateFeeAmount;
    }
    
    await order.save();
  }
  
  // Complete reservations
  const Reservation = mongoose.model('Reservation');
  await Reservation.completeReservation('rental_order', this.rentalOrder);
  
  // Restore inventory
  const Product = mongoose.model('Product');
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product && item.quantityReturned > 0) {
      product.quantityOnHand += item.quantityReturned;
      await product.save();
    }
  }
  
  return this;
};

// Method to add damage charges
returnSchema.methods.addDamageCharges = async function(productId, amount, description, images = []) {
  const item = this.items.find(i => i.product.toString() === productId.toString());
  if (item) {
    item.isDamaged = true;
    item.damageCharges = amount;
    item.damageDescription = description;
    item.damageImages = images;
    
    this.totalDamageCharges += amount;
    await this.save();
  }
  return this;
};

// Method to calculate and apply late fees
returnSchema.methods.calculateLateFees = async function() {
  if (!this.isLate || this.daysLate === 0) {
    return 0;
  }
  
  // Get rental pricing to calculate late fees
  const RentalOrder = mongoose.model('RentalOrder');
  const order = await RentalOrder.findById(this.rentalOrder);
  
  // This is a simplified calculation - should use RentalPricing model
  const feePerDay = 100; // Default fee per day
  this.lateFeeAmount = this.daysLate * feePerDay;
  this.lateFeeDetails = {
    feePerDay,
    gracePeriodHours: 0,
    calculatedAt: new Date()
  };
  
  await this.save();
  return this.lateFeeAmount;
};

// Method to process security deposit refund
returnSchema.methods.processSecurityDepositRefund = async function() {
  if (this.securityDepositRefunded) {
    throw new Error('Security deposit already refunded');
  }
  
  this.securityDepositRefunded = true;
  this.securityDepositRefundDate = new Date();
  
  await this.save();
  
  // Create refund payment record if needed
  // This would integrate with Payment model
  
  return this;
};

// Static method to send return reminders
returnSchema.statics.sendReturnReminders = async function() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  const upcomingReturns = await this.find({
    expectedReturnDate: { $lte: threeDaysFromNow, $gt: new Date() },
    status: 'pending'
  }).populate('customer rentalOrder');
  
  // Send reminders (integrate with email/SMS service)
  for (const returnDoc of upcomingReturns) {
    returnDoc.notificationsSent.push({
      type: 'due_soon',
      sentAt: new Date(),
      recipient: returnDoc.customer.email
    });
    await returnDoc.save();
  }
  
  return upcomingReturns.length;
};

const Return = mongoose.model('Return', returnSchema);

module.exports = Return;
const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  quotationNumber: {
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
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'],
    default: 'draft'
  },
  // Quotation validity
  validUntil: {
    type: Date,
    required: true
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
  // Pricing summary
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
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
  taxAmount: {
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
  // Tax breakdown (GST)
  taxes: [{
    name: String, // CGST, SGST, IGST
    rate: Number,
    amount: Number
  }],
  // Notes and terms
  notes: {
    type: String,
    trim: true
  },
  termsAndConditions: {
    type: String,
    trim: true
  },
  // Tracking
  sentAt: Date,
  viewedAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  convertedToOrderAt: Date,
  convertedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalOrder'
  },
  // Metadata
  isEditable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
quotationSchema.index({ customer: 1, status: 1 });
quotationSchema.index({ vendor: 1, status: 1 });
quotationSchema.index({ quotationNumber: 1 });
quotationSchema.index({ validUntil: 1 });

// Pre-save hook to generate quotation number
quotationSchema.pre('save', async function(next) {
  if (!this.quotationNumber) {
    const count = await mongoose.model('Quotation').countDocuments();
    const year = new Date().getFullYear();
    this.quotationNumber = `QT-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Set validity if not set (default 30 days)
  if (!this.validUntil) {
    this.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Method to check if quotation is expired
quotationSchema.methods.isExpired = function() {
  return new Date() > this.validUntil;
};

// Method to calculate total
quotationSchema.methods.calculateTotal = function() {
  let total = this.subtotal;
  
  if (this.discountType === 'percentage') {
    total = total - (total * this.discount / 100);
  } else {
    total = total - this.discount;
  }
  
  total = total + this.taxAmount;
  
  return Math.max(0, total);
};

// Static method to auto-expire old quotations
quotationSchema.statics.expireOldQuotations = async function() {
  const result = await this.updateMany(
    {
      validUntil: { $lt: new Date() },
      status: { $in: ['draft', 'sent', 'viewed'] }
    },
    {
      $set: { status: 'expired' }
    }
  );
  return result;
};

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;
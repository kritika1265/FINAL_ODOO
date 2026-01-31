const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  rentalOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalOrder',
    required: [true, 'Rental order is required']
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
  invoiceType: {
    type: String,
    enum: ['rental', 'security_deposit', 'late_fee', 'damage', 'refund'],
    default: 'rental'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'refunded'],
    default: 'draft'
  },
  // Invoice dates
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: Date,
  // Customer details snapshot (for legal compliance)
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
    }
  },
  // Vendor details snapshot
  vendorDetails: {
    name: String,
    email: String,
    phone: String,
    companyName: String,
    gstin: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  // Line items
  items: [{
    description: String,
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    unitPrice: Number,
    discount: Number,
    discountType: {
      type: String,
      enum: ['fixed', 'percentage']
    },
    taxRate: Number,
    taxAmount: Number,
    lineTotal: Number,
    rentalPeriod: {
      startDate: Date,
      endDate: Date
    }
  }],
  // Financial summary
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
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // Tax breakdown (GST compliant)
  taxes: [{
    name: String, // CGST, SGST, IGST
    rate: Number,
    taxableAmount: Number,
    amount: Number
  }],
  // Payment tracking
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
  // Payment type
  paymentType: {
    type: String,
    enum: ['full', 'partial', 'security_deposit'],
    default: 'full'
  },
  // Security deposit information
  securityDepositAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  securityDepositRefunded: {
    type: Boolean,
    default: false
  },
  securityDepositRefundDate: Date,
  securityDepositDeductions: [{
    reason: String,
    amount: Number,
    date: Date
  }],
  // Late fees
  lateFees: {
    type: Number,
    min: 0,
    default: 0
  },
  lateFeeDetails: {
    daysLate: Number,
    feePerDay: Number,
    calculatedAt: Date
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
  // Payment reference
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  // File attachments (if generated as PDF)
  pdfUrl: String,
  // Email tracking
  sentToCustomer: {
    type: Boolean,
    default: false
  },
  sentAt: Date,
  // Currency
  currency: {
    type: String,
    default: 'INR'
  }
}, {
  timestamps: true
});

// Indexes
invoiceSchema.index({ customer: 1, status: 1 });
invoiceSchema.index({ vendor: 1, status: 1 });
invoiceSchema.index({ rentalOrder: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });

// Pre-save hook to generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Set due date if not provided (default 7 days)
  if (!this.dueDate && this.invoiceDate) {
    this.dueDate = new Date(this.invoiceDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  // Calculate amount due
  this.amountDue = this.totalAmount - this.amountPaid;
  
  // Update status based on payment
  if (this.amountPaid === 0 && this.status !== 'draft' && this.status !== 'cancelled') {
    if (new Date() > this.dueDate) {
      this.status = 'overdue';
    } else {
      this.status = 'sent';
    }
  } else if (this.amountPaid > 0 && this.amountPaid < this.totalAmount) {
    this.status = 'partial';
  } else if (this.amountPaid >= this.totalAmount) {
    this.status = 'paid';
    if (!this.paidDate) {
      this.paidDate = new Date();
    }
  }
  
  next();
});

// Method to mark as paid
invoiceSchema.methods.markAsPaid = async function(paymentId) {
  this.status = 'paid';
  this.amountPaid = this.totalAmount;
  this.amountDue = 0;
  this.paidDate = new Date();
  
  if (paymentId) {
    this.payments.push(paymentId);
  }
  
  await this.save();
  return this;
};

// Method to record partial payment
invoiceSchema.methods.recordPayment = async function(amount, paymentId) {
  this.amountPaid += amount;
  this.amountDue = this.totalAmount - this.amountPaid;
  
  if (this.amountPaid >= this.totalAmount) {
    this.status = 'paid';
    this.paidDate = new Date();
  } else {
    this.status = 'partial';
  }
  
  if (paymentId) {
    this.payments.push(paymentId);
  }
  
  await this.save();
  return this;
};

// Method to add late fees
invoiceSchema.methods.addLateFees = async function(lateFeeAmount, daysLate, feePerDay) {
  this.lateFees = lateFeeAmount;
  this.lateFeeDetails = {
    daysLate,
    feePerDay,
    calculatedAt: new Date()
  };
  this.totalAmount += lateFeeAmount;
  this.amountDue = this.totalAmount - this.amountPaid;
  
  await this.save();
  return this;
};

// Static method to update overdue invoices
invoiceSchema.statics.updateOverdueInvoices = async function() {
  const result = await this.updateMany(
    {
      dueDate: { $lt: new Date() },
      status: { $in: ['sent', 'partial'] }
    },
    {
      $set: { status: 'overdue' }
    }
  );
  return result;
};

// Method to generate invoice summary
invoiceSchema.methods.getSummary = function() {
  return {
    invoiceNumber: this.invoiceNumber,
    invoiceDate: this.invoiceDate,
    dueDate: this.dueDate,
    status: this.status,
    subtotal: this.subtotal,
    totalDiscount: this.totalDiscount,
    totalTax: this.totalTax,
    totalAmount: this.totalAmount,
    amountPaid: this.amountPaid,
    amountDue: this.amountDue,
    lateFees: this.lateFees,
    currency: this.currency
  };
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    unique: true,
    required: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: [true, 'Invoice is required']
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
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'cash', 'cheque', 'bank_transfer'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'paytm', 'phonepe', 'manual'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  // Payment gateway details
  transactionId: {
    type: String,
    sparse: true,
    index: true
  },
  gatewayOrderId: String,
  gatewayPaymentId: String,
  gatewaySignature: String,
  // Payment type
  paymentType: {
    type: String,
    enum: ['rental_payment', 'security_deposit', 'late_fee', 'damage_fee', 'additional_charge'],
    default: 'rental_payment'
  },
  // Refund information
  refundAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  refundReason: String,
  refundedAt: Date,
  refundTransactionId: String,
  // Payment details
  paymentDate: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  failedAt: Date,
  failureReason: String,
  // Card/UPI details (last 4 digits only for security)
  cardLast4: String,
  cardBrand: String,
  upiId: String,
  // Bank details (for cheque/transfer)
  bankDetails: {
    chequeNumber: String,
    chequeDate: Date,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    transactionReference: String
  },
  // Receipt
  receiptNumber: String,
  receiptUrl: String,
  // Notes
  notes: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
  },
  // Email notification
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptSentAt: Date,
  // Metadata from payment gateway
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ customer: 1, status: 1 });
paymentSchema.index({ vendor: 1, status: 1 });
paymentSchema.index({ invoice: 1 });
paymentSchema.index({ rentalOrder: 1 });
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1, paymentDate: 1 });

// Pre-save hook to generate payment number
paymentSchema.pre('save', async function(next) {
  if (!this.paymentNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.paymentNumber = `PAY-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Generate receipt number if payment is completed
  if (this.status === 'completed' && !this.receiptNumber) {
    const receiptCount = await mongoose.model('Payment').countDocuments({ status: 'completed' });
    const year = new Date().getFullYear();
    this.receiptNumber = `REC-${year}-${String(receiptCount + 1).padStart(5, '0')}`;
  }
  
  next();
});

// Method to mark payment as completed
paymentSchema.methods.markAsCompleted = async function(transactionDetails = {}) {
  this.status = 'completed';
  this.confirmedAt = new Date();
  
  if (transactionDetails.transactionId) {
    this.transactionId = transactionDetails.transactionId;
  }
  if (transactionDetails.gatewayPaymentId) {
    this.gatewayPaymentId = transactionDetails.gatewayPaymentId;
  }
  if (transactionDetails.gatewaySignature) {
    this.gatewaySignature = transactionDetails.gatewaySignature;
  }
  
  await this.save();
  
  // Update invoice
  const Invoice = mongoose.model('Invoice');
  const invoice = await Invoice.findById(this.invoice);
  if (invoice) {
    await invoice.recordPayment(this.amount, this._id);
  }
  
  // Update rental order
  const RentalOrder = mongoose.model('RentalOrder');
  const order = await RentalOrder.findById(this.rentalOrder);
  if (order) {
    order.amountPaid += this.amount;
    await order.save();
  }
  
  return this;
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = async function(reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  await this.save();
  return this;
};

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason) {
  if (this.status !== 'completed') {
    throw new Error('Can only refund completed payments');
  }
  
  if (amount > (this.amount - this.refundAmount)) {
    throw new Error('Refund amount exceeds available amount');
  }
  
  this.refundAmount += amount;
  this.refundReason = reason;
  this.refundedAt = new Date();
  
  if (this.refundAmount >= this.amount) {
    this.status = 'refunded';
  }
  
  await this.save();
  
  // Update invoice
  const Invoice = mongoose.model('Invoice');
  const invoice = await Invoice.findById(this.invoice);
  if (invoice) {
    invoice.amountPaid -= amount;
    await invoice.save();
  }
  
  return this;
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function(vendorId, startDate, endDate) {
  const match = { vendor: vendorId, status: 'completed' };
  
  if (startDate && endDate) {
    match.paymentDate = { $gte: startDate, $lte: endDate };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalRefunded: { $sum: '$refundAmount' },
        totalPayments: { $sum: 1 },
        averagePayment: { $avg: '$amount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalAmount: 0,
    totalRefunded: 0,
    totalPayments: 0,
    averagePayment: 0
  };
};

// Method to generate payment summary
paymentSchema.methods.getSummary = function() {
  return {
    paymentNumber: this.paymentNumber,
    receiptNumber: this.receiptNumber,
    amount: this.amount,
    currency: this.currency,
    paymentMethod: this.paymentMethod,
    status: this.status,
    paymentDate: this.paymentDate,
    transactionId: this.transactionId
  };
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
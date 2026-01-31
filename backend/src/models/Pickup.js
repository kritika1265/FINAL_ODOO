const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  pickupNumber: {
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
  status: {
    type: String,
    enum: ['pending', 'ready', 'in_transit', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Pickup details
  scheduledPickupDate: {
    type: Date,
    required: true
  },
  actualPickupDate: Date,
  // Pickup location
  pickupLocation: {
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
    contactPhone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // Items to be picked up
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    productSku: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    pickedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    serialNumbers: [String],
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor', 'damaged'],
      default: 'good'
    },
    conditionNotes: String,
    images: [String] // URLs to condition photos
  }],
  // Pickup method
  pickupMethod: {
    type: String,
    enum: ['self_pickup', 'delivery', 'courier'],
    default: 'self_pickup'
  },
  // Delivery details (if applicable)
  deliveryDetails: {
    courierService: String,
    trackingNumber: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    deliveryPerson: String,
    deliveryPersonPhone: String
  },
  // Instructions
  pickupInstructions: {
    type: String,
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  // Checklist
  checklist: [{
    item: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  // Quality check
  qualityCheck: {
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
    images: [String]
  },
  // Signatures
  vendorSignature: {
    signedBy: String,
    signedAt: Date,
    signature: String, // Base64 or URL
    designation: String
  },
  customerSignature: {
    signedBy: String,
    signedAt: Date,
    signature: String,
    designation: String
  },
  // Document
  documentUrl: String, // PDF of pickup document
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
  preparedAt: Date,
  readyAt: Date,
  pickedUpAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  // Notifications
  notificationsSent: [{
    type: {
      type: String,
      enum: ['prepared', 'ready', 'reminder', 'completed']
    },
    sentAt: Date,
    recipient: String
  }]
}, {
  timestamps: true
});

// Indexes
pickupSchema.index({ rentalOrder: 1 });
pickupSchema.index({ customer: 1, status: 1 });
pickupSchema.index({ vendor: 1, status: 1 });
pickupSchema.index({ pickupNumber: 1 });
pickupSchema.index({ scheduledPickupDate: 1, status: 1 });

// Pre-save hook to generate pickup number
pickupSchema.pre('save', async function(next) {
  if (!this.pickupNumber) {
    const count = await mongoose.model('Pickup').countDocuments();
    const year = new Date().getFullYear();
    this.pickupNumber = `PKP-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Method to mark as ready for pickup
pickupSchema.methods.markAsReady = async function() {
  this.status = 'ready';
  this.readyAt = new Date();
  await this.save();
  return this;
};

// Method to complete pickup
pickupSchema.methods.completePickup = async function(pickupData = {}) {
  this.status = 'completed';
  this.actualPickupDate = new Date();
  this.pickedUpAt = new Date();
  
  if (pickupData.customerSignature) {
    this.customerSignature = {
      signedBy: pickupData.customerSignature.signedBy,
      signedAt: new Date(),
      signature: pickupData.customerSignature.signature,
      designation: pickupData.customerSignature.designation
    };
  }
  
  await this.save();
  
  // Update rental order pickup status
  const RentalOrder = mongoose.model('RentalOrder');
  const order = await RentalOrder.findById(this.rentalOrder);
  if (order) {
    order.pickupStatus = 'picked_up';
    order.actualPickupDate = new Date();
    order.status = 'in_progress';
    await order.save();
  }
  
  return this;
};

// Method to cancel pickup
pickupSchema.methods.cancelPickup = async function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  await this.save();
  return this;
};

// Method to update item condition
pickupSchema.methods.updateItemCondition = async function(productId, condition, notes, images = []) {
  const item = this.items.find(i => i.product.toString() === productId.toString());
  if (item) {
    item.condition = condition;
    item.conditionNotes = notes;
    if (images.length > 0) {
      item.images = images;
    }
    await this.save();
  }
  return this;
};

// Static method to get pending pickups for vendor
pickupSchema.statics.getPendingPickups = async function(vendorId) {
  return await this.find({
    vendor: vendorId,
    status: { $in: ['pending', 'ready'] }
  })
  .populate('rentalOrder')
  .populate('customer', 'name email phone')
  .sort({ scheduledPickupDate: 1 });
};

// Method to send pickup reminder
pickupSchema.methods.sendReminder = async function() {
  // This would integrate with email/SMS service
  this.notificationsSent.push({
    type: 'reminder',
    sentAt: new Date(),
    recipient: this.customerEmail
  });
  await this.save();
  return this;
};

const Pickup = mongoose.model('Pickup', pickupSchema);

module.exports = Pickup;
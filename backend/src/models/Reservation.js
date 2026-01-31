const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1
  },
  // Reservation period
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    index: true
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    index: true
  },
  // Reference to the source document
  sourceType: {
    type: String,
    enum: ['quotation', 'rental_order'],
    required: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'sourceModel'
  },
  sourceModel: {
    type: String,
    enum: ['Quotation', 'RentalOrder'],
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active',
    index: true
  },
  // Priority level (rental_order reservations have higher priority than quotation reservations)
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  // Auto-expiry for quotation-based reservations
  expiresAt: {
    type: Date,
    index: true
  },
  // Notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient availability checks
reservationSchema.index({ product: 1, startDate: 1, endDate: 1 });
reservationSchema.index({ product: 1, status: 1 });
reservationSchema.index({ sourceId: 1, sourceType: 1 });
reservationSchema.index({ expiresAt: 1, status: 1 });

// Validation: End date must be after start date
reservationSchema.pre('validate', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('Reservation end date must be after start date'));
  } else {
    next();
  }
});

// Set source model based on source type
reservationSchema.pre('save', function(next) {
  if (this.sourceType === 'quotation') {
    this.sourceModel = 'Quotation';
    this.priority = 1;
  } else if (this.sourceType === 'rental_order') {
    this.sourceModel = 'RentalOrder';
    this.priority = 10; // Higher priority
  }
  next();
});

// Static method to check product availability
reservationSchema.statics.checkAvailability = async function(productId, startDate, endDate, excludeReservationId = null) {
  const Product = mongoose.model('Product');
  
  // Get product
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Find overlapping active reservations
  const query = {
    product: productId,
    status: 'active',
    $or: [
      // Case 1: Existing reservation starts during the requested period
      { 
        startDate: { $gte: startDate, $lt: endDate }
      },
      // Case 2: Existing reservation ends during the requested period
      { 
        endDate: { $gt: startDate, $lte: endDate }
      },
      // Case 3: Existing reservation completely encompasses the requested period
      { 
        startDate: { $lte: startDate },
        endDate: { $gte: endDate }
      }
    ]
  };
  
  // Exclude specific reservation if updating
  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }
  
  const overlappingReservations = await this.find(query);
  
  // Calculate total reserved quantity
  const totalReserved = overlappingReservations.reduce((sum, res) => sum + res.quantity, 0);
  
  // Calculate available quantity
  const availableQuantity = product.quantityOnHand - totalReserved;
  
  return {
    available: availableQuantity > 0,
    availableQuantity: Math.max(0, availableQuantity),
    totalOnHand: product.quantityOnHand,
    totalReserved: totalReserved,
    overlappingReservations: overlappingReservations.length
  };
};

// Static method to reserve product
reservationSchema.statics.reserveProduct = async function(reservationData) {
  const { product, quantity, startDate, endDate, sourceType, sourceId, customer, vendor, expiresAt } = reservationData;
  
  // Check availability first
  const availability = await this.checkAvailability(product, startDate, endDate);
  
  if (!availability.available || availability.availableQuantity < quantity) {
    throw new Error(`Insufficient quantity available. Only ${availability.availableQuantity} units available.`);
  }
  
  // Create reservation
  const reservation = await this.create({
    product,
    quantity,
    startDate,
    endDate,
    sourceType,
    sourceId,
    customer,
    vendor,
    expiresAt,
    status: 'active'
  });
  
  return reservation;
};

// Static method to release reservation
reservationSchema.statics.releaseReservation = async function(reservationId) {
  const reservation = await this.findById(reservationId);
  if (!reservation) {
    throw new Error('Reservation not found');
  }
  
  reservation.status = 'cancelled';
  await reservation.save();
  
  return reservation;
};

// Static method to complete reservation (when product is returned)
reservationSchema.statics.completeReservation = async function(sourceType, sourceId) {
  const result = await this.updateMany(
    { sourceType, sourceId, status: 'active' },
    { $set: { status: 'completed' } }
  );
  
  return result;
};

// Static method to auto-expire old quotation reservations
reservationSchema.statics.expireOldReservations = async function() {
  const result = await this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      status: 'active',
      sourceType: 'quotation'
    },
    {
      $set: { status: 'expired' }
    }
  );
  return result;
};

// Method to check if reservation overlaps with a date range
reservationSchema.methods.overlapsWith = function(startDate, endDate) {
  return (
    (this.startDate >= startDate && this.startDate < endDate) ||
    (this.endDate > startDate && this.endDate <= endDate) ||
    (this.startDate <= startDate && this.endDate >= endDate)
  );
};

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
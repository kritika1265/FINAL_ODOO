const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  isRentable: {
    type: Boolean,
    default: true
  },
  quantityOnHand: {
    type: Number,
    required: [true, 'Quantity on hand is required'],
    min: 0,
    default: 0
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: 0
  },
  salesPrice: {
    type: Number,
    required: [true, 'Sales price is required'],
    min: 0
  },
  // Product attributes (Brand, Color, Size, etc.)
  attributes: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  // Product variants (if any)
  hasVariants: {
    type: Boolean,
    default: false
  },
  parentProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  variants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // Images
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    trim: true
  },
  tags: [String],
  // Publishing status
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  // Vendor who owns this product
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor is required']
  },
  // SEO fields
  seoTitle: String,
  seoDescription: String,
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
productSchema.index({ vendor: 1, isPublished: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ 'attributes.name': 1, 'attributes.value': 1 });

// Pre-save hook to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Virtual for available quantity (considering reservations)
productSchema.virtual('availableQuantity').get(function() {
  // This will be calculated dynamically with reservations
  return this.quantityOnHand;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
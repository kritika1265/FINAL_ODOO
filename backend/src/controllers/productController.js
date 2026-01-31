const Product = require('../models/Product');
const ProductAttribute = require('../models/ProductAttribute');
const { validationResult } = require('express-validator');

/**
 * Product Controller
 * Handles rental product CRUD operations, variants, and pricing
 */

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      minPrice,
      maxPrice,
      isRentable,
      isPublished,
      vendor,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;
    if (isRentable !== undefined) filter.isRentable = isRentable === 'true';
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (vendor) filter.vendor = vendor;

    // Price filter (for base sales price)
    if (minPrice || maxPrice) {
      filter.salesPrice = {};
      if (minPrice) filter.salesPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.salesPrice.$lte = parseFloat(maxPrice);
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('vendor', 'name email companyName')
      .populate('attributes.attribute', 'name type')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name email companyName gstin')
      .populate('attributes.attribute', 'name type values')
      .populate('variants.attributeValues');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Vendor/Admin)
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      sku,
      category,
      isRentable,
      quantityOnHand,
      costPrice,
      salesPrice,
      rentalPricing,
      images,
      attributes,
      variants,
      isPublished
    } = req.body;

    // Set vendor based on role
    const vendor = req.user.role === 'admin' ? req.body.vendor : req.user.id;

    // Check if SKU already exists
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    // Validate rental pricing if product is rentable
    if (isRentable && (!rentalPricing || Object.keys(rentalPricing).length === 0)) {
      return res.status(400).json({ message: 'Rental pricing is required for rentable products' });
    }

    const product = new Product({
      name,
      description,
      sku,
      category,
      vendor,
      isRentable,
      quantityOnHand,
      costPrice,
      salesPrice,
      rentalPricing: isRentable ? rentalPricing : undefined,
      images: images || [],
      attributes: attributes || [],
      variants: variants || [],
      isPublished: isPublished !== undefined ? isPublished : true
    });

    await product.save();

    const populatedProduct = await Product.findById(product.id)
      .populate('vendor', 'name email companyName')
      .populate('attributes.attribute', 'name type');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor/Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Authorization check
    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const {
      name,
      description,
      category,
      isRentable,
      quantityOnHand,
      costPrice,
      salesPrice,
      rentalPricing,
      images,
      attributes,
      variants,
      isPublished
    } = req.body;

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (isRentable !== undefined) product.isRentable = isRentable;
    if (quantityOnHand !== undefined) product.quantityOnHand = quantityOnHand;
    if (costPrice !== undefined) product.costPrice = costPrice;
    if (salesPrice !== undefined) product.salesPrice = salesPrice;
    if (rentalPricing) product.rentalPricing = rentalPricing;
    if (images) product.images = images;
    if (attributes) product.attributes = attributes;
    if (variants) product.variants = variants;
    if (isPublished !== undefined) product.isPublished = isPublished;

    product.updatedAt = Date.now();

    await product.save();

    const updatedProduct = await Product.findById(product.id)
      .populate('vendor', 'name email companyName')
      .populate('attributes.attribute', 'name type');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor/Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Authorization check
    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Check if product is in any active orders
    const Order = require('../models/Order');
    const activeOrders = await Order.countDocuments({
      'items.product': product.id,
      status: { $in: ['draft', 'confirmed', 'pickup_ready', 'with_customer'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product with active rental orders. Please complete or cancel orders first.' 
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};

// @desc    Publish/Unpublish product
// @route   PATCH /api/products/:id/publish
// @access  Private (Vendor/Admin)
exports.togglePublish = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Authorization check
    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this product' });
    }

    product.isPublished = !product.isPublished;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isPublished ? 'published' : 'unpublished'} successfully`,
      data: { isPublished: product.isPublished }
    });

  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check product availability for rental period
// @route   POST /api/products/:id/check-availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const { startDate, endDate, quantity = 1, variantId } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isRentable) {
      return res.status(400).json({ message: 'This product is not available for rental' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Get reserved quantity for this period
    const Order = require('../models/Order');
    const overlappingOrders = await Order.find({
      'items.product': product.id,
      'items.variantId': variantId || null,
      status: { $in: ['confirmed', 'pickup_ready', 'with_customer'] },
      $or: [
        {
          'items.rentalStartDate': { $lte: end },
          'items.rentalEndDate': { $gte: start }
        }
      ]
    });

    let reservedQuantity = 0;
    overlappingOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product.toString() === product.id.toString()) {
          if (!variantId || item.variantId === variantId) {
            reservedQuantity += item.quantity;
          }
        }
      });
    });

    const availableQuantity = product.quantityOnHand - reservedQuantity;
    const isAvailable = availableQuantity >= quantity;

    res.json({
      success: true,
      available: isAvailable,
      requestedQuantity: quantity,
      availableQuantity,
      reservedQuantity,
      totalStock: product.quantityOnHand
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Server error while checking availability' });
  }
};

// @desc    Get product rental pricing calculation
// @route   POST /api/products/:id/calculate-price
// @access  Public
exports.calculateRentalPrice = async (req, res) => {
  try {
    const { startDate, endDate, quantity = 1, variantId } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isRentable) {
      return res.status(400).json({ message: 'This product is not available for rental' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Calculate rental duration in hours
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);
    const durationDays = Math.ceil(durationHours / 24);
    const durationWeeks = Math.ceil(durationDays / 7);

    let pricing = product.rentalPricing;

    // If variant is specified, use variant pricing if available
    if (variantId) {
      const variant = product.variants.find(v => v._id.toString() === variantId);
      if (variant && variant.rentalPricing) {
        pricing = variant.rentalPricing;
      }
    }

    let unitPrice = 0;
    let period = '';

    // Determine best pricing option
    if (durationWeeks >= 1 && pricing.weekly) {
      unitPrice = pricing.weekly * durationWeeks;
      period = 'weekly';
    } else if (durationDays >= 1 && pricing.daily) {
      unitPrice = pricing.daily * durationDays;
      period = 'daily';
    } else if (pricing.hourly) {
      unitPrice = pricing.hourly * Math.ceil(durationHours);
      period = 'hourly';
    } else {
      return res.status(400).json({ message: 'No applicable rental pricing found' });
    }

    const subtotal = unitPrice * quantity;

    res.json({
      success: true,
      calculation: {
        duration: {
          hours: Math.ceil(durationHours),
          days: durationDays,
          weeks: durationWeeks
        },
        pricingPeriod: period,
        unitPrice,
        quantity,
        subtotal,
        currency: 'INR'
      }
    });

  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ message: 'Server error while calculating price' });
  }
};

module.exports = exports;
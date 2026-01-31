const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

/**
 * Quotation Controller
 * Handles quotation creation, updates, and conversion to orders
 */

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
exports.getAllQuotations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      customer,
      startDate,
      endDate
    } = req.query;

    const filter = {};

    // Role-based filtering
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    if (status) filter.status = status;
    if (customer && req.user.role !== 'customer') filter.customer = customer;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const quotations = await Quotation.find(filter)
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name email companyName')
      .populate('items.product', 'name sku images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Quotation.countDocuments(filter);

    res.json({
      success: true,
      data: quotations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ message: 'Server error while fetching quotations' });
  }
};

// @desc    Get quotation by ID
// @route   GET /api/quotations/:id
// @access  Private
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customer', 'name email companyName gstin phone address')
      .populate('vendor', 'name email companyName gstin')
      .populate('items.product', 'name sku description images rentalPricing')
      .populate('items.variantId');

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Authorization check
    if (req.user.role === 'customer' && quotation.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this quotation' });
    }

    if (req.user.role === 'vendor' && quotation.vendor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this quotation' });
    }

    res.json({
      success: true,
      data: quotation
    });

  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({ message: 'Server error while fetching quotation' });
  }
};

// @desc    Create quotation (shopping cart)
// @route   POST /api/quotations
// @access  Private (Customer)
exports.createQuotation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Quotation must have at least one item' });
    }

    // Validate all items and calculate pricing
    const validatedItems = [];
    let subtotal = 0;
    let vendor = null;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (!product.isRentable) {
        return res.status(400).json({ message: `Product ${product.name} is not available for rental` });
      }

      if (!product.isPublished) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }

      // Set vendor from first product (all products should be from same vendor)
      if (!vendor) {
        vendor = product.vendor;
      } else if (vendor.toString() !== product.vendor.toString()) {
        return res.status(400).json({ 
          message: 'All products in a quotation must be from the same vendor' 
        });
      }

      const startDate = new Date(item.rentalStartDate);
      const endDate = new Date(item.rentalEndDate);

      if (startDate >= endDate) {
        return res.status(400).json({ 
          message: `Invalid rental dates for product ${product.name}` 
        });
      }

      // Calculate duration and price
      const durationMs = endDate - startDate;
      const durationHours = durationMs / (1000 * 60 * 60);
      const durationDays = Math.ceil(durationHours / 24);
      const durationWeeks = Math.ceil(durationDays / 7);

      let pricing = product.rentalPricing;
      if (item.variantId) {
        const variant = product.variants.find(v => v._id.toString() === item.variantId);
        if (variant && variant.rentalPricing) {
          pricing = variant.rentalPricing;
        }
      }

      let unitPrice = 0;
      if (durationWeeks >= 1 && pricing.weekly) {
        unitPrice = pricing.weekly * durationWeeks;
      } else if (durationDays >= 1 && pricing.daily) {
        unitPrice = pricing.daily * durationDays;
      } else if (pricing.hourly) {
        unitPrice = pricing.hourly * Math.ceil(durationHours);
      }

      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      validatedItems.push({
        product: product._id,
        variantId: item.variantId || null,
        quantity: item.quantity,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        unitPrice,
        lineTotal,
        notes: item.notes || ''
      });
    }

    // Calculate tax (assuming 18% GST)
    const taxRate = 0.18;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const quotation = new Quotation({
      quotationNumber: await generateQuotationNumber(),
      customer: req.user.id,
      vendor,
      items: validatedItems,
      subtotal,
      tax,
      total,
      notes: notes || '',
      status: 'draft'
    });

    await quotation.save();

    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name email companyName')
      .populate('items.product', 'name sku images');

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: populatedQuotation
    });

  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({ message: 'Server error while creating quotation' });
  }
};

// @desc    Update quotation
// @route   PUT /api/quotations/:id
// @access  Private
exports.updateQuotation = async (req, res) => {
  try {
    let quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Only draft quotations can be edited
    if (quotation.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft quotations can be edited' });
    }

    // Authorization check
    if (req.user.role === 'customer' && quotation.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this quotation' });
    }

    const { items, notes } = req.body;

    if (items && items.length > 0) {
      // Re-validate and recalculate
      const validatedItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = await Product.findById(item.product);
        
        if (!product || !product.isRentable) {
          return res.status(400).json({ message: 'Invalid product in quotation' });
        }

        const startDate = new Date(item.rentalStartDate);
        const endDate = new Date(item.rentalEndDate);

        const durationMs = endDate - startDate;
        const durationHours = durationMs / (1000 * 60 * 60);
        const durationDays = Math.ceil(durationHours / 24);
        const durationWeeks = Math.ceil(durationDays / 7);

        let pricing = product.rentalPricing;
        if (item.variantId) {
          const variant = product.variants.find(v => v._id.toString() === item.variantId);
          if (variant && variant.rentalPricing) {
            pricing = variant.rentalPricing;
          }
        }

        let unitPrice = 0;
        if (durationWeeks >= 1 && pricing.weekly) {
          unitPrice = pricing.weekly * durationWeeks;
        } else if (durationDays >= 1 && pricing.daily) {
          unitPrice = pricing.daily * durationDays;
        } else if (pricing.hourly) {
          unitPrice = pricing.hourly * Math.ceil(durationHours);
        }

        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        validatedItems.push({
          product: product._id,
          variantId: item.variantId || null,
          quantity: item.quantity,
          rentalStartDate: startDate,
          rentalEndDate: endDate,
          unitPrice,
          lineTotal,
          notes: item.notes || ''
        });
      }

      const taxRate = 0.18;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      quotation.items = validatedItems;
      quotation.subtotal = subtotal;
      quotation.tax = tax;
      quotation.total = total;
    }

    if (notes !== undefined) quotation.notes = notes;
    quotation.updatedAt = Date.now();

    await quotation.save();

    const updatedQuotation = await Quotation.findById(quotation._id)
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name email companyName')
      .populate('items.product', 'name sku images');

    res.json({
      success: true,
      message: 'Quotation updated successfully',
      data: updatedQuotation
    });

  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({ message: 'Server error while updating quotation' });
  }
};

// @desc    Delete quotation
// @route   DELETE /api/quotations/:id
// @access  Private
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Authorization check
    if (req.user.role === 'customer' && quotation.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this quotation' });
    }

    // Only draft quotations can be deleted
    if (quotation.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft quotations can be deleted' });
    }

    await quotation.deleteOne();

    res.json({
      success: true,
      message: 'Quotation deleted successfully'
    });

  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({ message: 'Server error while deleting quotation' });
  }
};

// @desc    Send quotation to vendor
// @route   POST /api/quotations/:id/send
// @access  Private (Customer)
exports.sendQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (quotation.status !== 'draft') {
      return res.status(400).json({ message: 'Quotation has already been sent' });
    }

    quotation.status = 'sent';
    quotation.sentDate = new Date();
    await quotation.save();

    // TODO: Send email notification to vendor

    res.json({
      success: true,
      message: 'Quotation sent to vendor successfully',
      data: quotation
    });

  } catch (error) {
    console.error('Send quotation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to generate quotation number
async function generateQuotationNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await Quotation.countDocuments({
    createdAt: {
      $gte: new Date(year, date.getMonth(), 1),
      $lt: new Date(year, date.getMonth() + 1, 1)
    }
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `QUO-${year}${month}-${sequence}`;
}

module.exports = exports;
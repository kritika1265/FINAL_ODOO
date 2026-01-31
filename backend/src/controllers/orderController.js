const Order = require('../models/Order');
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const { validationResult } = require('express-validator');

/**
 * Order Controller
 * Handles rental order lifecycle: creation, pickup, return, and status management
 */

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      customer,
      vendor,
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
    if (customer && req.user.role === 'admin') filter.customer = customer;
    if (vendor && req.user.role === 'admin') filter.vendor = vendor;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name email companyName')
      .populate('items.product', 'name sku images')
      .populate('quotation', 'quotationNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email companyName gstin phone address')
      .populate('vendor', 'name email companyName gstin')
      .populate('items.product', 'name sku description images')
      .populate('quotation', 'quotationNumber')
      .populate('invoice', 'invoiceNumber');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization check
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    if (req.user.role === 'vendor' && order.vendor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
};

// @desc    Create order from quotation
// @route   POST /api/orders/from-quotation/:quotationId
// @access  Private (Customer)
exports.createOrderFromQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.quotationId)
      .populate('items.product');

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (quotation.status === 'converted') {
      return res.status(400).json({ message: 'Quotation has already been converted to an order' });
    }

    // Check availability for all items
    for (const item of quotation.items) {
      const availability = await checkProductAvailability(
        item.product._id,
        item.rentalStartDate,
        item.rentalEndDate,
        item.quantity,
        item.variantId
      );

      if (!availability.available) {
        return res.status(400).json({
          message: `Product ${item.product.name} is not available for the requested period`,
          availableQuantity: availability.availableQuantity
        });
      }
    }

    const { deliveryAddress, pickupAddress, notes } = req.body;

    // Create order
    const order = new Order({
      orderNumber: await generateOrderNumber(),
      customer: quotation.customer,
      vendor: quotation.vendor,
      quotation: quotation._id,
      items: quotation.items.map(item => ({
        product: item.product._id,
        variantId: item.variantId,
        quantity: item.quantity,
        rentalStartDate: item.rentalStartDate,
        rentalEndDate: item.rentalEndDate,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        notes: item.notes,
        status: 'reserved'
      })),
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      total: quotation.total,
      deliveryAddress: deliveryAddress || '',
      pickupAddress: pickupAddress || '',
      notes: notes || quotation.notes,
      status: 'confirmed'
    });

    await order.save();

    // Update quotation status
    quotation.status = 'converted';
    await quotation.save();

    // Reserve stock
    await reserveStock(order);

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name email companyName')
      .populate('items.product', 'name sku images')
      .populate('quotation', 'quotationNumber');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Vendor/Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['draft', 'confirmed', 'pickup_ready', 'with_customer', 'returned', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization check
    if (req.user.role === 'vendor' && order.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate status transitions
    const currentStatus = order.status;
    const validTransitions = {
      'draft': ['confirmed', 'cancelled'],
      'confirmed': ['pickup_ready', 'cancelled'],
      'pickup_ready': ['with_customer', 'cancelled'],
      'with_customer': ['returned'],
      'returned': [],
      'cancelled': []
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${currentStatus} to ${status}` 
      });
    }

    order.status = status;

    // Handle specific status changes
    if (status === 'pickup_ready') {
      order.pickupReadyDate = new Date();
    } else if (status === 'with_customer') {
      order.pickupDate = new Date();
      order.items.forEach(item => {
        item.status = 'with_customer';
      });
    } else if (status === 'returned') {
      order.returnDate = new Date();
      order.items.forEach(item => {
        item.status = 'returned';
        item.actualReturnDate = new Date();
      });
      // Release reserved stock
      await releaseStock(order);
    } else if (status === 'cancelled') {
      // Release reserved stock
      await releaseStock(order);
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process pickup
// @route   POST /api/orders/:id/pickup
// @access  Private (Vendor)
exports.processPickup = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status !== 'pickup_ready') {
      return res.status(400).json({ message: 'Order is not ready for pickup' });
    }

    const { pickupNotes, actualPickupDate } = req.body;

    order.status = 'with_customer';
    order.pickupDate = actualPickupDate ? new Date(actualPickupDate) : new Date();
    order.pickupNotes = pickupNotes || '';

    // Update item statuses
    order.items.forEach(item => {
      item.status = 'with_customer';
      item.actualPickupDate = order.pickupDate;
    });

    // Generate pickup document
    order.pickupDocument = {
      generatedDate: new Date(),
      pickupBy: req.user.id,
      notes: pickupNotes || ''
    };

    await order.save();

    // TODO: Send pickup confirmation email

    res.json({
      success: true,
      message: 'Pickup processed successfully',
      data: order
    });

  } catch (error) {
    console.error('Process pickup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process return
// @route   POST /api/orders/:id/return
// @access  Private (Vendor)
exports.processReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status !== 'with_customer') {
      return res.status(400).json({ message: 'Order is not with customer' });
    }

    const { returnNotes, actualReturnDate, damageNotes, lateFee } = req.body;

    const returnDateObj = actualReturnDate ? new Date(actualReturnDate) : new Date();

    order.status = 'returned';
    order.returnDate = returnDateObj;
    order.returnNotes = returnNotes || '';

    // Calculate late fees
    let totalLateFee = 0;
    order.items.forEach(item => {
      item.status = 'returned';
      item.actualReturnDate = returnDateObj;

      // Check if returned late
      if (returnDateObj > item.rentalEndDate) {
        const lateDays = Math.ceil(
          (returnDateObj - item.rentalEndDate) / (1000 * 60 * 60 * 24)
        );
        item.lateDays = lateDays;
        
        // Calculate late fee (e.g., 10% of rental price per day)
        const dailyLateFee = item.unitPrice * 0.1;
        item.lateFee = dailyLateFee * lateDays;
        totalLateFee += item.lateFee;
      }
    });

    if (lateFee) {
      totalLateFee = lateFee; // Override with manual late fee if provided
    }

    if (totalLateFee > 0) {
      order.lateFee = totalLateFee;
      order.total += totalLateFee;
    }

    // Generate return document
    order.returnDocument = {
      generatedDate: new Date(),
      returnedBy: req.user.id,
      notes: returnNotes || '',
      damageNotes: damageNotes || '',
      lateFee: totalLateFee
    };

    await order.save();

    // Release stock
    await releaseStock(order);

    // Update invoice if late fee applied
    if (totalLateFee > 0 && order.invoice) {
      const invoice = await Invoice.findById(order.invoice);
      if (invoice) {
        invoice.lateFee = totalLateFee;
        invoice.total += totalLateFee;
        invoice.balanceDue += totalLateFee;
        await invoice.save();
      }
    }

    // TODO: Send return confirmation email

    res.json({
      success: true,
      message: 'Return processed successfully',
      data: order
    });

  } catch (error) {
    console.error('Process return error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization check
    const isAuthorized = 
      (req.user.role === 'customer' && order.customer.toString() === req.user.id) ||
      (req.user.role === 'vendor' && order.vendor.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['draft', 'confirmed', 'pickup_ready'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    const { reason } = req.body;

    order.status = 'cancelled';
    order.cancellationReason = reason || '';
    order.cancelledBy = req.user.id;
    order.cancelledAt = new Date();

    await order.save();

    // Release reserved stock
    await releaseStock(order);

    // TODO: Process refund if payment was made

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper Functions

async function checkProductAvailability(productId, startDate, endDate, quantity, variantId = null) {
  const product = await Product.findById(productId);
  
  if (!product) {
    return { available: false, availableQuantity: 0 };
  }

  const overlappingOrders = await Order.find({
    'items.product': productId,
    'items.variantId': variantId || null,
    status: { $in: ['confirmed', 'pickup_ready', 'with_customer'] },
    $or: [
      {
        'items.rentalStartDate': { $lte: endDate },
        'items.rentalEndDate': { $gte: startDate }
      }
    ]
  });

  let reservedQuantity = 0;
  overlappingOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.product.toString() === productId.toString()) {
        if (!variantId || item.variantId === variantId) {
          reservedQuantity += item.quantity;
        }
      }
    });
  });

  const availableQuantity = product.quantityOnHand - reservedQuantity;
  
  return {
    available: availableQuantity >= quantity,
    availableQuantity,
    reservedQuantity
  };
}

async function reserveStock(order) {
  // Stock reservation is handled through order status
  // Actual stock movement happens during pickup
  return true;
}

async function releaseStock(order) {
  // Release reserved stock when order is cancelled or returned
  // This allows the products to be rented again
  return true;
}

async function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await Order.countDocuments({
    createdAt: {
      $gte: new Date(year, date.getMonth(), 1),
      $lt: new Date(year, date.getMonth() + 1, 1)
    }
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `ORD-${year}${month}-${sequence}`;
}

module.exports = exports;
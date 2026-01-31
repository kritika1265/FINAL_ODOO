const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Invoice Controller
 * Handles invoice generation, payments, and PDF exports
 */

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getAllInvoices = async (req, res) => {
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
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const invoices = await Invoice.find(filter)
      .populate('customer', 'name email companyName gstin')
      .populate('vendor', 'name email companyName gstin')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error while fetching invoices' });
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email companyName gstin phone address')
      .populate('vendor', 'name email companyName gstin phone address')
      .populate({
        path: 'order',
        populate: {
          path: 'items.product',
          select: 'name sku'
        }
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Authorization check
    if (req.user.role === 'customer' && invoice.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    if (req.user.role === 'vendor' && invoice.vendor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error while fetching invoice' });
  }
};

// @desc    Create invoice from order
// @route   POST /api/invoices/from-order/:orderId
// @access  Private (Vendor/Admin)
exports.createInvoiceFromOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('customer', 'name email companyName gstin')
      .populate('vendor', 'name email companyName gstin')
      .populate('items.product', 'name sku');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization check
    if (req.user.role === 'vendor' && order.vendor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ order: order._id });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice already exists for this order' });
    }

    const { 
      paymentType = 'full', // 'full' or 'partial'
      partialAmount,
      securityDeposit,
      paymentTerms,
      notes 
    } = req.body;

    let amountPaid = 0;
    let balanceDue = order.total;

    if (paymentType === 'partial') {
      if (!partialAmount || partialAmount <= 0) {
        return res.status(400).json({ message: 'Partial amount must be greater than 0' });
      }
      amountPaid = partialAmount;
      balanceDue = order.total - partialAmount;
    } else if (paymentType === 'full') {
      amountPaid = order.total;
      balanceDue = 0;
    }

    const invoice = new Invoice({
      invoiceNumber: await generateInvoiceNumber(),
      order: order._id,
      customer: order.customer._id,
      vendor: order.vendor._id,
      items: order.items.map(item => ({
        product: item.product._id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        rentalStartDate: item.rentalStartDate,
        rentalEndDate: item.rentalEndDate,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      securityDeposit: securityDeposit || 0,
      amountPaid,
      balanceDue,
      paymentTerms: paymentTerms || 'Due on receipt',
      notes: notes || '',
      status: balanceDue === 0 ? 'paid' : 'draft'
    });

    await invoice.save();

    // Update order with invoice reference
    order.invoice = invoice._id;
    await order.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'name email companyName gstin')
      .populate('vendor', 'name email companyName gstin')
      .populate('order', 'orderNumber');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: populatedInvoice
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Server error while creating invoice' });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private (Vendor/Admin)
exports.updateInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Authorization check
    if (req.user.role === 'vendor' && invoice.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only draft invoices can be edited
    if (invoice.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft invoices can be edited' });
    }

    const { paymentTerms, notes, securityDeposit } = req.body;

    if (paymentTerms) invoice.paymentTerms = paymentTerms;
    if (notes !== undefined) invoice.notes = notes;
    if (securityDeposit !== undefined) invoice.securityDeposit = securityDeposit;

    invoice.updatedAt = Date.now();
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });

  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error while updating invoice' });
  }
};

// @desc    Record payment
// @route   POST /api/invoices/:id/payment
// @access  Private
exports.recordPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const { 
      amount, 
      paymentMethod, 
      transactionId, 
      paymentDate,
      notes 
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    if (amount > invoice.balanceDue) {
      return res.status(400).json({ 
        message: `Payment amount exceeds balance due (${invoice.balanceDue})` 
      });
    }

    const payment = {
      amount,
      paymentMethod: paymentMethod || 'online',
      transactionId: transactionId || '',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      notes: notes || '',
      recordedBy: req.user.id
    };

    invoice.payments.push(payment);
    invoice.amountPaid += amount;
    invoice.balanceDue -= amount;

    if (invoice.balanceDue === 0) {
      invoice.status = 'paid';
      invoice.paidDate = payment.paymentDate;
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: invoice
    });

  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ message: 'Server error while recording payment' });
  }
};

// @desc    Generate invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
exports.generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email companyName gstin phone address')
      .populate('vendor', 'name email companyName gstin phone address')
      .populate({
        path: 'order',
        populate: {
          path: 'items.product',
          select: 'name sku description'
        }
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Authorization check
    const isAuthorized = 
      req.user.role === 'admin' ||
      (req.user.role === 'customer' && invoice.customer._id.toString() === req.user.id) ||
      (req.user.role === 'vendor' && invoice.vendor._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('RENTAL INVOICE', { align: 'center' });
    doc.moveDown();

    // Vendor Details
    doc.fontSize(12).text('From:', { underline: true });
    doc.fontSize(10);
    doc.text(invoice.vendor.companyName);
    doc.text(`GSTIN: ${invoice.vendor.gstin}`);
    if (invoice.vendor.address) doc.text(invoice.vendor.address);
    doc.text(`Email: ${invoice.vendor.email}`);
    doc.moveDown();

    // Customer Details
    doc.fontSize(12).text('Bill To:', { underline: true });
    doc.fontSize(10);
    doc.text(invoice.customer.companyName);
    doc.text(`GSTIN: ${invoice.customer.gstin}`);
    if (invoice.customer.address) doc.text(invoice.customer.address);
    doc.text(`Email: ${invoice.customer.email}`);
    doc.moveDown();

    // Invoice Details
    doc.fontSize(10);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Invoice Date: ${invoice.invoiceDate.toLocaleDateString()}`);
    doc.text(`Order Number: ${invoice.order.orderNumber}`);
    doc.text(`Status: ${invoice.status.toUpperCase()}`);
    doc.moveDown();

    // Line Items Table
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 250;
    const periodX = 300;
    const priceX = 400;
    const totalX = 480;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item', itemX, tableTop);
    doc.text('Qty', qtyX, tableTop);
    doc.text('Period', periodX, tableTop);
    doc.text('Price', priceX, tableTop);
    doc.text('Total', totalX, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    doc.font('Helvetica');
    let yPosition = tableTop + 25;

    invoice.items.forEach(item => {
      const product = invoice.order.items.find(
        i => i.product._id.toString() === item.product.toString()
      );

      const startDate = new Date(item.rentalStartDate).toLocaleDateString();
      const endDate = new Date(item.rentalEndDate).toLocaleDateString();

      doc.text(item.productName, itemX, yPosition, { width: 180 });
      doc.text(item.quantity.toString(), qtyX, yPosition);
      doc.text(`${startDate} - ${endDate}`, periodX, yPosition, { width: 80 });
      doc.text(`₹${item.unitPrice.toFixed(2)}`, priceX, yPosition);
      doc.text(`₹${item.lineTotal.toFixed(2)}`, totalX, yPosition);
      yPosition += 30;
    });

    doc.moveDown();
    yPosition += 10;

    // Totals
    const totalsX = 400;
    doc.font('Helvetica');
    doc.text('Subtotal:', totalsX, yPosition);
    doc.text(`₹${invoice.subtotal.toFixed(2)}`, totalX, yPosition);
    yPosition += 20;

    doc.text('Tax (GST):', totalsX, yPosition);
    doc.text(`₹${invoice.tax.toFixed(2)}`, totalX, yPosition);
    yPosition += 20;

    if (invoice.lateFee > 0) {
      doc.text('Late Fee:', totalsX, yPosition);
      doc.text(`₹${invoice.lateFee.toFixed(2)}`, totalX, yPosition);
      yPosition += 20;
    }

    if (invoice.securityDeposit > 0) {
      doc.text('Security Deposit:', totalsX, yPosition);
      doc.text(`₹${invoice.securityDeposit.toFixed(2)}`, totalX, yPosition);
      yPosition += 20;
    }

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total:', totalsX, yPosition);
    doc.text(`₹${invoice.total.toFixed(2)}`, totalX, yPosition);
    yPosition += 20;

    doc.font('Helvetica').fontSize(10);
    doc.text('Amount Paid:', totalsX, yPosition);
    doc.text(`₹${invoice.amountPaid.toFixed(2)}`, totalX, yPosition);
    yPosition += 20;

    doc.font('Helvetica-Bold');
    doc.text('Balance Due:', totalsX, yPosition);
    doc.text(`₹${invoice.balanceDue.toFixed(2)}`, totalX, yPosition);

    doc.moveDown(2);

    // Payment Terms & Notes
    if (invoice.paymentTerms) {
      doc.font('Helvetica').fontSize(10);
      doc.text(`Payment Terms: ${invoice.paymentTerms}`);
    }

    if (invoice.notes) {
      doc.moveDown();
      doc.text(`Notes: ${invoice.notes}`);
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).text(
      'Thank you for your business!',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();

  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Server error while generating PDF' });
  }
};

// @desc    Send invoice email
// @route   POST /api/invoices/:id/send
// @access  Private (Vendor/Admin)
exports.sendInvoiceEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('vendor', 'companyName');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (req.user.role === 'vendor' && invoice.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // TODO: Implement email sending logic
    // Generate PDF and send via email service

    invoice.status = 'sent';
    invoice.sentDate = new Date();
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice sent successfully'
    });

  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to generate invoice number
async function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await Invoice.countDocuments({
    invoiceDate: {
      $gte: new Date(year, date.getMonth(), 1),
      $lt: new Date(year, date.getMonth() + 1, 1)
    }
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `INV-${year}${month}-${sequence}`;
}

module.exports = exports;
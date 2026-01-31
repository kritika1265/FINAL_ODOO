/**
 * Invoice Service
 * Handles invoice generation, numbering, and management
 */

const moment = require('moment');

class InvoiceService {
  /**
   * Generate invoice from order
   * @param {Object} order - Order object
   * @param {Object} options - Invoice options
   * @returns {Object} Invoice object
   */
  async generateInvoice(order, options = {}) {
    try {
      const Invoice = require('../models/Invoice');
      const pricingService = require('./pricingService');

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Prepare line items
      const lineItems = order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        rentalPeriod: item.rentalPeriod,
        startDate: item.startDate,
        endDate: item.endDate,
        subtotal: item.subtotal,
        discount: item.discount || 0,
        tax: item.tax,
        total: item.total
      }));

      // Calculate invoice totals
      const invoiceTotals = pricingService.calculateInvoiceTotal(
        lineItems,
        options.additionalCharges || [],
        options.discount,
        options.isInterState || false
      );

      // Create invoice
      const invoice = await Invoice.create({
        invoiceNumber,
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        vendorId: order.vendorId,
        
        // Billing details
        billingAddress: order.billingAddress,
        customerGSTIN: order.customerGSTIN,
        vendorGSTIN: order.vendorGSTIN,
        
        // Line items
        lineItems: invoiceTotals.lineItems,
        
        // Additional charges
        additionalCharges: invoiceTotals.additionalCharges,
        
        // Amounts
        subtotal: invoiceTotals.lineItemsSubtotal,
        additionalChargesTotal: invoiceTotals.additionalChargesTotal,
        discount: invoiceTotals.discount,
        taxableAmount: invoiceTotals.taxableAmount,
        tax: invoiceTotals.tax,
        total: invoiceTotals.grandTotal,
        
        // Payment
        amountPaid: 0,
        amountDue: invoiceTotals.grandTotal,
        
        // Dates
        invoiceDate: options.invoiceDate || new Date(),
        dueDate: options.dueDate || moment().add(15, 'days').toDate(),
        
        // Status
        status: 'draft',
        
        // Other details
        paymentTerms: options.paymentTerms || 'Payment due within 15 days',
        notes: options.notes || '',
        
        // Metadata
        createdBy: options.createdBy
      });

      return invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  /**
   * Generate unique invoice number
   * @returns {String} Invoice number
   */
  async generateInvoiceNumber() {
    try {
      const Invoice = require('../models/Invoice');
      const Settings = require('../models/Settings');

      // Get invoice numbering settings
      const settings = await Settings.findOne();
      const prefix = settings?.invoicePrefix || 'INV';
      const startNumber = settings?.invoiceStartNumber || 1000;

      // Get last invoice number
      const lastInvoice = await Invoice.findOne()
        .sort({ createdAt: -1 })
        .select('invoiceNumber');

      let nextNumber = startNumber;

      if (lastInvoice && lastInvoice.invoiceNumber) {
        // Extract number from last invoice
        const match = lastInvoice.invoiceNumber.match(/\d+$/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }

      // Format: INV-2024-0001
      const year = moment().format('YYYY');
      const paddedNumber = nextNumber.toString().padStart(4, '0');
      
      return `${prefix}-${year}-${paddedNumber}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      throw error;
    }
  }

  /**
   * Record payment for invoice
   * @param {ObjectId} invoiceId 
   * @param {Object} paymentData 
   * @returns {Object} Updated invoice
   */
  async recordPayment(invoiceId, paymentData) {
    try {
      const Invoice = require('../models/Invoice');
      const Payment = require('../models/Payment');

      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Create payment record
      const payment = await Payment.create({
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        customerId: invoice.customerId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        paymentDate: paymentData.paymentDate || new Date(),
        transactionId: paymentData.transactionId,
        status: 'completed',
        notes: paymentData.notes
      });

      // Update invoice
      invoice.amountPaid = (invoice.amountPaid || 0) + paymentData.amount;
      invoice.amountDue = invoice.total - invoice.amountPaid;

      // Add payment to invoice payments array
      if (!invoice.payments) {
        invoice.payments = [];
      }
      invoice.payments.push({
        paymentId: payment._id,
        amount: paymentData.amount,
        paymentDate: payment.paymentDate,
        method: payment.paymentMethod
      });

      // Update status
      if (invoice.amountDue <= 0) {
        invoice.status = 'paid';
        invoice.paidAt = new Date();
      } else if (invoice.amountPaid > 0) {
        invoice.status = 'partially_paid';
      }

      await invoice.save();

      return {
        invoice,
        payment
      };
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * Update invoice status
   * @param {ObjectId} invoiceId 
   * @param {String} status 
   * @returns {Object} Updated invoice
   */
  async updateStatus(invoiceId, status) {
    try {
      const Invoice = require('../models/Invoice');

      const validStatuses = ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      invoice.status = status;

      if (status === 'sent' && !invoice.sentAt) {
        invoice.sentAt = new Date();
      }

      if (status === 'paid' && !invoice.paidAt) {
        invoice.paidAt = new Date();
        invoice.amountDue = 0;
      }

      if (status === 'cancelled') {
        invoice.cancelledAt = new Date();
      }

      await invoice.save();

      return invoice;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  /**
   * Add late fee to overdue invoice
   * @param {ObjectId} invoiceId 
   * @returns {Object} Updated invoice
   */
  async addLateFee(invoiceId) {
    try {
      const Invoice = require('../models/Invoice');
      const pricingService = require('./pricingService');

      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'paid') {
        return invoice; // No late fee for paid invoices
      }

      const now = moment();
      const dueDate = moment(invoice.dueDate);

      if (now.isAfter(dueDate)) {
        const daysOverdue = now.diff(dueDate, 'days');
        const lateFeePercentage = 2; // 2% per month
        const lateFee = (invoice.amountDue * lateFeePercentage * daysOverdue) / (100 * 30);

        // Add late fee as additional charge
        if (!invoice.additionalCharges) {
          invoice.additionalCharges = [];
        }

        // Check if late fee already added
        const existingLateFee = invoice.additionalCharges.find(
          charge => charge.description === 'Late Payment Fee'
        );

        if (!existingLateFee) {
          invoice.additionalCharges.push({
            description: 'Late Payment Fee',
            amount: parseFloat(lateFee.toFixed(2)),
            date: new Date()
          });

          // Recalculate totals
          const newTotal = invoice.total + lateFee;
          invoice.total = parseFloat(newTotal.toFixed(2));
          invoice.amountDue = parseFloat((invoice.total - invoice.amountPaid).toFixed(2));

          invoice.status = 'overdue';
          await invoice.save();
        }
      }

      return invoice;
    } catch (error) {
      console.error('Error adding late fee:', error);
      throw error;
    }
  }

  /**
   * Generate credit note (refund invoice)
   * @param {ObjectId} invoiceId 
   * @param {Number} refundAmount 
   * @param {String} reason 
   * @returns {Object} Credit note
   */
  async generateCreditNote(invoiceId, refundAmount, reason) {
    try {
      const Invoice = require('../models/Invoice');
      const CreditNote = require('../models/CreditNote');

      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (refundAmount > invoice.amountPaid) {
        throw new Error('Refund amount cannot exceed paid amount');
      }

      // Generate credit note number
      const creditNoteNumber = await this.generateCreditNoteNumber();

      // Create credit note
      const creditNote = await CreditNote.create({
        creditNoteNumber,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        vendorId: invoice.vendorId,
        amount: refundAmount,
        reason,
        creditNoteDate: new Date(),
        status: 'issued'
      });

      // Update invoice
      invoice.amountPaid = (invoice.amountPaid || 0) - refundAmount;
      invoice.amountDue = invoice.total - invoice.amountPaid;

      if (!invoice.creditNotes) {
        invoice.creditNotes = [];
      }
      invoice.creditNotes.push({
        creditNoteId: creditNote._id,
        amount: refundAmount,
        date: creditNote.creditNoteDate
      });

      await invoice.save();

      return {
        creditNote,
        invoice
      };
    } catch (error) {
      console.error('Error generating credit note:', error);
      throw error;
    }
  }

  /**
   * Generate credit note number
   * @returns {String} Credit note number
   */
  async generateCreditNoteNumber() {
    try {
      const CreditNote = require('../models/CreditNote');

      const lastCreditNote = await CreditNote.findOne()
        .sort({ createdAt: -1 })
        .select('creditNoteNumber');

      let nextNumber = 1000;

      if (lastCreditNote && lastCreditNote.creditNoteNumber) {
        const match = lastCreditNote.creditNoteNumber.match(/\d+$/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }

      const year = moment().format('YYYY');
      const paddedNumber = nextNumber.toString().padStart(4, '0');
      
      return `CN-${year}-${paddedNumber}`;
    } catch (error) {
      console.error('Error generating credit note number:', error);
      throw error;
    }
  }

  /**
   * Check and mark overdue invoices
   * @returns {Object} Results
   */
  async markOverdueInvoices() {
    try {
      const Invoice = require('../models/Invoice');

      const overdueInvoices = await Invoice.find({
        status: { $in: ['sent', 'partially_paid'] },
        dueDate: { $lt: new Date() },
        amountDue: { $gt: 0 }
      });

      const results = [];

      for (const invoice of overdueInvoices) {
        invoice.status = 'overdue';
        await invoice.save();

        // Optionally add late fee
        await this.addLateFee(invoice._id);

        results.push({
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          dueDate: invoice.dueDate,
          amountDue: invoice.amountDue
        });
      }

      return {
        success: true,
        count: results.length,
        invoices: results
      };
    } catch (error) {
      console.error('Error marking overdue invoices:', error);
      throw error;
    }
  }

  /**
   * Get invoice summary statistics
   * @param {Object} filters 
   * @returns {Object} Statistics
   */
  async getInvoiceStatistics(filters = {}) {
    try {
      const Invoice = require('../models/Invoice');

      const query = {};

      if (filters.vendorId) {
        query.vendorId = filters.vendorId;
      }

      if (filters.startDate && filters.endDate) {
        query.invoiceDate = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const invoices = await Invoice.find(query);

      const stats = {
        totalInvoices: invoices.length,
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        byStatus: {
          draft: 0,
          sent: 0,
          partially_paid: 0,
          paid: 0,
          overdue: 0,
          cancelled: 0
        }
      };

      invoices.forEach(invoice => {
        stats.totalAmount += invoice.total || 0;
        stats.totalPaid += invoice.amountPaid || 0;
        stats.totalDue += invoice.amountDue || 0;
        stats.byStatus[invoice.status] = (stats.byStatus[invoice.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting invoice statistics:', error);
      throw error;
    }
  }

  /**
   * Validate invoice before sending
   * @param {ObjectId} invoiceId 
   * @returns {Object} Validation result
   */
  async validateInvoice(invoiceId) {
    try {
      const Invoice = require('../models/Invoice');

      const invoice = await Invoice.findById(invoiceId)
        .populate('customerId', 'name email gstin')
        .populate('vendorId', 'name email gstin');

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const errors = [];
      const warnings = [];

      // Required fields validation
      if (!invoice.lineItems || invoice.lineItems.length === 0) {
        errors.push('Invoice must have at least one line item');
      }

      if (!invoice.customerId) {
        errors.push('Customer information is missing');
      }

      if (!invoice.billingAddress) {
        errors.push('Billing address is required');
      }

      if (!invoice.customerGSTIN) {
        warnings.push('Customer GSTIN is missing');
      }

      if (!invoice.vendorGSTIN) {
        errors.push('Vendor GSTIN is required');
      }

      if (invoice.total <= 0) {
        errors.push('Invoice total must be greater than zero');
      }

      // Business logic validation
      if (!invoice.dueDate || moment(invoice.dueDate).isBefore(invoice.invoiceDate)) {
        warnings.push('Due date should be after invoice date');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        invoice
      };
    } catch (error) {
      console.error('Error validating invoice:', error);
      throw error;
    }
  }

  /**
   * Clone invoice (for recurring billing)
   * @param {ObjectId} invoiceId 
   * @returns {Object} New invoice
   */
  async cloneInvoice(invoiceId) {
    try {
      const Invoice = require('../models/Invoice');

      const originalInvoice = await Invoice.findById(invoiceId);
      if (!originalInvoice) {
        throw new Error('Invoice not found');
      }

      const newInvoiceNumber = await this.generateInvoiceNumber();

      const newInvoice = await Invoice.create({
        invoiceNumber: newInvoiceNumber,
        orderId: originalInvoice.orderId,
        customerId: originalInvoice.customerId,
        vendorId: originalInvoice.vendorId,
        billingAddress: originalInvoice.billingAddress,
        customerGSTIN: originalInvoice.customerGSTIN,
        vendorGSTIN: originalInvoice.vendorGSTIN,
        lineItems: originalInvoice.lineItems,
        additionalCharges: originalInvoice.additionalCharges,
        subtotal: originalInvoice.subtotal,
        discount: originalInvoice.discount,
        tax: originalInvoice.tax,
        total: originalInvoice.total,
        amountPaid: 0,
        amountDue: originalInvoice.total,
        invoiceDate: new Date(),
        dueDate: moment().add(15, 'days').toDate(),
        status: 'draft',
        paymentTerms: originalInvoice.paymentTerms,
        notes: `Cloned from invoice ${originalInvoice.invoiceNumber}`
      });

      return newInvoice;
    } catch (error) {
      console.error('Error cloning invoice:', error);
      throw error;
    }
  }
}

module.exports = new InvoiceService();
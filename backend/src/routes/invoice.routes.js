/**
 * Invoice Routes
 * Handles invoice generation, payment tracking, and invoice management
 */

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

// Import invoice controller (to be implemented)
// const invoiceController = require('../controllers/invoice.controller');

// Import middleware
// const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices (filtered by role)
 * @access  Private
 */
router.get(
  '/',
  /* authenticate, */
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled']),
    query('customerId').optional().isMongoId(),
    query('orderId').optional().isMongoId(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('sortBy').optional().isIn(['invoiceNumber', 'createdAt', 'dueDate', 'total']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const result = await invoiceController.getInvoices(req.user, req.query);

      res.status(200).json({
        success: true,
        data: {
          // invoices: result.invoices,
          // pagination: result.pagination,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch invoices',
      });
    }
  }
);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get(
  '/:id',
  /* authenticate, */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const invoice = await invoiceController.getInvoiceById(req.params.id, req.user);

      res.status(200).json({
        success: true,
        data: {
          // invoice,
        },
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Invoice not found',
      });
    }
  }
);

/**
 * @route   GET /api/invoices/number/:invoiceNumber
 * @desc    Get invoice by invoice number
 * @access  Private
 */
router.get(
  '/number/:invoiceNumber',
  /* authenticate, */
  [
    param('invoiceNumber').trim().notEmpty().withMessage('Invoice number is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const invoice = await invoiceController.getInvoiceByNumber(
      //   req.params.invoiceNumber,
      //   req.user
      // );

      res.status(200).json({
        success: true,
        data: {
          // invoice,
        },
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Invoice not found',
      });
    }
  }
);

/**
 * @route   POST /api/invoices
 * @desc    Create invoice from order
 * @access  Private (Admin/Vendor)
 */
router.post(
  '/',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    body('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('dueDate').isISO8601().withMessage('Due date is required'),
    body('paymentTerms').optional().trim(),
    body('notes').optional().trim(),
    body('additionalCharges').optional().isArray(),
    body('additionalCharges.*.description').optional().trim(),
    body('additionalCharges.*.amount').optional().isFloat({ min: 0 }),
    body('discount').optional().isObject(),
    body('discount.type').optional().isIn(['percentage', 'fixed']),
    body('discount.value').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const invoice = await invoiceController.createInvoice(req.body, req.user);

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: {
          // invoice,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create invoice',
      });
    }
  }
);

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update invoice (only draft invoices)
 * @access  Private (Admin/Vendor)
 */
router.put(
  '/:id',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
    body('dueDate').optional().isISO8601(),
    body('paymentTerms').optional().trim(),
    body('notes').optional().trim(),
    body('additionalCharges').optional().isArray(),
    body('discount').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const invoice = await invoiceController.updateInvoice(req.params.id, req.body, req.user);

      res.status(200).json({
        success: true,
        message: 'Invoice updated successfully',
        data: {
          // invoice,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update invoice',
      });
    }
  }
);

/**
 * @route   PUT /api/invoices/:id/status
 * @desc    Update invoice status
 * @access  Private (Admin/Vendor)
 */
router.put(
  '/:id/status',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
    body('status').isIn(['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const invoice = await invoiceController.updateStatus(
      //   req.params.id,
      //   req.body.status,
      //   req.user
      // );

      res.status(200).json({
        success: true,
        message: 'Invoice status updated successfully',
        data: {
          // invoice,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update status',
      });
    }
  }
);

/**
 * @route   POST /api/invoices/:id/send
 * @desc    Send invoice to customer via email
 * @access  Private (Admin/Vendor)
 */
router.post(
  '/:id/send',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
    body('email').optional().isEmail(),
    body('message').optional().trim(),
    body('attachPDF').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // await invoiceController.sendInvoice(req.params.id, req.body, req.user);

      res.status(200).json({
        success: true,
        message: 'Invoice sent successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send invoice',
      });
    }
  }
);

/**
 * @route   GET /api/invoices/:id/pdf
 * @desc    Download invoice as PDF
 * @access  Private
 */
router.get(
  '/:id/pdf',
  /* authenticate, */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const pdfBuffer = await invoiceController.generatePDF(req.params.id, req.user);

      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', `attachment; filename=invoice-${req.params.id}.pdf`);
      // res.send(pdfBuffer);

      res.status(200).json({
        success: true,
        message: 'PDF generation endpoint',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate PDF',
      });
    }
  }
);

/**
 * @route   POST /api/invoices/:id/payments
 * @desc    Record payment for invoice
 * @access  Private (Admin/Vendor)
 */
router.post(
  '/:id/payments',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
    body('amount').isFloat({ min: 0 }).withMessage('Payment amount is required'),
    body('paymentMethod').isIn(['cash', 'card', 'online', 'bank_transfer', 'cheque']),
    body('paymentDate').isISO8601().withMessage('Payment date is required'),
    body('transactionId').optional().trim(),
    body('notes').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const payment = await invoiceController.recordPayment(
      //   req.params.id,
      //   req.body,
      //   req.user
      // );

      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: {
          // payment,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to record payment',
      });
    }
  }
);

/**
 * @route   GET /api/invoices/:id/payments
 * @desc    Get all payments for invoice
 * @access  Private
 */
router.get(
  '/:id/payments',
  /* authenticate, */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const payments = await invoiceController.getPayments(req.params.id, req.user);

      res.status(200).json({
        success: true,
        data: {
          // payments,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payments',
      });
    }
  }
);

/**
 * @route   DELETE /api/invoices/:id/payments/:paymentId
 * @desc    Delete/reverse payment
 * @access  Private (Admin)
 */
router.delete(
  '/:id/payments/:paymentId',
  /* authenticate, authorize(['admin']), */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
    param('paymentId').isMongoId().withMessage('Invalid payment ID'),
    body('reason').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // await invoiceController.deletePayment(
      //   req.params.id,
      //   req.params.paymentId,
      //   req.user
      // );

      res.status(200).json({
        success: true,
        message: 'Payment deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete payment',
      });
    }
  }
);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete invoice (only draft invoices)
 * @access  Private (Admin/Vendor)
 */
router.delete(
  '/:id',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // await invoiceController.deleteInvoice(req.params.id, req.user);

      res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete invoice',
      });
    }
  }
);

/**
 * @route   GET /api/invoices/overdue/list
 * @desc    Get all overdue invoices
 * @access  Private (Admin/Vendor)
 */
router.get(
  '/overdue/list',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const result = await invoiceController.getOverdueInvoices(req.user, req.query);

      res.status(200).json({
        success: true,
        data: {
          // invoices: result.invoices,
          // pagination: result.pagination,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch overdue invoices',
      });
    }
  }
);

/**
 * @route   POST /api/invoices/:id/send-reminder
 * @desc    Send payment reminder to customer
 * @access  Private (Admin/Vendor)
 */
router.post(
  '/:id/send-reminder',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
    body('message').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // await invoiceController.sendPaymentReminder(req.params.id, req.body, req.user);

      res.status(200).json({
        success: true,
        message: 'Reminder sent successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send reminder',
      });
    }
  }
);

/**
 * @route   GET /api/invoices/stats/summary
 * @desc    Get invoice statistics summary
 * @access  Private (Admin/Vendor)
 */
router.get(
  '/stats/summary',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const stats = await invoiceController.getInvoiceStats(req.user, req.query);

      res.status(200).json({
        success: true,
        data: {
          // stats,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch statistics',
      });
    }
  }
);

module.exports = router;
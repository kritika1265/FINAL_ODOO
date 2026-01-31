const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const crypto = require('crypto');

/**
 * Payment Controller
 * Handles payment gateway integration, payment processing, and verification
 */

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private (Customer)
exports.initializePayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod = 'razorpay' } = req.body;

    const invoice = await Invoice.findById(invoiceId)
      .populate('order')
      .populate('customer', 'name email phone');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (amount > invoice.balanceDue) {
      return res.status(400).json({ 
        message: `Amount exceeds balance due (₹${invoice.balanceDue})` 
      });
    }

    // Create payment record
    const payment = new Payment({
      paymentId: `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      invoice: invoice._id,
      order: invoice.order._id,
      customer: invoice.customer._id,
      vendor: invoice.vendor,
      amount,
      paymentMethod,
      status: 'pending'
    });

    await payment.save();

    // Initialize payment gateway
    let paymentGatewayResponse;

    if (paymentMethod === 'razorpay') {
      paymentGatewayResponse = await initializeRazorpay(payment, invoice);
    } else if (paymentMethod === 'stripe') {
      paymentGatewayResponse = await initializeStripe(payment, invoice);
    } else {
      return res.status(400).json({ message: 'Unsupported payment method' });
    }

    payment.gatewayOrderId = paymentGatewayResponse.orderId;
    await payment.save();

    res.json({
      success: true,
      data: {
        paymentId: payment.paymentId,
        gatewayOrderId: paymentGatewayResponse.orderId,
        amount: payment.amount,
        currency: payment.currency,
        keyId: paymentGatewayResponse.keyId,
        customer: {
          name: invoice.customer.name,
          email: invoice.customer.email,
          phone: invoice.customer.phone
        }
      }
    });

  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ message: 'Server error while initializing payment' });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private (Customer)
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      paymentId, 
      gatewayPaymentId, 
      gatewayOrderId, 
      gatewaySignature 
    } = req.body;

    const payment = await Payment.findOne({ paymentId })
      .populate('invoice')
      .populate('order');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Verify signature
    let isVerified = false;

    if (payment.paymentMethod === 'razorpay') {
      isVerified = verifyRazorpaySignature(
        gatewayOrderId,
        gatewayPaymentId,
        gatewaySignature
      );
    } else if (payment.paymentMethod === 'stripe') {
      isVerified = await verifyStripePayment(gatewayPaymentId);
    }

    if (!isVerified) {
      payment.status = 'failed';
      payment.failureReason = 'Signature verification failed';
      await payment.save();

      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update payment
    payment.gatewayPaymentId = gatewayPaymentId;
    payment.status = 'completed';
    payment.paidAt = new Date();
    await payment.save();

    // Update invoice
    const invoice = payment.invoice;
    invoice.payments.push({
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: gatewayPaymentId,
      paymentDate: payment.paidAt,
      recordedBy: req.user.id
    });

    invoice.amountPaid += payment.amount;
    invoice.balanceDue -= payment.amount;

    if (invoice.balanceDue === 0) {
      invoice.status = 'paid';
      invoice.paidDate = payment.paidAt;
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    // Update order status if fully paid
    if (invoice.balanceDue === 0) {
      const order = payment.order;
      if (order.status === 'draft' || order.status === 'confirmed') {
        order.status = 'pickup_ready';
        order.pickupReadyDate = new Date();
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        status: payment.status,
        invoice: {
          invoiceNumber: invoice.invoiceNumber,
          balanceDue: invoice.balanceDue,
          status: invoice.status
        }
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error while verifying payment' });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoice', 'invoiceNumber total balanceDue')
      .populate('order', 'orderNumber')
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name companyName');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Authorization check
    const isAuthorized = 
      req.user.role === 'admin' ||
      payment.customer._id.toString() === req.user.id ||
      payment.vendor._id.toString() === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getAllPayments = async (req, res) => {
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

    const payments = await Payment.find(filter)
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name companyName')
      .populate('invoice', 'invoiceNumber')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error while fetching payments' });
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Vendor/Admin)
exports.processRefund = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoice')
      .populate('order');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Authorization check
    if (req.user.role === 'vendor' && payment.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    if (payment.refundStatus === 'refunded') {
      return res.status(400).json({ message: 'Payment has already been refunded' });
    }

    const { amount, reason } = req.body;

    if (!amount || amount <= 0 || amount > payment.amount) {
      return res.status(400).json({ message: 'Invalid refund amount' });
    }

    // Process refund through payment gateway
    let refundResult;

    if (payment.paymentMethod === 'razorpay') {
      refundResult = await processRazorpayRefund(payment.gatewayPaymentId, amount);
    } else if (payment.paymentMethod === 'stripe') {
      refundResult = await processStripeRefund(payment.gatewayPaymentId, amount);
    }

    if (!refundResult.success) {
      return res.status(500).json({ message: 'Refund processing failed' });
    }

    // Update payment
    payment.refundAmount = amount;
    payment.refundStatus = amount === payment.amount ? 'refunded' : 'partial_refund';
    payment.refundReason = reason || '';
    payment.refundedAt = new Date();
    payment.gatewayRefundId = refundResult.refundId;

    await payment.save();

    // Update invoice
    const invoice = payment.invoice;
    invoice.amountPaid -= amount;
    invoice.balanceDue += amount;
    
    if (invoice.balanceDue > 0) {
      invoice.status = invoice.amountPaid === 0 ? 'draft' : 'partial';
    }

    await invoice.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundAmount: amount,
        refundId: refundResult.refundId,
        refundStatus: payment.refundStatus
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Server error while processing refund' });
  }
};

// @desc    Webhook handler for payment gateway
// @route   POST /api/payments/webhook
// @access  Public (Webhook)
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['stripe-signature'];
    const payload = req.body;

    // Verify webhook signature
    const isValid = verifyWebhookSignature(signature, payload);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    // Process webhook event
    const eventType = payload.event;

    if (eventType === 'payment.captured' || eventType === 'charge.succeeded') {
      await handlePaymentSuccess(payload);
    } else if (eventType === 'payment.failed' || eventType === 'charge.failed') {
      await handlePaymentFailure(payload);
    } else if (eventType === 'refund.created') {
      await handleRefundCreated(payload);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// Payment Gateway Helper Functions

async function initializeRazorpay(payment, invoice) {
  // Mock Razorpay initialization
  // In production, use actual Razorpay SDK
  const Razorpay = require('razorpay');
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  const options = {
    amount: payment.amount * 100, // Amount in paise
    currency: payment.currency,
    receipt: payment.paymentId,
    notes: {
      invoiceId: invoice._id.toString(),
      customerId: invoice.customer._id.toString()
    }
  };

  const order = await razorpay.orders.create(options);

  return {
    orderId: order.id,
    keyId: process.env.RAZORPAY_KEY_ID
  };
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

async function processRazorpayRefund(paymentId, amount) {
  // Mock refund processing
  // In production, use actual Razorpay SDK
  const Razorpay = require('razorpay');
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100 // Amount in paise
    });

    return {
      success: true,
      refundId: refund.id
    };
  } catch (error) {
    console.error('Razorpay refund error:', error);
    return { success: false };
  }
}

async function initializeStripe(payment, invoice) {
  // Mock Stripe initialization
  // In production, use actual Stripe SDK
  return {
    orderId: `stripe_${Date.now()}`,
    keyId: process.env.STRIPE_PUBLISHABLE_KEY
  };
}

async function verifyStripePayment(paymentIntentId) {
  // Mock Stripe verification
  return true;
}

async function processStripeRefund(paymentIntentId, amount) {
  // Mock Stripe refund
  return {
    success: true,
    refundId: `re_${Date.now()}`
  };
}

function verifyWebhookSignature(signature, payload) {
  // Implement actual webhook signature verification
  return true;
}

async function handlePaymentSuccess(payload) {
  // Handle successful payment webhook
  console.log('Payment success webhook:', payload);
}

async function handlePaymentFailure(payload) {
  // Handle failed payment webhook
  console.log('Payment failure webhook:', payload);
}

async function handleRefundCreated(payload) {
  // Handle refund webhook
  console.log('Refund webhook:', payload);
}

module.exports = exports;
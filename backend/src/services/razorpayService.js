const razorpayInstance = require('../config/razorpay');
const crypto = require('crypto');

/**
 * Create a Razorpay order
 */
exports.createOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (smallest unit)
      currency: currency,
      receipt: receipt, // Unique order reference
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay create order error:', error);
    throw new Error('Failed to create Razorpay order');
  }
};

/**
 * Verify Razorpay payment signature
 */
exports.verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return generatedSignature === razorpaySignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 */
exports.fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Fetch payment error:', error);
    throw new Error('Failed to fetch payment details');
  }
};

/**
 * Issue refund
 */
exports.issueRefund = async (paymentId, amount) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: amount * 100, // Amount in paise
    });
    return refund;
  } catch (error) {
    console.error('Refund error:', error);
    throw new Error('Failed to process refund');
  }
};
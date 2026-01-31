/**
 * Reservation Service
 * Handles product reservations and stock management for rental orders
 */

const moment = require('moment');

class ReservationService {
  /**
   * Create reservation for rental order
   * @param {Object} orderData - Order details
   * @returns {Object} Reservation details
   */
  async createReservation(orderData) {
    try {
      const Product = require('../models/Product');
      const Order = require('../models/Order');
      const availabilityService = require('./availabilityService');

      // Validate all items are available
      const availabilityCheck = await availabilityService.checkMultipleAvailability(
        orderData.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          startDate: item.startDate,
          endDate: item.endDate
        }))
      );

      if (!availabilityCheck.available) {
        const unavailableItems = availabilityCheck.items
          .filter(item => !item.available)
          .map(item => item.productId);
        
        throw new Error(`Products not available: ${unavailableItems.join(', ')}`);
      }

      // Create reservations for each item
      const reservations = [];
      
      for (const item of orderData.items) {
        const reservation = {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          startDate: item.startDate,
          endDate: item.endDate,
          status: 'reserved',
          reservedAt: new Date(),
          expiresAt: moment().add(30, 'minutes').toDate(), // Reservation expires in 30 mins if not confirmed
        };

        reservations.push(reservation);
      }

      return {
        success: true,
        reservations,
        expiresAt: reservations[0].expiresAt,
        message: 'Products reserved successfully'
      };
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  /**
   * Confirm reservation (when order is confirmed/paid)
   * @param {ObjectId} orderId 
   * @returns {Object} Confirmation details
   */
  async confirmReservation(orderId) {
    try {
      const Order = require('../models/Order');
      const StockMovement = require('../models/StockMovement');

      const order = await Order.findById(orderId).populate('items.productId');
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'draft' && order.status !== 'confirmed') {
        throw new Error('Order cannot be confirmed');
      }

      // Create stock movements for each item
      const stockMovements = [];

      for (const item of order.items) {
        // Record stock movement
        const movement = await StockMovement.create({
          productId: item.productId,
          variantId: item.variantId,
          orderId: order._id,
          type: 'reserved',
          quantity: -item.quantity, // Negative for reduction
          fromLocation: 'warehouse',
          toLocation: 'reserved',
          date: new Date(),
          notes: `Reserved for order ${order.orderNumber}`
        });

        stockMovements.push(movement);

        // Update product reserved quantity (if tracking separately)
        await this.updateReservedQuantity(item.productId, item.variantId, item.quantity, 'increase');
      }

      // Update order status
      order.status = 'confirmed';
      order.reservationConfirmedAt = new Date();
      await order.save();

      return {
        success: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        stockMovements,
        message: 'Reservation confirmed successfully'
      };
    } catch (error) {
      console.error('Error confirming reservation:', error);
      throw error;
    }
  }

  /**
   * Release reservation (when order is cancelled or expired)
   * @param {ObjectId} orderId 
   * @param {String} reason 
   * @returns {Object} Release details
   */
  async releaseReservation(orderId, reason = 'Order cancelled') {
    try {
      const Order = require('../models/Order');
      const StockMovement = require('../models/StockMovement');

      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Create stock movements to release reserved items
      const stockMovements = [];

      for (const item of order.items) {
        // Record stock movement
        const movement = await StockMovement.create({
          productId: item.productId,
          variantId: item.variantId,
          orderId: order._id,
          type: 'released',
          quantity: item.quantity, // Positive for addition back
          fromLocation: 'reserved',
          toLocation: 'warehouse',
          date: new Date(),
          notes: reason
        });

        stockMovements.push(movement);

        // Update product reserved quantity
        await this.updateReservedQuantity(item.productId, item.variantId, item.quantity, 'decrease');
      }

      // Update order status
      order.status = 'cancelled';
      order.cancellationReason = reason;
      order.cancelledAt = new Date();
      await order.save();

      return {
        success: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        stockMovements,
        message: 'Reservation released successfully'
      };
    } catch (error) {
      console.error('Error releasing reservation:', error);
      throw error;
    }
  }

  /**
   * Process pickup (move stock from warehouse to customer)
   * @param {ObjectId} orderId 
   * @param {Object} pickupData 
   * @returns {Object} Pickup details
   */
  async processPickup(orderId, pickupData) {
    try {
      const Order = require('../models/Order');
      const StockMovement = require('../models/StockMovement');
      const Pickup = require('../models/Pickup');

      const order = await Order.findById(orderId).populate('items.productId');
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'confirmed') {
        throw new Error('Order must be confirmed before pickup');
      }

      // Create pickup document
      const pickup = await Pickup.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        items: order.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          quantity: item.quantity,
          condition: 'good'
        })),
        pickupDate: pickupData.pickupDate || new Date(),
        pickupBy: pickupData.pickupBy,
        notes: pickupData.notes,
        images: pickupData.images || [],
        status: 'completed'
      });

      // Create stock movements
      const stockMovements = [];

      for (const item of order.items) {
        // Move from reserved to with customer
        const movement = await StockMovement.create({
          productId: item.productId,
          variantId: item.variantId,
          orderId: order._id,
          pickupId: pickup._id,
          type: 'pickup',
          quantity: -item.quantity,
          fromLocation: 'reserved',
          toLocation: 'with_customer',
          date: pickup.pickupDate,
          notes: `Picked up by ${pickupData.pickupBy || 'customer'}`
        });

        stockMovements.push(movement);

        // Update product quantities
        await this.updateReservedQuantity(item.productId, item.variantId, item.quantity, 'decrease');
        await this.updateWithCustomerQuantity(item.productId, item.variantId, item.quantity, 'increase');
      }

      // Update order status
      order.status = 'picked_up';
      order.pickupId = pickup._id;
      order.pickedUpAt = pickup.pickupDate;
      await order.save();

      return {
        success: true,
        pickup,
        stockMovements,
        message: 'Pickup processed successfully'
      };
    } catch (error) {
      console.error('Error processing pickup:', error);
      throw error;
    }
  }

  /**
   * Process return (move stock from customer to warehouse)
   * @param {ObjectId} orderId 
   * @param {Object} returnData 
   * @returns {Object} Return details
   */
  async processReturn(orderId, returnData) {
    try {
      const Order = require('../models/Order');
      const StockMovement = require('../models/StockMovement');
      const Return = require('../models/Return');
      const pricingService = require('./pricingService');

      const order = await Order.findById(orderId).populate('items.productId');
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'picked_up' && order.status !== 'active') {
        throw new Error('Order must be picked up before return');
      }

      // Calculate late fees if applicable
      let lateFee = 0;
      if (returnData.returnDate && moment(returnData.returnDate).isAfter(order.rentalEndDate)) {
        const lateFeeCalc = pricingService.calculateLateFee(
          order.rentalEndDate,
          returnData.returnDate,
          order.items[0].unitPrice // Using first item's daily rate
        );
        lateFee = lateFeeCalc.lateFee;
      }

      // Create return document
      const returnDoc = await Return.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        items: order.items.map((item, index) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          quantity: item.quantity,
          condition: returnData.condition || 'good',
          damageNotes: returnData.items?.[index]?.damageNotes
        })),
        returnDate: returnData.returnDate || new Date(),
        returnedBy: returnData.returnedBy,
        expectedReturnDate: order.rentalEndDate,
        isLate: moment(returnData.returnDate).isAfter(order.rentalEndDate),
        lateFee: lateFee,
        damageFee: returnData.damageFee || 0,
        notes: returnData.notes,
        images: returnData.images || [],
        status: 'completed'
      });

      // Create stock movements
      const stockMovements = [];

      for (const item of order.items) {
        // Determine destination based on condition
        const toLocation = returnData.condition === 'damaged' ? 'maintenance' : 'warehouse';

        // Move from with customer back to warehouse/maintenance
        const movement = await StockMovement.create({
          productId: item.productId,
          variantId: item.variantId,
          orderId: order._id,
          returnId: returnDoc._id,
          type: 'return',
          quantity: item.quantity,
          fromLocation: 'with_customer',
          toLocation: toLocation,
          date: returnDoc.returnDate,
          notes: `Returned in ${returnData.condition} condition`
        });

        stockMovements.push(movement);

        // Update product quantities
        await this.updateWithCustomerQuantity(item.productId, item.variantId, item.quantity, 'decrease');
        
        if (toLocation === 'warehouse') {
          await this.updateAvailableQuantity(item.productId, item.variantId, item.quantity, 'increase');
        }
      }

      // Update order status
      order.status = 'returned';
      order.returnId = returnDoc._id;
      order.returnedAt = returnDoc.returnDate;
      await order.save();

      return {
        success: true,
        return: returnDoc,
        stockMovements,
        lateFee,
        message: 'Return processed successfully'
      };
    } catch (error) {
      console.error('Error processing return:', error);
      throw error;
    }
  }

  /**
   * Update reserved quantity for a product
   * @param {ObjectId} productId 
   * @param {ObjectId} variantId 
   * @param {Number} quantity 
   * @param {String} operation - 'increase' or 'decrease'
   */
  async updateReservedQuantity(productId, variantId, quantity, operation) {
    try {
      const Product = require('../models/Product');

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const change = operation === 'increase' ? quantity : -quantity;

      if (variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.id(variantId);
        if (variant) {
          variant.reservedQuantity = (variant.reservedQuantity || 0) + change;
        }
      } else {
        product.reservedQuantity = (product.reservedQuantity || 0) + change;
      }

      await product.save();
    } catch (error) {
      console.error('Error updating reserved quantity:', error);
      throw error;
    }
  }

  /**
   * Update with customer quantity
   * @param {ObjectId} productId 
   * @param {ObjectId} variantId 
   * @param {Number} quantity 
   * @param {String} operation 
   */
  async updateWithCustomerQuantity(productId, variantId, quantity, operation) {
    try {
      const Product = require('../models/Product');

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const change = operation === 'increase' ? quantity : -quantity;

      if (variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.id(variantId);
        if (variant) {
          variant.withCustomerQuantity = (variant.withCustomerQuantity || 0) + change;
        }
      } else {
        product.withCustomerQuantity = (product.withCustomerQuantity || 0) + change;
      }

      await product.save();
    } catch (error) {
      console.error('Error updating with customer quantity:', error);
      throw error;
    }
  }

  /**
   * Update available quantity
   * @param {ObjectId} productId 
   * @param {ObjectId} variantId 
   * @param {Number} quantity 
   * @param {String} operation 
   */
  async updateAvailableQuantity(productId, variantId, quantity, operation) {
    try {
      const Product = require('../models/Product');

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const change = operation === 'increase' ? quantity : -quantity;

      if (variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.id(variantId);
        if (variant) {
          variant.quantityOnHand = (variant.quantityOnHand || 0) + change;
        }
      } else {
        product.quantityOnHand = (product.quantityOnHand || 0) + change;
      }

      await product.save();
    } catch (error) {
      console.error('Error updating available quantity:', error);
      throw error;
    }
  }

  /**
   * Get reservation status for an order
   * @param {ObjectId} orderId 
   * @returns {Object} Reservation status
   */
  async getReservationStatus(orderId) {
    try {
      const Order = require('../models/Order');
      const StockMovement = require('../models/StockMovement');

      const order = await Order.findById(orderId).populate('items.productId');
      if (!order) {
        throw new Error('Order not found');
      }

      const movements = await StockMovement.find({ orderId }).sort({ date: -1 });

      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          status: this.getItemStatus(movements, item.productId)
        })),
        movements,
        reservedAt: order.reservationConfirmedAt,
        pickedUpAt: order.pickedUpAt,
        returnedAt: order.returnedAt
      };
    } catch (error) {
      console.error('Error getting reservation status:', error);
      throw error;
    }
  }

  /**
   * Get item status from stock movements
   * @param {Array} movements 
   * @param {ObjectId} productId 
   * @returns {String} Status
   */
  getItemStatus(movements, productId) {
    const productMovements = movements.filter(m => 
      m.productId.toString() === productId.toString()
    );

    if (productMovements.length === 0) {
      return 'pending';
    }

    const latestMovement = productMovements[0];
    
    switch (latestMovement.type) {
      case 'reserved':
        return 'reserved';
      case 'pickup':
        return 'with_customer';
      case 'return':
        return 'returned';
      case 'released':
        return 'cancelled';
      default:
        return 'unknown';
    }
  }

  /**
   * Clean up expired reservations
   * @returns {Object} Cleanup results
   */
  async cleanupExpiredReservations() {
    try {
      const Order = require('../models/Order');

      const expiredOrders = await Order.find({
        status: 'draft',
        createdAt: { $lt: moment().subtract(30, 'minutes').toDate() }
      });

      const results = [];

      for (const order of expiredOrders) {
        const result = await this.releaseReservation(
          order._id,
          'Reservation expired - not confirmed within 30 minutes'
        );
        results.push(result);
      }

      return {
        success: true,
        cleanedUp: results.length,
        results
      };
    } catch (error) {
      console.error('Error cleaning up expired reservations:', error);
      throw error;
    }
  }
}

module.exports = new ReservationService();
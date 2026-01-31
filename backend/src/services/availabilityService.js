/**
 * Availability Service
 * CRITICAL: Handles product availability checking and reservation logic
 * Prevents overbooking by checking overlapping rental periods
 */

const moment = require('moment');

class AvailabilityService {
  /**
   * Check if a product is available for a given date range
   * @param {ObjectId} productId - Product ID
   * @param {Date} startDate - Rental start date
   * @param {Date} endDate - Rental end date
   * @param {ObjectId} variantId - Optional variant ID
   * @param {Number} quantity - Requested quantity
   * @param {ObjectId} excludeOrderId - Order ID to exclude from check (for updates)
   * @returns {Object} { available: boolean, availableQuantity: number, conflicts: [] }
   */
  async checkAvailability(productId, startDate, endDate, variantId = null, quantity = 1, excludeOrderId = null) {
    try {
      // Import models (adjust paths as needed)
      const Product = require('../models/Product');
      const Order = require('../models/Order');

      // Validate dates
      const start = moment(startDate);
      const end = moment(endDate);

      if (!start.isValid() || !end.isValid()) {
        throw new Error('Invalid date format');
      }

      if (end.isSameOrBefore(start)) {
        throw new Error('End date must be after start date');
      }

      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (!product.isRentable) {
        throw new Error('Product is not available for rent');
      }

      // Get total quantity available
      let totalQuantity = product.quantityOnHand;
      
      if (variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v._id.toString() === variantId.toString());
        if (variant) {
          totalQuantity = variant.quantityOnHand;
        }
      }

      // Find all overlapping orders
      const overlappingOrders = await this.findOverlappingOrders(
        productId,
        startDate,
        endDate,
        variantId,
        excludeOrderId
      );

      // Calculate reserved quantity for each day
      const reservedQuantity = this.calculateReservedQuantity(
        overlappingOrders,
        startDate,
        endDate
      );

      // Calculate available quantity
      const availableQuantity = totalQuantity - reservedQuantity;

      // Check if requested quantity is available
      const available = availableQuantity >= quantity;

      return {
        available,
        totalQuantity,
        reservedQuantity,
        availableQuantity,
        requestedQuantity: quantity,
        conflicts: available ? [] : overlappingOrders.map(order => ({
          orderId: order._id,
          orderNumber: order.orderNumber,
          startDate: order.rentalStartDate,
          endDate: order.rentalEndDate,
          quantity: order.items.find(item => 
            item.productId.toString() === productId.toString()
          )?.quantity || 0
        }))
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  /**
   * Find all orders that overlap with the given date range
   * @param {ObjectId} productId 
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @param {ObjectId} variantId 
   * @param {ObjectId} excludeOrderId 
   * @returns {Array} Array of overlapping orders
   */
  async findOverlappingOrders(productId, startDate, endDate, variantId = null, excludeOrderId = null) {
    const Order = require('../models/Order');

    const query = {
      status: { $in: ['confirmed', 'picked_up', 'active'] }, // Only active orders
      'items.productId': productId,
      $or: [
        // Case 1: Existing rental starts during requested period
        {
          'items.startDate': { $gte: startDate, $lt: endDate }
        },
        // Case 2: Existing rental ends during requested period
        {
          'items.endDate': { $gt: startDate, $lte: endDate }
        },
        // Case 3: Existing rental completely encompasses requested period
        {
          'items.startDate': { $lte: startDate },
          'items.endDate': { $gte: endDate }
        }
      ]
    };

    if (variantId) {
      query['items.variantId'] = variantId;
    }

    if (excludeOrderId) {
      query._id = { $ne: excludeOrderId };
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name email')
      .select('orderNumber items rentalStartDate rentalEndDate status');

    return orders;
  }

  /**
   * Calculate maximum reserved quantity for the date range
   * @param {Array} overlappingOrders 
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Number} Maximum reserved quantity
   */
  calculateReservedQuantity(overlappingOrders, startDate, endDate) {
    if (overlappingOrders.length === 0) {
      return 0;
    }

    // Create a map of dates to quantities
    const dateMap = {};
    const start = moment(startDate);
    const end = moment(endDate);

    // Initialize all dates with 0
    let current = start.clone();
    while (current.isSameOrBefore(end)) {
      dateMap[current.format('YYYY-MM-DD')] = 0;
      current.add(1, 'day');
    }

    // Add quantities from overlapping orders
    overlappingOrders.forEach(order => {
      order.items.forEach(item => {
        const itemStart = moment(item.startDate);
        const itemEnd = moment(item.endDate);
        
        let current = itemStart.clone();
        while (current.isSameOrBefore(itemEnd)) {
          const dateKey = current.format('YYYY-MM-DD');
          if (dateMap.hasOwnProperty(dateKey)) {
            dateMap[dateKey] += item.quantity;
          }
          current.add(1, 'day');
        }
      });
    });

    // Return the maximum reserved quantity across all dates
    return Math.max(...Object.values(dateMap));
  }

  /**
   * Get availability calendar for a product
   * @param {ObjectId} productId 
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @param {ObjectId} variantId 
   * @returns {Array} Array of date objects with availability
   */
  async getAvailabilityCalendar(productId, startDate, endDate, variantId = null) {
    try {
      const Product = require('../models/Product');
      
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      let totalQuantity = product.quantityOnHand;
      if (variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v._id.toString() === variantId.toString());
        if (variant) {
          totalQuantity = variant.quantityOnHand;
        }
      }

      const overlappingOrders = await this.findOverlappingOrders(
        productId,
        startDate,
        endDate,
        variantId
      );

      // Build calendar
      const calendar = [];
      const start = moment(startDate);
      const end = moment(endDate);

      let current = start.clone();
      while (current.isSameOrBefore(end)) {
        const dateKey = current.format('YYYY-MM-DD');
        let reservedForDate = 0;

        // Calculate reserved quantity for this specific date
        overlappingOrders.forEach(order => {
          order.items.forEach(item => {
            const itemStart = moment(item.startDate);
            const itemEnd = moment(item.endDate);
            
            if (current.isSameOrAfter(itemStart) && current.isSameOrBefore(itemEnd)) {
              reservedForDate += item.quantity;
            }
          });
        });

        calendar.push({
          date: current.toDate(),
          dateString: dateKey,
          totalQuantity,
          reservedQuantity: reservedForDate,
          availableQuantity: totalQuantity - reservedForDate,
          isAvailable: (totalQuantity - reservedForDate) > 0
        });

        current.add(1, 'day');
      }

      return calendar;
    } catch (error) {
      console.error('Error getting availability calendar:', error);
      throw error;
    }
  }

  /**
   * Check availability for multiple products at once
   * @param {Array} items - Array of { productId, variantId, quantity, startDate, endDate }
   * @returns {Object} { available: boolean, items: [] }
   */
  async checkMultipleAvailability(items) {
    try {
      const results = await Promise.all(
        items.map(item => 
          this.checkAvailability(
            item.productId,
            item.startDate,
            item.endDate,
            item.variantId,
            item.quantity
          )
        )
      );

      const allAvailable = results.every(result => result.available);

      return {
        available: allAvailable,
        items: results.map((result, index) => ({
          ...items[index],
          ...result
        }))
      };
    } catch (error) {
      console.error('Error checking multiple availability:', error);
      throw error;
    }
  }

  /**
   * Reserve product quantity for an order
   * This creates a "soft lock" by creating an order record
   * @param {ObjectId} productId 
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @param {Number} quantity 
   * @param {ObjectId} variantId 
   * @returns {Boolean} Success status
   */
  async reserveProduct(productId, startDate, endDate, quantity, variantId = null) {
    try {
      // Check availability first
      const availability = await this.checkAvailability(
        productId,
        startDate,
        endDate,
        variantId,
        quantity
      );

      if (!availability.available) {
        throw new Error('Product is not available for the requested period');
      }

      // The actual reservation happens when an order is created
      // This method validates that reservation is possible
      return true;
    } catch (error) {
      console.error('Error reserving product:', error);
      throw error;
    }
  }

  /**
   * Release product reservation (when order is cancelled)
   * @param {ObjectId} orderId 
   * @returns {Boolean} Success status
   */
  async releaseReservation(orderId) {
    try {
      const Order = require('../models/Order');
      
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Update order status to cancelled
      order.status = 'cancelled';
      await order.save();

      return true;
    } catch (error) {
      console.error('Error releasing reservation:', error);
      throw error;
    }
  }

  /**
   * Extend rental period (check if extension is possible)
   * @param {ObjectId} orderId 
   * @param {Date} newEndDate 
   * @returns {Object} { possible: boolean, conflicts: [] }
   */
  async checkExtensionPossible(orderId, newEndDate) {
    try {
      const Order = require('../models/Order');
      
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Check availability for each item from current end date to new end date
      const extensionChecks = await Promise.all(
        order.items.map(item => 
          this.checkAvailability(
            item.productId,
            item.endDate,
            newEndDate,
            item.variantId,
            item.quantity,
            orderId // Exclude current order from check
          )
        )
      );

      const allPossible = extensionChecks.every(check => check.available);

      return {
        possible: allPossible,
        items: extensionChecks,
        conflicts: allPossible ? [] : extensionChecks
          .filter(check => !check.available)
          .flatMap(check => check.conflicts)
      };
    } catch (error) {
      console.error('Error checking extension possibility:', error);
      throw error;
    }
  }

  /**
   * Get next available date for a product
   * @param {ObjectId} productId 
   * @param {Number} quantity 
   * @param {Number} rentalDays 
   * @param {ObjectId} variantId 
   * @returns {Object} { available: boolean, startDate: Date, endDate: Date }
   */
  async getNextAvailableDate(productId, quantity = 1, rentalDays = 1, variantId = null) {
    try {
      const today = moment().startOf('day');
      const maxSearchDays = 90; // Search up to 90 days ahead
      
      let currentDate = today.clone();
      const endSearchDate = today.clone().add(maxSearchDays, 'days');

      while (currentDate.isBefore(endSearchDate)) {
        const proposedEndDate = currentDate.clone().add(rentalDays, 'days');
        
        const availability = await this.checkAvailability(
          productId,
          currentDate.toDate(),
          proposedEndDate.toDate(),
          variantId,
          quantity
        );

        if (availability.available) {
          return {
            available: true,
            startDate: currentDate.toDate(),
            endDate: proposedEndDate.toDate()
          };
        }

        currentDate.add(1, 'day');
      }

      return {
        available: false,
        message: `No availability found in the next ${maxSearchDays} days`
      };
    } catch (error) {
      console.error('Error finding next available date:', error);
      throw error;
    }
  }

  /**
   * Get product utilization rate
   * @param {ObjectId} productId 
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Object} { utilizationRate: number, totalDays: number, rentedDays: number }
   */
  async getUtilizationRate(productId, startDate, endDate) {
    try {
      const calendar = await this.getAvailabilityCalendar(productId, startDate, endDate);
      
      const totalDays = calendar.length;
      const rentedDays = calendar.filter(day => day.reservedQuantity > 0).length;
      const utilizationRate = (rentedDays / totalDays) * 100;

      return {
        utilizationRate: parseFloat(utilizationRate.toFixed(2)),
        totalDays,
        rentedDays,
        availableDays: totalDays - rentedDays
      };
    } catch (error) {
      console.error('Error calculating utilization rate:', error);
      throw error;
    }
  }
}

module.exports = new AvailabilityService();
/**
 * Pricing Service
 * Handles rental pricing calculations, discounts, taxes, and fees
 */

const moment = require('moment');

class PricingService {
  constructor() {
    // Default configuration (should be loaded from settings/database)
    this.config = {
      tax: {
        gstRate: 18, // 18% GST (CGST 9% + SGST 9%)
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18 // For inter-state transactions
      },
      lateFees: {
        enabled: true,
        perDayRate: 20, // 20% of daily rental rate per day
        gracePeriodHours: 2 // 2 hours grace period
      },
      securityDeposit: {
        defaultPercentage: 20, // 20% of total rental amount
        minimumAmount: 500,
        maximumAmount: 50000
      },
      discounts: {
        weeklyDiscountPercentage: 10,
        monthlyDiscountPercentage: 20,
        bulkQuantityThreshold: 5,
        bulkDiscountPercentage: 15
      }
    };
  }

  /**
   * Calculate rental price for a product
   * @param {Object} product - Product object with pricing info
   * @param {Date} startDate - Rental start date
   * @param {Date} endDate - Rental end date
   * @param {Number} quantity - Quantity to rent
   * @param {String} rentalPeriod - 'hourly', 'daily', 'weekly', 'custom'
   * @returns {Object} Price breakdown
   */
  calculateRentalPrice(product, startDate, endDate, quantity = 1, rentalPeriod = 'daily') {
    try {
      const start = moment(startDate);
      const end = moment(endDate);

      if (!start.isValid() || !end.isValid()) {
        throw new Error('Invalid dates');
      }

      if (end.isSameOrBefore(start)) {
        throw new Error('End date must be after start date');
      }

      // Calculate duration
      const duration = this.calculateDuration(start, end, rentalPeriod);

      // Get base rate
      const baseRate = this.getBaseRate(product, rentalPeriod);

      if (!baseRate || baseRate <= 0) {
        throw new Error(`No ${rentalPeriod} pricing available for this product`);
      }

      // Calculate base amount
      const baseAmount = baseRate * duration.units * quantity;

      // Apply duration-based discounts
      const durationDiscount = this.calculateDurationDiscount(duration.days, baseAmount);

      // Apply quantity-based discounts
      const quantityDiscount = this.calculateQuantityDiscount(quantity, baseAmount);

      // Total discount
      const totalDiscount = durationDiscount.amount + quantityDiscount.amount;

      // Subtotal after discounts
      const subtotal = baseAmount - totalDiscount;

      // Calculate tax
      const tax = this.calculateTax(subtotal);

      // Total amount
      const total = subtotal + tax.totalTax;

      return {
        baseRate,
        duration: duration.units,
        durationType: rentalPeriod,
        durationInDays: duration.days,
        quantity,
        baseAmount,
        discounts: {
          durationDiscount: durationDiscount.amount,
          durationDiscountPercentage: durationDiscount.percentage,
          quantityDiscount: quantityDiscount.amount,
          quantityDiscountPercentage: quantityDiscount.percentage,
          totalDiscount
        },
        subtotal,
        tax,
        total,
        breakdown: {
          pricePerUnit: baseRate,
          units: duration.units,
          quantity,
          baseAmount,
          discounts: totalDiscount,
          taxableAmount: subtotal,
          tax: tax.totalTax,
          finalAmount: total
        }
      };
    } catch (error) {
      console.error('Error calculating rental price:', error);
      throw error;
    }
  }

  /**
   * Calculate duration based on rental period type
   * @param {Moment} start 
   * @param {Moment} end 
   * @param {String} rentalPeriod 
   * @returns {Object} { units, days }
   */
  calculateDuration(start, end, rentalPeriod) {
    const days = end.diff(start, 'days');
    const hours = end.diff(start, 'hours');
    const weeks = Math.ceil(days / 7);

    switch (rentalPeriod) {
      case 'hourly':
        return { units: hours, days };
      case 'daily':
        return { units: days || 1, days: days || 1 }; // Minimum 1 day
      case 'weekly':
        return { units: weeks, days };
      case 'custom':
        return { units: days || 1, days: days || 1 };
      default:
        return { units: days || 1, days: days || 1 };
    }
  }

  /**
   * Get base rental rate for a product
   * @param {Object} product 
   * @param {String} rentalPeriod 
   * @returns {Number} Base rate
   */
  getBaseRate(product, rentalPeriod) {
    if (!product.rentalPricing) {
      return product.salesPrice || 0;
    }

    switch (rentalPeriod) {
      case 'hourly':
        return product.rentalPricing.hourly || 0;
      case 'daily':
        return product.rentalPricing.daily || 0;
      case 'weekly':
        return product.rentalPricing.weekly || 0;
      case 'custom':
        return product.rentalPricing.daily || 0;
      default:
        return product.rentalPricing.daily || 0;
    }
  }

  /**
   * Calculate duration-based discount
   * @param {Number} days 
   * @param {Number} baseAmount 
   * @returns {Object} { amount, percentage }
   */
  calculateDurationDiscount(days, baseAmount) {
    let percentage = 0;

    if (days >= 30) {
      // Monthly discount
      percentage = this.config.discounts.monthlyDiscountPercentage;
    } else if (days >= 7) {
      // Weekly discount
      percentage = this.config.discounts.weeklyDiscountPercentage;
    }

    const amount = (baseAmount * percentage) / 100;

    return {
      amount: parseFloat(amount.toFixed(2)),
      percentage
    };
  }

  /**
   * Calculate quantity-based discount
   * @param {Number} quantity 
   * @param {Number} baseAmount 
   * @returns {Object} { amount, percentage }
   */
  calculateQuantityDiscount(quantity, baseAmount) {
    let percentage = 0;

    if (quantity >= this.config.discounts.bulkQuantityThreshold) {
      percentage = this.config.discounts.bulkDiscountPercentage;
    }

    const amount = (baseAmount * percentage) / 100;

    return {
      amount: parseFloat(amount.toFixed(2)),
      percentage
    };
  }

  /**
   * Calculate GST tax
   * @param {Number} amount 
   * @param {Boolean} isInterState 
   * @returns {Object} Tax breakdown
   */
  calculateTax(amount, isInterState = false) {
    if (isInterState) {
      // IGST (Inter-state)
      const igst = (amount * this.config.tax.igstRate) / 100;
      return {
        igst: parseFloat(igst.toFixed(2)),
        totalTax: parseFloat(igst.toFixed(2)),
        taxRate: this.config.tax.igstRate,
        breakdown: {
          igst: parseFloat(igst.toFixed(2))
        }
      };
    } else {
      // CGST + SGST (Intra-state)
      const cgst = (amount * this.config.tax.cgstRate) / 100;
      const sgst = (amount * this.config.tax.sgstRate) / 100;
      const total = cgst + sgst;

      return {
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        totalTax: parseFloat(total.toFixed(2)),
        taxRate: this.config.tax.gstRate,
        breakdown: {
          cgst: parseFloat(cgst.toFixed(2)),
          sgst: parseFloat(sgst.toFixed(2))
        }
      };
    }
  }

  /**
   * Calculate late return fee
   * @param {Date} expectedReturnDate 
   * @param {Date} actualReturnDate 
   * @param {Number} dailyRate 
   * @returns {Object} Late fee details
   */
  calculateLateFee(expectedReturnDate, actualReturnDate, dailyRate) {
    try {
      const expected = moment(expectedReturnDate);
      const actual = moment(actualReturnDate);

      // Add grace period
      const graceEnd = expected.clone().add(this.config.lateFees.gracePeriodHours, 'hours');

      if (actual.isSameOrBefore(graceEnd)) {
        return {
          lateDays: 0,
          lateHours: 0,
          lateFee: 0,
          dailyRate,
          message: 'Returned within grace period'
        };
      }

      const lateDays = Math.ceil(actual.diff(graceEnd, 'hours') / 24);
      const lateHours = actual.diff(graceEnd, 'hours');

      // Calculate late fee (percentage of daily rate per day)
      const lateFeePerDay = (dailyRate * this.config.lateFees.perDayRate) / 100;
      const totalLateFee = lateFeePerDay * lateDays;

      return {
        lateDays,
        lateHours,
        lateFee: parseFloat(totalLateFee.toFixed(2)),
        lateFeePerDay: parseFloat(lateFeePerDay.toFixed(2)),
        dailyRate,
        gracePeriodHours: this.config.lateFees.gracePeriodHours
      };
    } catch (error) {
      console.error('Error calculating late fee:', error);
      throw error;
    }
  }

  /**
   * Calculate security deposit
   * @param {Number} totalRentalAmount 
   * @param {Number} customPercentage - Optional custom percentage
   * @returns {Object} Security deposit details
   */
  calculateSecurityDeposit(totalRentalAmount, customPercentage = null) {
    const percentage = customPercentage || this.config.securityDeposit.defaultPercentage;
    let deposit = (totalRentalAmount * percentage) / 100;

    // Apply min/max limits
    deposit = Math.max(deposit, this.config.securityDeposit.minimumAmount);
    deposit = Math.min(deposit, this.config.securityDeposit.maximumAmount);

    return {
      amount: parseFloat(deposit.toFixed(2)),
      percentage,
      minimumAmount: this.config.securityDeposit.minimumAmount,
      maximumAmount: this.config.securityDeposit.maximumAmount,
      rentalAmount: totalRentalAmount
    };
  }

  /**
   * Calculate invoice total with additional charges
   * @param {Array} lineItems - Array of rental items
   * @param {Array} additionalCharges - Array of { description, amount }
   * @param {Object} discount - { type: 'percentage'|'fixed', value: number }
   * @param {Boolean} isInterState 
   * @returns {Object} Invoice breakdown
   */
  calculateInvoiceTotal(lineItems, additionalCharges = [], discount = null, isInterState = false) {
    try {
      // Calculate line items total
      const lineItemsSubtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

      // Calculate additional charges total
      const additionalChargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);

      // Subtotal before discount
      const subtotalBeforeDiscount = lineItemsSubtotal + additionalChargesTotal;

      // Apply discount
      let discountAmount = 0;
      if (discount) {
        if (discount.type === 'percentage') {
          discountAmount = (subtotalBeforeDiscount * discount.value) / 100;
        } else if (discount.type === 'fixed') {
          discountAmount = discount.value;
        }
      }

      // Taxable amount
      const taxableAmount = subtotalBeforeDiscount - discountAmount;

      // Calculate tax
      const tax = this.calculateTax(taxableAmount, isInterState);

      // Grand total
      const grandTotal = taxableAmount + tax.totalTax;

      return {
        lineItems,
        lineItemsSubtotal: parseFloat(lineItemsSubtotal.toFixed(2)),
        additionalCharges,
        additionalChargesTotal: parseFloat(additionalChargesTotal.toFixed(2)),
        subtotalBeforeDiscount: parseFloat(subtotalBeforeDiscount.toFixed(2)),
        discount: {
          type: discount?.type || null,
          value: discount?.value || 0,
          amount: parseFloat(discountAmount.toFixed(2))
        },
        taxableAmount: parseFloat(taxableAmount.toFixed(2)),
        tax,
        grandTotal: parseFloat(grandTotal.toFixed(2))
      };
    } catch (error) {
      console.error('Error calculating invoice total:', error);
      throw error;
    }
  }

  /**
   * Calculate refund amount
   * @param {Number} paidAmount 
   * @param {Number} usedAmount 
   * @param {Number} damageFee 
   * @param {Number} lateFee 
   * @returns {Object} Refund details
   */
  calculateRefund(paidAmount, usedAmount, damageFee = 0, lateFee = 0) {
    const deductions = usedAmount + damageFee + lateFee;
    const refundAmount = Math.max(0, paidAmount - deductions);

    return {
      paidAmount: parseFloat(paidAmount.toFixed(2)),
      usedAmount: parseFloat(usedAmount.toFixed(2)),
      damageFee: parseFloat(damageFee.toFixed(2)),
      lateFee: parseFloat(lateFee.toFixed(2)),
      totalDeductions: parseFloat(deductions.toFixed(2)),
      refundAmount: parseFloat(refundAmount.toFixed(2))
    };
  }

  /**
   * Apply coupon code discount
   * @param {Object} coupon - Coupon object
   * @param {Number} amount 
   * @returns {Object} Discount details
   */
  applyCoupon(coupon, amount) {
    try {
      // Validate coupon
      const now = new Date();
      if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
        throw new Error('Coupon has expired');
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new Error('Coupon usage limit reached');
      }

      if (coupon.minimumOrderAmount && amount < coupon.minimumOrderAmount) {
        throw new Error(`Minimum order amount of ₹${coupon.minimumOrderAmount} required`);
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (amount * coupon.discountValue) / 100;
        if (coupon.maximumDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
        }
      } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue;
      }

      return {
        couponCode: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat((amount - discountAmount).toFixed(2))
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }

  /**
   * Calculate rental extension price
   * @param {Object} originalOrder 
   * @param {Date} newEndDate 
   * @returns {Object} Extension price details
   */
  calculateExtensionPrice(originalOrder, newEndDate) {
    try {
      const currentEndDate = moment(originalOrder.rentalEndDate);
      const extensionEndDate = moment(newEndDate);

      if (extensionEndDate.isSameOrBefore(currentEndDate)) {
        throw new Error('New end date must be after current end date');
      }

      const extensionDays = extensionEndDate.diff(currentEndDate, 'days');

      // Calculate price for each item
      const extensionItems = originalOrder.items.map(item => {
        const dailyRate = item.unitPrice; // Assuming unit price is daily rate
        const extensionAmount = dailyRate * extensionDays * item.quantity;

        return {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          dailyRate,
          extensionDays,
          extensionAmount: parseFloat(extensionAmount.toFixed(2))
        };
      });

      const subtotal = extensionItems.reduce((sum, item) => sum + item.extensionAmount, 0);
      const tax = this.calculateTax(subtotal);
      const total = subtotal + tax.totalTax;

      return {
        extensionDays,
        currentEndDate: currentEndDate.toDate(),
        newEndDate: extensionEndDate.toDate(),
        items: extensionItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax,
        total: parseFloat(total.toFixed(2))
      };
    } catch (error) {
      console.error('Error calculating extension price:', error);
      throw error;
    }
  }

  /**
   * Update pricing configuration
   * @param {Object} newConfig 
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current pricing configuration
   * @returns {Object} Current config
   */
  getConfig() {
    return { ...this.config };
  }
}

module.exports = new PricingService();
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for cart/quotation management
 * Handles rental cart items, quotations, and order creation
 */
const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quotation, setQuotation] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Add item to cart with rental details
   * @param {Object} product - Product to add
   * @param {number} quantity - Quantity to rent
   * @param {Date} startDate - Rental start date
   * @param {Date} endDate - Rental end date
   * @param {string} rentalPeriod - 'hour' | 'day' | 'week' | 'custom'
   */
  const addToCart = useCallback((product, quantity, startDate, endDate, rentalPeriod) => {
    setError(null);

    try {
      // Validate rental dates
      if (!startDate || !endDate) {
        throw new Error('Start and end dates are required');
      }

      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error('End date must be after start date');
      }

      // Calculate rental duration and price
      const duration = calculateDuration(startDate, endDate, rentalPeriod);
      const rentalPrice = calculateRentalPrice(product, duration, rentalPeriod);

      const cartItem = {
        id: `${product.id}_${Date.now()}`, // Unique cart item ID
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        quantity,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        rentalPeriod,
        duration,
        pricePerUnit: rentalPrice,
        totalPrice: rentalPrice * quantity,
        variantId: product.variantId || null,
        attributes: product.attributes || {},
      };

      setCartItems(prev => [...prev, cartItem]);
      return { success: true, item: cartItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID to remove
   */
  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  /**
   * Update cart item quantity
   * @param {string} itemId - Cart item ID
   * @param {number} newQuantity - New quantity
   */
  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.pricePerUnit * newQuantity,
        };
      }
      return item;
    }));
  }, [removeFromCart]);

  /**
   * Update rental dates for a cart item
   * @param {string} itemId - Cart item ID
   * @param {Date} startDate - New start date
   * @param {Date} endDate - New end date
   */
  const updateRentalDates = useCallback((itemId, startDate, endDate) => {
    setError(null);

    try {
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error('End date must be after start date');
      }

      setCartItems(prev => prev.map(item => {
        if (item.id === itemId) {
          const duration = calculateDuration(startDate, endDate, item.rentalPeriod);
          const pricePerUnit = duration * item.pricePerUnit / item.duration;

          return {
            ...item,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            duration,
            pricePerUnit,
            totalPrice: pricePerUnit * item.quantity,
          };
        }
        return item;
      }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cart');
  }, []);

  /**
   * Create quotation from cart
   */
  const createQuotation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          items: cartItems,
          total: getCartTotal(),
          subtotal: getCartSubtotal(),
          tax: getCartTax(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create quotation');
      }

      setQuotation(data.quotation);
      return { success: true, quotation: data.quotation };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  /**
   * Confirm quotation and create rental order
   * @param {string} quotationId - Quotation ID to confirm
   * @param {Object} paymentDetails - Payment information
   */
  const confirmQuotation = useCallback(async (quotationId, paymentDetails) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotations/${quotationId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(paymentDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm quotation');
      }

      // Clear cart after successful order creation
      clearCart();
      setQuotation(null);

      return { success: true, order: data.order };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [clearCart]);

  /**
   * Apply coupon code
   * @param {string} couponCode - Coupon code to apply
   */
  const applyCoupon = useCallback(async (couponCode) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: getCartTotal(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid coupon code');
      }

      return { success: true, discount: data.discount };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get cart subtotal (before tax)
   */
  const getCartSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  }, [cartItems]);

  /**
   * Get cart tax amount (assuming 18% GST)
   */
  const getCartTax = useCallback(() => {
    const subtotal = getCartSubtotal();
    return subtotal * 0.18; // 18% GST
  }, [getCartSubtotal]);

  /**
   * Get cart total (including tax)
   */
  const getCartTotal = useCallback(() => {
    return getCartSubtotal() + getCartTax();
  }, [getCartSubtotal, getCartTax]);

  /**
   * Get total number of items in cart
   */
  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  /**
   * Check if product is available for rental dates
   * @param {number} productId - Product ID
   * @param {Date} startDate - Rental start date
   * @param {Date} endDate - Rental end date
   * @param {number} quantity - Quantity needed
   */
  const checkAvailability = useCallback(async (productId, startDate, endDate, quantity) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/products/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check availability');
      }

      return { success: true, available: data.available, availableQuantity: data.availableQuantity };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cartItems,
    loading,
    error,
    quotation,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateRentalDates,
    clearCart,
    createQuotation,
    confirmQuotation,
    applyCoupon,
    getCartSubtotal,
    getCartTax,
    getCartTotal,
    getCartCount,
    checkAvailability,
  };
};

/**
 * Helper function to calculate rental duration
 */
const calculateDuration = (startDate, endDate, rentalPeriod) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;

  switch (rentalPeriod) {
    case 'hour':
      return Math.ceil(diffMs / (1000 * 60 * 60));
    case 'day':
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    case 'week':
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
    default:
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // Default to days
  }
};

/**
 * Helper function to calculate rental price based on product and duration
 */
const calculateRentalPrice = (product, duration, rentalPeriod) => {
  const pricing = product.rentalPricing || {};
  
  switch (rentalPeriod) {
    case 'hour':
      return (pricing.hourly || 0) * duration;
    case 'day':
      return (pricing.daily || 0) * duration;
    case 'week':
      return (pricing.weekly || 0) * duration;
    default:
      return (pricing.daily || 0) * duration;
  }
};

export default useCart;
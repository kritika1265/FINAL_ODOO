import React, { createContext, useContext } from 'react';
import useCartState from '../hooks/useCart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const cartState = useCartState();
  return <CartContext.Provider value={cartState}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

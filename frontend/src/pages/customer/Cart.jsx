import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Canon EOS R6 Mark II',
      image: '📷',
      price: 1500,
      quantity: 1,
      period: 'day',
      days: 3,
      startDate: '2024-02-01',
      endDate: '2024-02-04',
    },
    {
      id: 2,
      name: 'MacBook Pro 16" M3',
      image: '💻',
      price: 1200,
      quantity: 1,
      period: 'day',
      days: 5,
      startDate: '2024-02-01',
      endDate: '2024-02-06',
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.days * item.quantity), 0);
  const securityDeposit = 50000;
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start adding items to rent</p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-5xl flex-shrink-0">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <Link to={`/products/${item.id}`} className="text-xl font-bold text-gray-900 hover:text-amber-600 mb-2 block">
                        {item.name}
                      </Link>
                      <div className="text-sm text-gray-600 mb-4">
                        <div>Period: {item.days} {item.period}s</div>
                        <div>{item.startDate} to {item.endDate}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-amber-500 transition-colors flex items-center justify-center font-bold"
                          >
                            −
                          </button>
                          <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-amber-500 transition-colors flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">₹{(item.price * item.days * item.quantity).toLocaleString()}</div>
                          <div className="text-sm text-gray-500">₹{item.price}/{item.period}</div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (GST 18%)</span>
                    <span className="font-semibold">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 pb-4 border-b border-gray-200">
                    <span>Security Deposit</span>
                    <span className="font-semibold">₹{securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full py-4 text-center bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 mb-4"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/products"
                  className="block w-full py-4 text-center border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-amber-500 hover:text-amber-600 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default Cart;

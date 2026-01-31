import React from 'react';
import { ShoppingBag, Tag, AlertCircle } from 'lucide-react';

const CartSummary = ({
  items = [],
  subtotal,
  tax,
  discount = 0,
  total,
  onCheckout,
  couponCode = '',
  onCouponChange,
  onApplyCoupon,
  couponError = '',
  isProcessing = false
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const hasIncompleteDates = items.some(item => 
    item.duration === 'daily' && (!item.startDate || !item.endDate)
  );

  return (
    <div className="cart-summary">
      <div className="summary-header">
        <ShoppingBag size={24} />
        <h2>Order Summary</h2>
      </div>

      <div className="summary-content">
        {/* Item Count */}
        <div className="summary-row">
          <span className="label">Items ({items.length})</span>
          <span className="value">{formatPrice(subtotal)}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="summary-row discount">
            <span className="label">
              <Tag size={14} />
              Discount
            </span>
            <span className="value">-{formatPrice(discount)}</span>
          </div>
        )}

        {/* Tax */}
        <div className="summary-row">
          <span className="label">GST (18%)</span>
          <span className="value">{formatPrice(tax)}</span>
        </div>

        <div className="summary-divider"></div>

        {/* Total */}
        <div className="summary-row total">
          <span className="label">Total</span>
          <span className="value">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="coupon-section">
        <label className="coupon-label">Have a coupon code?</label>
        <div className="coupon-input-group">
          <input
            type="text"
            placeholder="Enter code"
            value={couponCode}
            onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
            className={`coupon-input ${couponError ? 'error' : ''}`}
          />
          <button 
            className="apply-btn"
            onClick={onApplyCoupon}
            disabled={!couponCode.trim()}
          >
            Apply
          </button>
        </div>
        {couponError && (
          <div className="coupon-error">
            <AlertCircle size={14} />
            {couponError}
          </div>
        )}
      </div>

      {/* Warning for incomplete dates */}
      {hasIncompleteDates && (
        <div className="warning-box">
          <AlertCircle size={16} />
          <span>Please select rental dates for all daily rental items</span>
        </div>
      )}

      {/* Checkout Button */}
      <button 
        className="checkout-btn"
        onClick={onCheckout}
        disabled={hasIncompleteDates || isProcessing || items.length === 0}
      >
        {isProcessing ? (
          <>
            <div className="spinner"></div>
            Processing...
          </>
        ) : (
          <>
            Proceed to Checkout
          </>
        )}
      </button>

      {/* Additional Info */}
      <div className="info-section">
        <div className="info-item">
          <span className="icon">🔒</span>
          <span className="text">Secure checkout</span>
        </div>
        <div className="info-item">
          <span className="icon">↩️</span>
          <span className="text">Easy returns</span>
        </div>
        <div className="info-item">
          <span className="icon">📞</span>
          <span className="text">24/7 support</span>
        </div>
      </div>

      <style jsx>{`
        .cart-summary {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 2rem;
          position: sticky;
          top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .summary-header svg {
          color: #3b82f6;
        }

        .summary-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(255, 255, 255, 0.85);
        }

        .summary-row.discount {
          color: #10b981;
        }

        .summary-row.discount .label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .summary-row.total {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .summary-row.total .value {
          color: #3b82f6;
          font-size: 1.75rem;
        }

        .label {
          font-size: 0.95rem;
        }

        .value {
          font-weight: 600;
        }

        .summary-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          margin: 0.5rem 0;
        }

        .coupon-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .coupon-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .coupon-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .coupon-input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.95rem;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        .coupon-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #3b82f6;
        }

        .coupon-input.error {
          border-color: #ef4444;
        }

        .coupon-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
          text-transform: none;
        }

        .apply-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 0.5rem;
          color: #3b82f6;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .apply-btn:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
        }

        .apply-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .coupon-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 0.375rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .warning-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 0.5rem;
          color: #fbbf24;
          font-size: 0.875rem;
          animation: pulse 2s infinite;
        }

        .checkout-btn {
          width: 100%;
          padding: 1.25rem 2rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .checkout-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 6px 30px rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        .checkout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .info-item .icon {
          font-size: 1.25rem;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1024px) {
          .cart-summary {
            position: static;
          }
        }
      `}</style>
    </div>
  );
};

export default CartSummary;

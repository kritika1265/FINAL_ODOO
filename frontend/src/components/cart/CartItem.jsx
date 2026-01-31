import React from 'react';
import { Trash2, Calendar, Clock, Plus, Minus } from 'lucide-react';

const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
  onDateChange
}) => {
  const {
    id,
    product,
    quantity,
    duration, // 'hourly', 'daily', 'weekly'
    startDate,
    endDate,
    price
  } = item;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'Not selected';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getDurationLabel = () => {
    switch (duration) {
      case 'hourly': return 'Per Hour';
      case 'daily': return 'Per Day';
      case 'weekly': return 'Per Week';
      default: return '';
    }
  };

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalDays = calculateTotalDays();
  const itemTotal = price * quantity * (duration === 'daily' ? totalDays : 1);

  return (
    <div className="cart-item">
      <div className="item-image">
        <img src={product.image || '/api/placeholder/150/150'} alt={product.name} />
      </div>

      <div className="item-details">
        <h3 className="item-name">{product.name}</h3>
        {product.category && (
          <span className="item-category">{product.category}</span>
        )}

        <div className="rental-info">
          <div className="info-row">
            <Clock size={14} />
            <span>Duration: {getDurationLabel()}</span>
          </div>
          
          {duration === 'daily' && (
            <div className="date-info">
              <div className="info-row">
                <Calendar size={14} />
                <span>From: {formatDate(startDate)}</span>
              </div>
              <div className="info-row">
                <Calendar size={14} />
                <span>To: {formatDate(endDate)}</span>
              </div>
              {totalDays > 0 && (
                <div className="days-count">
                  Total: {totalDays} day{totalDays !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {(!startDate || !endDate) && duration === 'daily' && (
            <button 
              className="select-dates-btn"
              onClick={() => onDateChange(item)}
            >
              <Calendar size={16} />
              Select Rental Dates
            </button>
          )}
        </div>
      </div>

      <div className="item-actions">
        <div className="price-section">
          <span className="price-label">Unit Price</span>
          <span className="unit-price">{formatPrice(price)}</span>
        </div>

        <div className="quantity-control">
          <span className="quantity-label">Quantity</span>
          <div className="quantity-buttons">
            <button
              className="qty-btn"
              onClick={() => onQuantityChange(id, Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="quantity-value">{quantity}</span>
            <button
              className="qty-btn"
              onClick={() => onQuantityChange(id, quantity + 1)}
              disabled={quantity >= product.quantityAvailable}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="total-section">
          <span className="total-label">Total</span>
          <span className="total-price">{formatPrice(itemTotal)}</span>
        </div>

        <button 
          className="remove-btn"
          onClick={() => onRemove(id)}
          title="Remove from cart"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <style jsx>{`
        .cart-item {
          display: grid;
          grid-template-columns: 150px 1fr auto;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          animation: fadeIn 0.3s ease;
        }

        .cart-item:hover {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(30, 41, 59, 0.7);
        }

        .item-image {
          width: 150px;
          height: 150px;
          border-radius: 0.5rem;
          overflow: hidden;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .item-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .item-category {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 0.375rem;
          color: #3b82f6;
          font-size: 0.75rem;
          font-weight: 600;
          width: fit-content;
        }

        .rental-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .info-row svg {
          color: #3b82f6;
        }

        .date-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 0.5rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .days-count {
          color: #3b82f6;
          font-weight: 600;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .select-dates-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 0.5rem;
          color: #ef4444;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          width: fit-content;
        }

        .select-dates-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
        }

        .item-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-end;
          min-width: 200px;
        }

        .price-section,
        .total-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .price-label,
        .total-label,
        .quantity-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .unit-price {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1rem;
          font-weight: 600;
        }

        .total-price {
          color: #3b82f6;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .quantity-control {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .quantity-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 0.25rem;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          border-radius: 0.375rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .qty-btn:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
        }

        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .quantity-value {
          min-width: 40px;
          text-align: center;
          color: white;
          font-weight: 600;
        }

        .remove-btn {
          padding: 0.625rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 0.5rem;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
          transform: scale(1.1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          .cart-item {
            grid-template-columns: 120px 1fr;
          }

          .item-image {
            width: 120px;
            height: 120px;
          }

          .item-actions {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .cart-item {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .item-image {
            width: 100%;
            height: 200px;
          }

          .item-actions {
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .quantity-control {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default CartItem;

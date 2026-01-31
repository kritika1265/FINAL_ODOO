import React from 'react';
import { 
  Calendar, Package, DollarSign, Eye, 
  Download, ArrowRight, Clock 
} from 'lucide-react';

const OrderCard = ({
  order,
  onViewDetails,
  onDownloadInvoice
}) => {
  const {
    id,
    orderNumber,
    date,
    status,
    items,
    total,
    pickupDate,
    returnDate,
    paymentStatus
  } = order;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6b7280',
      confirmed: '#3b82f6',
      'in-progress': '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444',
      returned: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      confirmed: 'Confirmed',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      returned: 'Returned'
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      partial: '#3b82f6',
      paid: '#10b981',
      failed: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-info">
          <h3 className="order-number">#{orderNumber}</h3>
          <span className="order-date">{formatDate(date)}</span>
        </div>

        <div className="status-badges">
          <span 
            className="status-badge"
            style={{ '--status-color': getStatusColor(status) }}
          >
            {getStatusLabel(status)}
          </span>
          <span 
            className="payment-badge"
            style={{ '--payment-color': getPaymentStatusColor(paymentStatus) }}
          >
            {paymentStatus}
          </span>
        </div>
      </div>

      <div className="order-content">
        {/* Items Preview */}
        <div className="items-preview">
          <Package size={18} className="section-icon" />
          <div className="items-list">
            {items.slice(0, 2).map((item, index) => (
              <div key={index} className="item-preview">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">×{item.quantity}</span>
              </div>
            ))}
            {items.length > 2 && (
              <span className="more-items">+{items.length - 2} more</span>
            )}
          </div>
        </div>

        {/* Rental Period */}
        {pickupDate && returnDate && (
          <div className="rental-period">
            <Calendar size={18} className="section-icon" />
            <div className="period-info">
              <div className="period-row">
                <span className="period-label">Pickup:</span>
                <span className="period-date">{formatDate(pickupDate)}</span>
              </div>
              <div className="period-row">
                <span className="period-label">Return:</span>
                <span className="period-date">{formatDate(returnDate)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="order-total">
          <DollarSign size={18} className="section-icon" />
          <div className="total-info">
            <span className="total-label">Total Amount</span>
            <span className="total-amount">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="order-actions">
        <button 
          className="action-btn secondary"
          onClick={() => onViewDetails(order)}
        >
          <Eye size={18} />
          View Details
        </button>
        
        {paymentStatus === 'paid' && (
          <button 
            className="action-btn primary"
            onClick={() => onDownloadInvoice(order)}
          >
            <Download size={18} />
            Invoice
          </button>
        )}
      </div>

      <style jsx>{`
        .order-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
          animation: fadeIn 0.4s ease;
        }

        .order-card:hover {
          border-color: rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .order-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .order-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .order-date {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
        }

        .status-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .status-badge,
        .payment-badge {
          padding: 0.375rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge {
          background: color-mix(in srgb, var(--status-color) 20%, transparent);
          border: 1px solid color-mix(in srgb, var(--status-color) 40%, transparent);
          color: var(--status-color);
        }

        .payment-badge {
          background: color-mix(in srgb, var(--payment-color) 20%, transparent);
          border: 1px solid color-mix(in srgb, var(--payment-color) 40%, transparent);
          color: var(--payment-color);
        }

        .order-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .items-preview,
        .rental-period,
        .order-total {
          display: flex;
          gap: 1rem;
        }

        .section-icon {
          color: #3b82f6;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .items-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .item-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.9rem;
        }

        .item-name {
          flex: 1;
        }

        .item-qty {
          color: rgba(255, 255, 255, 0.5);
          font-weight: 600;
        }

        .more-items {
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .period-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .period-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .period-label {
          color: rgba(255, 255, 255, 0.6);
        }

        .period-date {
          color: rgba(255, 255, 255, 0.85);
          font-weight: 600;
        }

        .total-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .total-amount {
          color: #3b82f6;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .order-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .action-btn.primary:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .order-header {
            flex-direction: column;
            gap: 1rem;
          }

          .status-badges {
            justify-content: flex-start;
          }

          .order-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderCard;

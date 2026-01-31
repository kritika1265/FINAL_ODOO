import React from 'react';
import { 
  X, Package, Calendar, MapPin, CreditCard, 
  Truck, FileText, Download, CheckCircle 
} from 'lucide-react';

const OrderDetails = ({
  order,
  onClose,
  onDownloadInvoice
}) => {
  const {
    orderNumber,
    date,
    status,
    items,
    subtotal,
    tax,
    discount,
    total,
    pickupDate,
    returnDate,
    deliveryAddress,
    paymentStatus,
    paymentMethod,
    invoiceNumber,
    gstNumber
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="order-details-modal">
      <div className="modal-overlay" onClick={onClose} />
      
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div className="header-info">
            <h2>Order Details</h2>
            <span className="order-num">#{orderNumber}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {/* Order Info Section */}
          <div className="info-section">
            <div className="section-header">
              <FileText size={20} />
              <h3>Order Information</h3>
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Order Date</span>
                <span className="info-value">{formatDate(date)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value status-value">{status}</span>
              </div>
              {invoiceNumber && (
                <div className="info-item">
                  <span className="info-label">Invoice Number</span>
                  <span className="info-value">{invoiceNumber}</span>
                </div>
              )}
              {gstNumber && (
                <div className="info-item">
                  <span className="info-label">GST Number</span>
                  <span className="info-value">{gstNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rental Period */}
          {pickupDate && returnDate && (
            <div className="info-section">
              <div className="section-header">
                <Calendar size={20} />
                <h3>Rental Period</h3>
              </div>
              
              <div className="rental-timeline">
                <div className="timeline-item">
                  <div className="timeline-icon pickup">
                    <Truck size={16} />
                  </div>
                  <div className="timeline-content">
                    <span className="timeline-label">Pickup Date</span>
                    <span className="timeline-date">{formatDate(pickupDate)}</span>
                  </div>
                </div>
                
                <div className="timeline-connector"></div>
                
                <div className="timeline-item">
                  <div className="timeline-icon return">
                    <CheckCircle size={16} />
                  </div>
                  <div className="timeline-content">
                    <span className="timeline-label">Return Date</span>
                    <span className="timeline-date">{formatDate(returnDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {deliveryAddress && (
            <div className="info-section">
              <div className="section-header">
                <MapPin size={20} />
                <h3>Delivery Address</h3>
              </div>
              <div className="address-box">
                <p className="address-name">{deliveryAddress.name}</p>
                <p className="address-line">{deliveryAddress.street}</p>
                <p className="address-line">
                  {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}
                </p>
                {deliveryAddress.phone && (
                  <p className="address-phone">Phone: {deliveryAddress.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="info-section">
            <div className="section-header">
              <Package size={20} />
              <h3>Items ({items.length})</h3>
            </div>
            
            <div className="items-list">
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-image">
                    <img src={item.image || '/api/placeholder/80/80'} alt={item.name} />
                  </div>
                  <div className="item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-details">
                      {item.duration} rental • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="item-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="info-section">
            <div className="section-header">
              <CreditCard size={20} />
              <h3>Payment Summary</h3>
            </div>
            
            <div className="payment-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              
              <div className="summary-row">
                <span>GST (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              <div className="payment-status">
                <span>Payment Status:</span>
                <span className={`status-badge ${paymentStatus}`}>
                  {paymentStatus}
                </span>
              </div>
              
              {paymentMethod && (
                <div className="payment-method">
                  Payment Method: {paymentMethod}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {paymentStatus === 'paid' && (
            <button className="btn-primary" onClick={() => onDownloadInvoice(order)}>
              <Download size={18} />
              Download Invoice
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .order-details-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          position: relative;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 1rem;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .header-info h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .order-num {
          color: #3b82f6;
          font-size: 1rem;
          font-weight: 600;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #ef4444;
          transform: rotate(90deg);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-header svg {
          color: #3b82f6;
        }

        .section-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .info-value {
          color: white;
          font-weight: 600;
        }

        .status-value {
          text-transform: capitalize;
          color: #3b82f6;
        }

        .rental-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
        }

        .timeline-icon {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .timeline-icon.pickup {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        .timeline-icon.return {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .timeline-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .timeline-date {
          color: white;
          font-weight: 600;
        }

        .timeline-connector {
          width: 2px;
          height: 20px;
          background: linear-gradient(180deg, #3b82f6, #10b981);
          margin-left: 19px;
        }

        .address-box {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .address-box p {
          margin: 0.375rem 0;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.5;
        }

        .address-name {
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem !important;
        }

        .address-phone {
          color: #3b82f6;
          margin-top: 0.5rem !important;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .item-row {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .item-image {
          width: 80px;
          height: 80px;
          border-radius: 0.5rem;
          overflow: hidden;
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .item-name {
          font-size: 1rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .item-details {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          margin: 0;
        }

        .item-price {
          color: #3b82f6;
          font-weight: 700;
          font-size: 1.125rem;
          display: flex;
          align-items: center;
        }

        .payment-summary {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.95rem;
        }

        .summary-row.discount {
          color: #10b981;
        }

        .summary-row.total {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .summary-row.total span:last-child {
          color: #3b82f6;
        }

        .summary-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
        }

        .payment-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .status-badge {
          padding: 0.375rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-badge.paid {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .status-badge.pending {
          background: rgba(251, 191, 36, 0.2);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
        }

        .status-badge.partial {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        .payment-method {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary,
        .btn-primary {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .modal-content {
            max-height: 95vh;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding: 1.5rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .item-row {
            flex-direction: column;
            text-align: center;
          }

          .item-image {
            width: 100%;
            height: 200px;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;

import React from 'react';
import { Clock, DollarSign, Package, Star } from 'lucide-react';

const ProductCard = ({
  product,
  onViewDetails,
  onAddToCart,
  variant = 'grid' // 'grid' or 'list'
}) => {
  const {
    id,
    name,
    image,
    description,
    hourlyRate,
    dailyRate,
    weeklyRate,
    quantityAvailable,
    rating = 0,
    reviewCount = 0,
    category,
    isAvailable = true
  } = product;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderGridCard = () => (
    <div className={`product-card ${!isAvailable ? 'unavailable' : ''}`}>
      {/* Image */}
      <div className="product-image-container">
        <img 
          src={image || '/api/placeholder/400/300'} 
          alt={name}
          className="product-image"
        />
        {!isAvailable && (
          <div className="unavailable-badge">Not Available</div>
        )}
        {category && (
          <div className="category-badge">{category}</div>
        )}
      </div>

      {/* Content */}
      <div className="product-content">
        <h3 className="product-name">{name}</h3>
        
        {rating > 0 && (
          <div className="product-rating">
            <Star size={14} fill="#fbbf24" color="#fbbf24" />
            <span className="rating-value">{rating.toFixed(1)}</span>
            <span className="review-count">({reviewCount})</span>
          </div>
        )}

        <p className="product-description">{description}</p>

        {/* Pricing */}
        <div className="pricing-section">
          {hourlyRate && (
            <div className="price-item">
              <Clock size={14} />
              <span className="price-label">Hourly:</span>
              <span className="price-value">{formatPrice(hourlyRate)}</span>
            </div>
          )}
          {dailyRate && (
            <div className="price-item featured">
              <DollarSign size={14} />
              <span className="price-label">Daily:</span>
              <span className="price-value">{formatPrice(dailyRate)}</span>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="availability">
          <Package size={14} />
          <span>{quantityAvailable} units available</span>
        </div>

        {/* Actions */}
        <div className="card-actions">
          <button 
            className="btn-view"
            onClick={() => onViewDetails(product)}
          >
            View Details
          </button>
          <button 
            className="btn-add-cart"
            onClick={() => onAddToCart(product)}
            disabled={!isAvailable}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <style jsx>{`
        .product-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .product-card.unavailable {
          opacity: 0.6;
        }

        .product-image-container {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.1);
        }

        .unavailable-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .category-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(59, 130, 246, 0.9);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(8px);
        }

        .product-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .rating-value {
          color: #fbbf24;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .review-count {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
        }

        .product-description {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pricing-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 0.5rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .price-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .price-item.featured {
          color: #3b82f6;
          font-weight: 600;
        }

        .price-label {
          flex-shrink: 0;
        }

        .price-value {
          margin-left: auto;
          font-weight: 700;
          font-size: 1rem;
        }

        .availability {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
        }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: auto;
          padding-top: 1rem;
        }

        .btn-view,
        .btn-add-cart {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-view {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-view:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .btn-add-cart {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-add-cart:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        .btn-add-cart:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );

  return renderGridCard();
};

export default ProductCard;

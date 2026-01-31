import React, { useState } from 'react';
import { 
  Calendar, Clock, Package, Star, DollarSign, 
  ChevronLeft, ChevronRight, Info, CheckCircle 
} from 'lucide-react';

const ProductDetail = ({
  product,
  onAddToCart,
  onBack
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('daily');

  const {
    name,
    images = ['/api/placeholder/800/600'],
    description,
    longDescription,
    hourlyRate,
    dailyRate,
    weeklyRate,
    quantityAvailable,
    rating = 0,
    reviewCount = 0,
    category,
    specifications = [],
    features = [],
    isAvailable = true
  } = product;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const pricingOptions = [
    { id: 'hourly', label: 'Hourly', rate: hourlyRate, icon: Clock },
    { id: 'daily', label: 'Daily', rate: dailyRate, icon: Calendar },
    { id: 'weekly', label: 'Weekly', rate: weeklyRate, icon: Calendar }
  ].filter(option => option.rate);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="product-detail">
      {/* Back Button */}
      <button className="back-button" onClick={onBack}>
        <ChevronLeft size={20} />
        Back to Products
      </button>

      <div className="detail-container">
        {/* Image Gallery */}
        <div className="image-section">
          <div className="main-image-container">
            <img 
              src={images[selectedImage]} 
              alt={`${name} - Image ${selectedImage + 1}`}
              className="main-image"
            />
            
            {images.length > 1 && (
              <>
                <button className="nav-button prev" onClick={prevImage}>
                  <ChevronLeft size={24} />
                </button>
                <button className="nav-button next" onClick={nextImage}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {!isAvailable && (
              <div className="unavailable-overlay">
                <span>Currently Unavailable</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-container">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="info-section">
          {category && <div className="category-tag">{category}</div>}
          
          <h1 className="product-title">{name}</h1>

          {rating > 0 && (
            <div className="rating-section">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
                    color="#fbbf24"
                  />
                ))}
              </div>
              <span className="rating-text">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>
          )}

          <p className="description">{description}</p>
          {longDescription && (
            <p className="long-description">{longDescription}</p>
          )}

          {/* Pricing Options */}
          <div className="pricing-section">
            <h3 className="section-title">Select Rental Duration</h3>
            <div className="pricing-options">
              {pricingOptions.map(option => (
                <div
                  key={option.id}
                  className={`pricing-card ${selectedDuration === option.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDuration(option.id)}
                >
                  <option.icon size={20} className="pricing-icon" />
                  <div className="pricing-info">
                    <span className="pricing-label">{option.label}</span>
                    <span className="pricing-rate">{formatPrice(option.rate)}</span>
                  </div>
                  {selectedDuration === option.id && (
                    <CheckCircle size={20} className="check-icon" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="availability-section">
            <Package size={20} />
            <span>{quantityAvailable} units available</span>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="features-section">
              <h3 className="section-title">Key Features</h3>
              <ul className="features-list">
                {features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <CheckCircle size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {specifications.length > 0 && (
            <div className="specs-section">
              <h3 className="section-title">Specifications</h3>
              <div className="specs-grid">
                {specifications.map((spec, idx) => (
                  <div key={idx} className="spec-item">
                    <span className="spec-label">{spec.label}:</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-section">
            <button 
              className="add-to-cart-btn"
              onClick={() => onAddToCart(product, selectedDuration)}
              disabled={!isAvailable}
            >
              <DollarSign size={20} />
              Add to Cart
            </button>
            
            <div className="info-note">
              <Info size={16} />
              <span>You can select specific rental dates in the cart</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-detail {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 2rem;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(-4px);
        }

        .detail-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          animation: fadeIn 0.5s ease;
        }

        .image-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .main-image-container {
          position: relative;
          width: 100%;
          height: 500px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .nav-button:hover {
          background: rgba(59, 130, 246, 0.8);
          border-color: #3b82f6;
        }

        .nav-button.prev {
          left: 1rem;
        }

        .nav-button.next {
          right: 1rem;
        }

        .unavailable-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .unavailable-overlay span {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .thumbnail-container {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 0.5rem 0;
        }

        .thumbnail {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 0.5rem;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .thumbnail:hover {
          border-color: rgba(59, 130, 246, 0.5);
          transform: scale(1.05);
        }

        .thumbnail.active {
          border-color: #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .category-tag {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 0.5rem;
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 600;
          width: fit-content;
        }

        .product-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin: 0;
          line-height: 1.2;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stars {
          display: flex;
          gap: 0.25rem;
        }

        .rating-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
        }

        .description {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
          margin: 0;
        }

        .long-description {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.7;
          margin: 0;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0 0 1rem 0;
        }

        .pricing-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .pricing-card {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          position: relative;
        }

        .pricing-card:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .pricing-card.selected {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .pricing-icon {
          color: #3b82f6;
        }

        .pricing-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .pricing-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .pricing-rate {
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .check-icon {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          color: #10b981;
        }

        .availability-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 0.75rem;
          color: #10b981;
          font-weight: 500;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.75rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.85);
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
        }

        .feature-item svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .specs-grid {
          display: grid;
          gap: 0.75rem;
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
        }

        .spec-label {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .spec-value {
          color: white;
          font-weight: 600;
        }

        .action-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 1.25rem 2rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 6px 30px rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        .add-to-cart-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .info-note svg {
          color: #3b82f6;
          flex-shrink: 0;
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

        @media (max-width: 1024px) {
          .detail-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .product-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .product-detail {
            padding: 1rem;
          }

          .main-image-container {
            height: 350px;
          }

          .pricing-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;

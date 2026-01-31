import React, { useState } from 'react';
import { Search, SlidersHorizontal, Grid, List as ListIcon } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductList = ({
  products = [],
  onViewDetails,
  onAddToCart,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price-low', 'price-high', 'rating'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.dailyRate || a.hourlyRate || 0) - (b.dailyRate || b.hourlyRate || 0);
        case 'price-high':
          return (b.dailyRate || b.hourlyRate || 0) - (a.dailyRate || a.hourlyRate || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="product-list-container">
      {/* Header with Search and Filters */}
      <div className="list-header">
        <div className="search-section">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={20} />
            Filters
          </button>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={20} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <button 
              className="clear-filters"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('name');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span className="results-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Product Grid/List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={`products-${viewMode}`}>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
              onAddToCart={onAddToCart}
              variant={viewMode}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .product-list-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .list-header {
          margin-bottom: 2rem;
        }

        .search-section {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-bar {
          flex: 1;
          min-width: 300px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-toggle:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.25rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .view-btn {
          padding: 0.625rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .view-btn.active {
          background: rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        .view-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .filter-panel {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          align-items: flex-end;
          animation: slideDown 0.3s ease;
        }

        .filter-group {
          flex: 1;
          min-width: 200px;
        }

        .filter-label {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .filter-select {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #3b82f6;
        }

        .filter-select option {
          background: #1e293b;
          color: white;
        }

        .clear-filters {
          padding: 0.75rem 1.5rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 0.5rem;
          color: #ef4444;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-filters:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
        }

        .results-info {
          margin-bottom: 1.5rem;
        }

        .results-count {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.6);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .product-list-container {
            padding: 1rem;
          }

          .search-section {
            flex-direction: column;
          }

          .search-bar {
            width: 100%;
            min-width: auto;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .filter-panel {
            flex-direction: column;
            align-items: stretch;
          }

          .clear-filters {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductList;

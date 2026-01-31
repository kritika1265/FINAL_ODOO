import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const categories = ['All', 'Electronics', 'Photography', 'Tools & Equipment', 'Furniture', 'Vehicles', 'Party Supplies'];

  const products = [
    {
      id: 1,
      name: 'Canon EOS R6 Mark II',
      category: 'Photography',
      image: '📷',
      price: { hour: 250, day: 1500, week: 8500 },
      rating: 4.9,
      reviews: 127,
      available: true,
      featured: true,
    },
    {
      id: 2,
      name: 'MacBook Pro 16" M3',
      category: 'Electronics',
      image: '💻',
      price: { hour: 180, day: 1200, week: 7000 },
      rating: 4.8,
      reviews: 94,
      available: true,
      featured: true,
    },
    {
      id: 3,
      name: 'DJI Mavic 3 Pro',
      category: 'Photography',
      image: '🎬',
      price: { hour: 300, day: 2000, week: 12000 },
      rating: 5.0,
      reviews: 68,
      available: false,
      featured: true,
    },
    {
      id: 4,
      name: 'Professional Projector 4K',
      category: 'Electronics',
      image: '📽️',
      price: { hour: 150, day: 900, week: 5000 },
      rating: 4.7,
      reviews: 156,
      available: true,
      featured: false,
    },
    {
      id: 5,
      name: 'Power Drill Pro',
      category: 'Tools & Equipment',
      image: '🔧',
      price: { hour: 50, day: 300, week: 1500 },
      rating: 4.6,
      reviews: 89,
      available: true,
      featured: false,
    },
    {
      id: 6,
      name: 'Luxury Sofa Set',
      category: 'Furniture',
      image: '🛋️',
      price: { hour: 100, day: 600, week: 3500 },
      rating: 4.8,
      reviews: 45,
      available: true,
      featured: false,
    },
  ];

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
    if (product.price.day < priceRange[0] || product.price.day > priceRange[1]) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Browse Products
          </h1>
          <p className="text-xl text-white/90" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Discover our complete catalog of rental items
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-900">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                        selectedCategory === category
                          ? 'bg-amber-500 text-white font-semibold'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-900">Price Range (per day)</h4>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹0</span>
                    <span className="font-semibold text-amber-600">₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="font-semibold mb-4 text-gray-900">Availability</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-gray-700">Available Now</span>
                </label>
              </div>

              {/* Reset Filters */}
              <button className="w-full mt-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <div className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-300">
                      {product.image}
                    </div>
                    {product.featured && (
                      <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Featured
                      </div>
                    )}
                    {!product.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold">
                          Currently Unavailable
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-amber-600 font-semibold mb-2">{product.category}</div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-amber-600 transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="ml-1 text-sm font-semibold">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-xs text-gray-500 mb-1">Starting from</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">₹{product.price.hour}</span>
                        <span className="text-sm text-gray-500">/hour</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ₹{product.price.day}/day · ₹{product.price.week}/week
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
                <p className="text-gray-600 mb-8">Try adjusting your filters to see more results</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange([0, 10000]);
                  }}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default Products;

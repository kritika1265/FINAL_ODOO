import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);

  const product = {
    id: 1,
    name: 'Canon EOS R6 Mark II',
    category: 'Photography',
    brand: 'Canon',
    model: 'EOS R6 Mark II',
    image: '📷',
    images: ['📷', '📸', '🎥', '💾'],
    description: 'Professional full-frame mirrorless camera with 24.2MP sensor, 4K 60p video, and advanced autofocus. Perfect for both photography and videography projects.',
    features: [
      '24.2MP Full-Frame CMOS Sensor',
      '4K 60p Video Recording',
      'Dual Card Slots (SD/CFexpress)',
      'In-Body Image Stabilization',
      '20fps Continuous Shooting',
      '6K RAW Video Output',
    ],
    specifications: {
      'Sensor': '24.2MP Full-Frame CMOS',
      'Video': '4K 60p / 6K RAW',
      'ISO Range': '100-102400',
      'Autofocus': '1053 AF Points',
      'Weight': '670g (body only)',
    },
    pricing: {
      hour: 250,
      day: 1500,
      week: 8500,
      month: 30000,
    },
    rating: 4.9,
    reviews: 127,
    available: 5,
    securityDeposit: 50000,
  };

  const reviews = [
    {
      id: 1,
      user: 'Priya Sharma',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Excellent camera! Used it for a wedding shoot and the results were amazing. The rental process was smooth and the equipment was in perfect condition.',
    },
    {
      id: 2,
      user: 'Rahul Verma',
      rating: 5,
      date: '1 month ago',
      comment: 'Great service and equipment quality. Rented for a commercial project. Will definitely rent again!',
    },
    {
      id: 3,
      user: 'Anjali Desai',
      rating: 4,
      date: '2 months ago',
      comment: 'Good camera with excellent features. Slightly expensive but worth it for professional work.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-9xl">
                {product.image}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className="aspect-square bg-white rounded-xl shadow-lg flex items-center justify-center text-4xl hover:shadow-xl transition-shadow"
                >
                  {img}
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
                {product.category}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="font-semibold text-gray-900">{product.rating}</span>
                <span className="text-gray-500">({product.reviews} reviews)</span>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-green-800">{product.available} units available</span>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

              {/* Rental Period Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Select Rental Period</label>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(product.pricing).map(([period, price]) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPeriod === period
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs text-gray-500 mb-1 capitalize">{period}</div>
                      <div className="font-bold text-gray-900">₹{price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-amber-500 transition-colors flex items-center justify-center font-bold"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.available, quantity + 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-amber-500 transition-colors flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Security Deposit Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">Security Deposit Required</div>
                    <div className="text-sm text-blue-800">₹{product.securityDeposit.toLocaleString()} (Fully refundable)</div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="py-4 px-6 bg-white border-2 border-amber-500 text-amber-600 rounded-xl font-bold hover:bg-amber-50 transition-colors">
                  Add to Cart
                </button>
                <button className="py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30">
                  Rent Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features and Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Features */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
              Key Features
            </h2>
            <ul className="space-y-3">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
              Specifications
            </h2>
            <dl className="space-y-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-200 pb-3">
                  <dt className="font-semibold text-gray-900">{key}</dt>
                  <dd className="text-gray-700">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Customer Reviews
          </h2>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{review.user}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default ProductDetails;

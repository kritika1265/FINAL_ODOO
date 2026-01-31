import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const categories = [
    { name: 'Electronics', icon: '📱', count: 125, color: 'from-blue-500 to-cyan-500' },
    { name: 'Tools & Equipment', icon: '🔧', count: 89, color: 'from-orange-500 to-amber-500' },
    { name: 'Photography', icon: '📷', count: 67, color: 'from-purple-500 to-pink-500' },
    { name: 'Furniture', icon: '🛋️', count: 45, color: 'from-green-500 to-emerald-500' },
    { name: 'Vehicles', icon: '🚗', count: 34, color: 'from-red-500 to-rose-500' },
    { name: 'Party Supplies', icon: '🎉', count: 92, color: 'from-yellow-500 to-orange-500' },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Canon EOS R6 Mark II',
      category: 'Photography',
      image: '📷',
      price: { hour: 250, day: 1500, week: 8500 },
      rating: 4.9,
      reviews: 127,
    },
    {
      id: 2,
      name: 'MacBook Pro 16" M3',
      category: 'Electronics',
      image: '💻',
      price: { hour: 180, day: 1200, week: 7000 },
      rating: 4.8,
      reviews: 94,
    },
    {
      id: 3,
      name: 'DJI Mavic 3 Pro',
      category: 'Photography',
      image: '🎬',
      price: { hour: 300, day: 2000, week: 12000 },
      rating: 5.0,
      reviews: 68,
    },
    {
      id: 4,
      name: 'Professional Projector 4K',
      category: 'Electronics',
      image: '📽️',
      price: { hour: 150, day: 900, week: 5000 },
      rating: 4.7,
      reviews: 156,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2aDRWMGgtNHYxNnptMCA0NGg0di0xNmgtNHYxNnptLTIwLTI4aDR2LTRoLTR2NHptMCA0aDR2LTRoLTR2NHptMCA0aDR2LTRoLTR2NHptMCA0aDR2LTRoLTR2NHpNOCAyNGg0di00SDh2NHptMCA0aDR2LTRIOHY0em0wIDRoNHYtNEg4djR6bTAgNGg0di00SDh2NHptNDAgMjBoNHYtNGgtNHY0em0wIDRoNHYtNGgtNHY0em0wIDRoNHYtNGgtNHY0em0wIDRoNHYtNGgtNHY0ek0yNCAyOGg0di00aC00djR6bTAgNGg0di00aC00djR6bTAgNGg0di00aC00djR6bTAgNGg0di00aC00djR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Rent Anything, Anytime
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Access premium equipment and tools without the commitment of ownership. From cameras to laptops, we've got you covered.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-white/20 hover:scale-105"
              >
                Browse Products
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="text-4xl font-bold text-amber-600 mb-2">2,500+</div>
            <div className="text-gray-600 font-medium">Products Available</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="text-4xl font-bold text-amber-600 mb-2">15,000+</div>
            <div className="text-gray-600 font-medium">Happy Customers</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="text-4xl font-bold text-amber-600 mb-2">4.9★</div>
            <div className="text-gray-600 font-medium">Average Rating</div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Find exactly what you need from our diverse collection
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/products?category=${category.name}`}
              className="group bg-white rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`text-5xl mb-4 bg-gradient-to-br ${category.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block`}>
                {category.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">{category.count} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Featured Rentals
            </h2>
            <p className="text-lg text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Most popular items this month
            </p>
          </div>
          <Link
            to="/products"
            className="hidden md:inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold"
          >
            View All
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-300">
                {product.image}
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
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              How It Works
            </h2>
            <p className="text-lg text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Rent in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Browse & Select',
                description: 'Choose from our extensive catalog of premium products and equipment.',
                icon: '🔍',
              },
              {
                step: '02',
                title: 'Book & Pay',
                description: 'Select your rental period, confirm your order, and make a secure payment.',
                icon: '💳',
              },
              {
                step: '03',
                title: 'Pickup & Return',
                description: 'Collect your items and return them when done. It\'s that simple!',
                icon: '📦',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl mb-6 inline-block">{item.icon}</div>
                <div className="text-5xl font-bold text-amber-600/20 mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {item.title}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Ready to Start Renting?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Join thousands of satisfied customers who trust us for their rental needs
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:scale-105"
          >
            Explore Products
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default Home;

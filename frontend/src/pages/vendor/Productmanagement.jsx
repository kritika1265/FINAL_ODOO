import React from 'react';

const ProductManagement = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>ProductManagement</h1>
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="text-8xl mb-6">🛠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600">This feature is under development</p>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;

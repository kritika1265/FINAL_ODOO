import React from 'react';
import { Link } from 'react-router-dom';

const VendorDashboard = () => {
  const stats = [
    { label: 'Total Revenue', value: '₹2,45,000', change: '+12.5%', icon: '💰', color: 'from-green-500 to-emerald-600' },
    { label: 'Active Rentals', value: '28', change: '+5', icon: '📦', color: 'from-blue-500 to-cyan-600' },
    { label: 'Total Products', value: '156', change: '+8', icon: '🎯', color: 'from-purple-500 to-pink-600' },
    { label: 'Pending Invoices', value: '12', change: '-3', icon: '📄', color: 'from-orange-500 to-amber-600' },
  ];

  const recentOrders = [
    { id: 'ORD-2024-045', customer: 'Priya Sharma', product: 'Canon EOS R6', status: 'Active', amount: 13500, date: '2024-02-01' },
    { id: 'ORD-2024-044', customer: 'Rahul Verma', product: 'MacBook Pro', status: 'Pending Return', amount: 6000, date: '2024-01-28' },
    { id: 'ORD-2024-043', customer: 'Anjali Desai', product: 'DJI Mavic 3', status: 'Completed', amount: 10000, date: '2024-01-25' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Vendor Dashboard</h1>
          <p className="text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>Welcome back! Here's what's happening with your rentals.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-4 text-2xl`}>
                {stat.icon}
              </div>
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Overview</h2>
          <div className="h-64 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <div className="text-gray-600">Revenue chart would be displayed here</div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Link to="/vendor/orders" className="text-amber-600 hover:text-amber-700 font-semibold">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Order ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Product</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-amber-600">{order.id}</td>
                    <td className="py-4 px-4">{order.customer}</td>
                    <td className="py-4 px-4">{order.product}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Active' ? 'bg-green-100 text-green-800' :
                        order.status === 'Pending Return' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>{order.status}</span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold">₹{order.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

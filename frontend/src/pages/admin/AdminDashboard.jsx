import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '1,248', change: '+18%', icon: '👥', color: 'from-blue-500 to-cyan-600' },
    { label: 'Active Vendors', value: '45', change: '+3', icon: '🏪', color: 'from-purple-500 to-pink-600' },
    { label: 'Total Revenue', value: '₹8.5L', change: '+25%', icon: '💰', color: 'from-green-500 to-emerald-600' },
    { label: 'Platform Products', value: '2,567', change: '+124', icon: '📦', color: 'from-orange-500 to-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Admin Dashboard</h1>
          <p className="text-gray-600">System-wide overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-4 text-2xl`}>{stat.icon}</div>
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-semibold text-green-600">{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'User Management', icon: '👥', link: '/admin/users' },
                { label: 'Vendor Management', icon: '🏪', link: '/admin/vendors' },
                { label: 'Settings', icon: '⚙️', link: '/admin/settings' },
                { label: 'Analytics', icon: '📊', link: '/admin/analytics' },
              ].map((action, idx) => (
                <Link key={idx} to={action.link} className="p-6 border-2 border-gray-200 rounded-2xl hover:border-amber-500 hover:shadow-lg transition-all text-center">
                  <div className="text-4xl mb-3">{action.icon}</div>
                  <div className="font-semibold text-gray-900">{action.label}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: 'New user registered', user: 'Priya Sharma', time: '5 min ago' },
                { action: 'Vendor approved', user: 'Tech Rentals Co.', time: '1 hour ago' },
                { action: 'Product added', user: 'Camera Hub', time: '2 hours ago' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{activity.action}</div>
                    <div className="text-sm text-gray-600">{activity.user}</div>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

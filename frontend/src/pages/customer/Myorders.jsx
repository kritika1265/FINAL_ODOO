import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const [activeTab, setActiveTab] = useState('active');

  const orders = [
    { id: 'ORD-2024-001', items: [{ name: 'Canon EOS R6 Mark II', image: '📷' }], status: 'Active', startDate: '2024-02-01', endDate: '2024-02-10', total: 13500, deposit: 50000 },
    { id: 'ORD-2024-002', items: [{ name: 'MacBook Pro 16"', image: '💻' }], status: 'Completed', startDate: '2024-01-15', endDate: '2024-01-20', total: 6000, deposit: 30000 },
    { id: 'ORD-2024-003', items: [{ name: 'DJI Mavic 3 Pro', image: '🎬' }], status: 'Pending', startDate: '2024-02-15', endDate: '2024-02-20', total: 10000, deposit: 60000 },
  ];

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') return order.status === 'Active';
    if (activeTab === 'completed') return order.status === 'Completed';
    if (activeTab === 'pending') return order.status === 'Pending';
    return true;
  });

  const statusColors = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Completed: 'bg-blue-100 text-blue-800 border-blue-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>My Orders</h1>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              {['all', 'active', 'completed', 'pending'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all capitalize ${activeTab === tab ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-amber-500 hover:shadow-lg transition-all">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="font-bold text-xl text-gray-900 mb-2">{order.id}</div>
                    <div className="text-sm text-gray-600">
                      {order.startDate} to {order.endDate}
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-xl border-2 font-semibold ${statusColors[order.status]}`}>{order.status}</span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="text-3xl">{item.image}</div>
                      <div className="font-semibold text-gray-900">{item.name}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                    <div className="text-2xl font-bold text-gray-900">₹{order.total.toLocaleString()}</div>
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/orders/${order.id}`} className="px-6 py-3 border-2 border-amber-500 text-amber-600 rounded-xl font-semibold hover:bg-amber-50 transition-colors">View Details</Link>
                    <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg">Download Invoice</button>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">📦</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h3>
                <p className="text-gray-600 mb-8">You don't have any {activeTab} orders yet</p>
                <Link to="/products" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg">
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;

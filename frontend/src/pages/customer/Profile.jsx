import React, { useState } from 'react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+91 98765 43210',
    companyName: 'Acme Rentals Pvt Ltd',
    gstin: '22AAAAA0000A1Z5',
    address: '123 Business Park, Sector 5',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>My Profile</h1>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              {[{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }, { id: 'notifications', label: 'Notifications' }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${activeTab === tab.id ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                      <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                      <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Company Name</label>
                      <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">GSTIN</label>
                      <input name="gstin" value={formData.gstin} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
                      <input name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                      <input name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">State</label>
                      <input name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Pincode</label>
                      <input name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                <form className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                    <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                    <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
                    <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg">
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Order Updates', description: 'Get notified about your order status' },
                    { label: 'Return Reminders', description: 'Receive reminders before return date' },
                    { label: 'Promotional Emails', description: 'Get updates about new products and offers' },
                    { label: 'SMS Notifications', description: 'Receive SMS for important updates' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-amber-500 transition-colors">
                      <div>
                        <div className="font-semibold text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={idx < 2} />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

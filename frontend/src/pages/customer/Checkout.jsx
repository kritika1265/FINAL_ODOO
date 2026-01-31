import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Address
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    // Payment
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Process order
      navigate('/my-orders');
    }
  };

  const orderSummary = {
    subtotal: 9000,
    tax: 1620,
    securityDeposit: 50000,
    total: 10620,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>
          Checkout
        </h1>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${step >= s ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'} font-bold transition-all`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className={`w-24 h-1 ${step > s ? 'bg-amber-500' : 'bg-gray-200'} transition-all`}></div>}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-4">
            <span className={`text-sm font-semibold ${step >= 1 ? 'text-amber-600' : 'text-gray-500'}`}>Address</span>
            <span className={`text-sm font-semibold ${step >= 2 ? 'text-amber-600' : 'text-gray-500'}`}>Payment</span>
            <span className={`text-sm font-semibold ${step >= 3 ? 'text-amber-600' : 'text-gray-500'}`}>Confirm</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8">
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none md:col-span-2" required />
                    <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none md:col-span-2" required />
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                    <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                    <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none md:col-span-2" required />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-500">
                      <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} className="w-5 h-5" />
                      <span className="font-semibold">Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-500">
                      <input type="radio" name="paymentMethod" value="upi" checked={formData.paymentMethod === 'upi'} onChange={handleChange} className="w-5 h-5" />
                      <span className="font-semibold">UPI</span>
                    </label>
                  </div>
                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <input name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="Card Number" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                      <input name="cardName" value={formData.cardName} onChange={handleChange} placeholder="Cardholder Name" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                      <div className="grid grid-cols-2 gap-4">
                        <input name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                        <input name="cvv" value={formData.cvv} onChange={handleChange} placeholder="CVV" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Confirm Order</h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-bold mb-2">Delivery Address</h3>
                      <p className="text-gray-700">{formData.fullName}</p>
                      <p className="text-gray-700">{formData.address}, {formData.city}</p>
                      <p className="text-gray-700">{formData.state} - {formData.pincode}</p>
                      <p className="text-gray-700">{formData.phone}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-bold mb-2">Payment Method</h3>
                      <p className="text-gray-700 capitalize">{formData.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-amber-500 transition-colors">
                    Back
                  </button>
                )}
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg">
                  {step === 3 ? 'Place Order' : 'Continue'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">₹{orderSummary.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Tax (GST 18%)</span><span className="font-semibold">₹{orderSummary.tax.toLocaleString()}</span></div>
                <div className="flex justify-between border-t pt-4"><span className="text-xl font-bold">Total</span><span className="text-xl font-bold text-amber-600">₹{orderSummary.total.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

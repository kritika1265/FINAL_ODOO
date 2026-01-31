import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, FileText, User } from 'lucide-react';

const CustomerDashboard = () => (
  <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="mb-8 text-slate-600">Manage your rentals and account</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { to: '/customer/orders', label: 'My Orders', icon: ShoppingBag },
          { to: '/customer/invoices', label: 'Invoices', icon: FileText },
          { to: '/customer/profile', label: 'Profile', icon: User },
          { to: '/products', label: 'Browse Products', icon: Package },
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Icon className="h-6 w-6" />
            </div>
            <span className="font-semibold text-slate-800">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default CustomerDashboard;

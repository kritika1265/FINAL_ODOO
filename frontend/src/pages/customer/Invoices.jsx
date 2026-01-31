import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const CustomerInvoices = () => (
  <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Invoices</h1>
      <p className="mb-8 text-slate-600">View and download your invoices</p>
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <FileText className="mx-auto h-16 w-16 text-slate-300" />
        <p className="mt-4 text-slate-600">No invoices yet</p>
        <Link to="/products" className="mt-4 inline-block text-amber-600 hover:text-amber-700 font-medium">
          Browse products →
        </Link>
      </div>
    </div>
  </div>
);

export default CustomerInvoices;

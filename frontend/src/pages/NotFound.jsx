import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
    <h1 className="text-8xl font-bold text-amber-500">404</h1>
    <p className="mt-4 text-xl text-slate-600">Page not found</p>
    <Link
      to="/"
      className="mt-8 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-amber-600"
    >
      Back to Home
    </Link>
  </div>
);

export default NotFound;

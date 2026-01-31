import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const cartItemCount = getCartCount ? getCartCount() : 0;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = user?.role || 'customer';
  const navLinks = {
    customer: [
      { label: 'Home', href: '/' },
      { label: 'Browse Products', href: '/products' },
      { label: 'My Orders', href: '/customer/orders' },
      { label: 'Profile', href: '/customer/profile' },
    ],
    vendor: [
      { label: 'Dashboard', href: '/vendor/dashboard' },
      { label: 'Products', href: '/vendor/products' },
      { label: 'Orders', href: '/vendor/orders' },
      { label: 'Invoices', href: '/vendor/invoices' },
      { label: 'Reports', href: '/vendor/reports' },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Products', href: '/admin/products' },
      { label: 'Orders', href: '/admin/orders' },
      { label: 'Settings', href: '/admin/settings' },
      { label: 'Reports', href: '/admin/reports' },
    ],
  };

  const links = navLinks[role] || navLinks.customer;

  const handleLogoClick = () => navigate('/');
  const handleCartClick = () => navigate('/cart');
  const handleProfileClick = () => {
    setUserMenuOpen(false);
    if (isAuthenticated) navigate('/customer/profile');
    else navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/95 backdrop-blur-md shadow-lg shadow-slate-900/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Rental<span className="text-amber-400">Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="relative text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {role === 'customer' && (
            <button
              type="button"
              onClick={handleCartClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition-all hover:bg-amber-500/20 hover:border-amber-500/50"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white shadow">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition-all hover:bg-amber-500/20 hover:border-amber-500/50"
            >
              <User className="h-5 w-5" />
            </button>
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-xl">
                  {isAuthenticated ? (
                    <>
                      <div className="border-b border-slate-700 px-4 py-2 text-sm text-slate-300">
                        {user?.email}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-slate-800/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

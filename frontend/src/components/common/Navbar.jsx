import React, { useState } from 'react';
import { ShoppingCart, User, Menu, X, Package } from 'lucide-react';

const Navbar = ({ 
  cartItemCount = 0, 
  userRole = null, // 'customer', 'vendor', 'admin'
  onCartClick,
  onProfileClick,
  onLogoClick 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = {
    customer: [
      { label: 'Browse Products', href: '/products' },
      { label: 'My Orders', href: '/orders' },
      { label: 'Quotations', href: '/quotations' }
    ],
    vendor: [
      { label: 'Products', href: '/vendor/products' },
      { label: 'Orders', href: '/vendor/orders' },
      { label: 'Dashboard', href: '/vendor/dashboard' }
    ],
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Settings', href: '/admin/settings' }
    ]
  };

  const links = userRole ? navLinks[userRole] : navLinks.customer;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={onLogoClick}>
          <Package className="logo-icon" />
          <span className="logo-text">RentalHub</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {links.map((link, index) => (
            <a 
              key={index} 
              href={link.href} 
              className="nav-link"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {userRole === 'customer' && (
            <button className="cart-button" onClick={onCartClick}>
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </button>
          )}
          
          <button className="profile-button" onClick={onProfileClick}>
            <User size={20} />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {links.map((link, index) => (
            <a 
              key={index} 
              href={link.href} 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .navbar-logo:hover {
          transform: translateY(-2px);
        }

        .logo-icon {
          color: #3b82f6;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .navbar-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          padding: 0.5rem 0;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: #fff;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .navbar-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .cart-button,
        .profile-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.6rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .cart-button:hover,
        .profile-button:hover {
          background: rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .cart-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-menu {
          display: none;
        }

        @media (max-width: 768px) {
          .navbar-links {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .mobile-menu {
            display: flex;
            flex-direction: column;
            background: #0f172a;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            animation: slideDown 0.3s ease;
          }

          .mobile-nav-link {
            color: rgba(255, 255, 255, 0.85);
            text-decoration: none;
            padding: 1rem 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.2s ease;
          }

          .mobile-nav-link:hover {
            background: rgba(59, 130, 246, 0.1);
            color: #fff;
          }

          .navbar-container {
            padding: 1rem 1.5rem;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

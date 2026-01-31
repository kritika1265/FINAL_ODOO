import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Company Info */}
        <div className="footer-section">
          <h3 className="footer-title">RentalHub</h3>
          <p className="footer-description">
            Your trusted partner for online rental management. 
            Streamline your rental business with our comprehensive platform.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className="social-icon" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="section-title">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/products">Browse Products</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h4 className="section-title">Support</h4>
          <ul className="footer-links">
            <li><a href="/help">Help Center</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4 className="section-title">Contact Us</h4>
          <div className="contact-info">
            <div className="contact-item">
              <Mail size={16} />
              <span>support@rentalhub.com</span>
            </div>
            <div className="contact-item">
              <Phone size={16} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>123 Business St, City, Country</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p className="copyright">
          © {currentYear} RentalHub. All rights reserved.
        </p>
        <div className="footer-bottom-links">
          <a href="/sitemap">Sitemap</a>
          <span className="separator">•</span>
          <a href="/accessibility">Accessibility</a>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: rgba(255, 255, 255, 0.85);
          margin-top: auto;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 4rem 2rem 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 3rem;
        }

        .footer-section {
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }

        .footer-section:nth-child(1) { animation-delay: 0.1s; }
        .footer-section:nth-child(2) { animation-delay: 0.2s; }
        .footer-section:nth-child(3) { animation-delay: 0.3s; }
        .footer-section:nth-child(4) { animation-delay: 0.4s; }

        .footer-title {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .footer-description {
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
        }

        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          background: rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 1.25rem;
          position: relative;
          display: inline-block;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 30px;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 0.75rem;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .footer-links a:hover {
          color: #3b82f6;
          transform: translateX(5px);
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .contact-item svg {
          color: #3b82f6;
          flex-shrink: 0;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem 2rem;
          max-width: 1400px;
          margin: 2rem auto 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .copyright {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          margin: 0;
        }

        .footer-bottom-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .footer-bottom-links a {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.3s ease;
        }

        .footer-bottom-links a:hover {
          color: #3b82f6;
        }

        .separator {
          color: rgba(255, 255, 255, 0.3);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .footer-content {
            padding: 3rem 1.5rem 1.5rem;
            gap: 2rem;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;

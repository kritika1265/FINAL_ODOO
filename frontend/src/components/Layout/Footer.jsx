import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-700/50 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-3 text-lg font-bold text-white">
              Rental<span className="text-amber-400">Hub</span>
            </h3>
            <p className="mb-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Your trusted partner for online rental management. Streamline your rental business with our platform.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Linkedin, label: 'LinkedIn' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 bg-slate-800/50 text-slate-400 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/products', label: 'Browse Products' },
                { to: '/', label: 'Home' },
                { to: '/cart', label: 'Cart' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-400 transition hover:text-amber-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="transition hover:text-amber-400">Help Center</a></li>
              <li><a href="#" className="transition hover:text-amber-400">Terms of Service</a></li>
              <li><a href="#" className="transition hover:text-amber-400">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                support@rentalhub.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-amber-500" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-amber-500" />
                123 Business St, City, Country
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-700/50 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {currentYear} RentalHub. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="transition hover:text-amber-400">Sitemap</a>
            <span>·</span>
            <a href="#" className="transition hover:text-amber-400">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

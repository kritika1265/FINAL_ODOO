import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileText,
  BarChart3,
  Users,
  Settings,
  ClipboardList,
  User,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const iconClass = 'h-5 w-5 shrink-0';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  const customerNav = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className={iconClass} /> },
    { to: '/customer/orders', label: 'My Orders', icon: <ShoppingBag className={iconClass} /> },
    { to: '/customer/invoices', label: 'Invoices', icon: <Receipt className={iconClass} /> },
    { to: '/customer/profile', label: 'Profile', icon: <User className={iconClass} /> },
  ];

  const vendorNav = [
    { to: '/vendor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className={iconClass} /> },
    { to: '/vendor/products', label: 'Products', icon: <Package className={iconClass} /> },
    { to: '/vendor/orders', label: 'Orders', icon: <ClipboardList className={iconClass} /> },
    { to: '/vendor/invoices', label: 'Invoices', icon: <FileText className={iconClass} /> },
    { to: '/vendor/reports', label: 'Reports', icon: <BarChart3 className={iconClass} /> },
  ];

  const adminNav = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className={iconClass} /> },
    { to: '/admin/users', label: 'Users', icon: <Users className={iconClass} /> },
    { to: '/admin/products', label: 'Products', icon: <Package className={iconClass} /> },
    { to: '/admin/orders', label: 'Orders', icon: <ClipboardList className={iconClass} /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings className={iconClass} /> },
    { to: '/admin/reports', label: 'Reports', icon: <BarChart3 className={iconClass} /> },
  ];

  const links = role === 'admin' ? adminNav : role === 'vendor' ? vendorNav : customerNav;

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white shadow-sm lg:w-72">
      <nav className="sticky top-16 flex flex-col gap-1 p-4">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

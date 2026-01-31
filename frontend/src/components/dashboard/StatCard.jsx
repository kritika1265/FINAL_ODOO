import React from 'react';
import { 
  TrendingUp, TrendingDown, Minus,
  DollarSign, Package, ShoppingCart, Users 
} from 'lucide-react';

const StatCard = ({
  title,
  value,
  change,
  changeType = 'increase', // 'increase', 'decrease', 'neutral'
  icon: IconComponent,
  iconColor = '#3b82f6',
  format = 'number', // 'number', 'currency', 'percentage'
  currency = 'INR'
}) => {
  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currency,
          maximumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('en-IN').format(val);
    }
  };

  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return TrendingUp;
      case 'decrease':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = () => {
    switch (changeType) {
      case 'increase':
        return '#10b981';
      case 'decrease':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const TrendIcon = getTrendIcon();
  const trendColor = getTrendColor();

  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon" style={{ '--icon-color': iconColor }}>
          {IconComponent && <IconComponent size={24} />}
        </div>
        
        {change !== undefined && (
          <div className="stat-trend" style={{ '--trend-color': trendColor }}>
            <TrendIcon size={16} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{formatValue(value)}</p>
      </div>

      <div className="stat-footer">
        <div className="stat-sparkline"></div>
      </div>

      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.5s ease forwards;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--icon-color), transparent);
          opacity: 0.6;
        }

        .stat-card:hover {
          border-color: rgba(59, 130, 246, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          background: color-mix(in srgb, var(--icon-color) 15%, transparent);
          border: 1px solid color-mix(in srgb, var(--icon-color) 30%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--icon-color);
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          background: color-mix(in srgb, var(--trend-color) 15%, transparent);
          border: 1px solid color-mix(in srgb, var(--trend-color) 30%, transparent);
          color: var(--trend-color);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .stat-content {
          margin-bottom: 1rem;
        }

        .stat-title {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.5rem 0;
        }

        .stat-value {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          line-height: 1;
        }

        .stat-footer {
          height: 40px;
          margin: -0.5rem -1.5rem -1.5rem;
          position: relative;
        }

        .stat-sparkline {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--icon-color) 10%, transparent) 0%,
            transparent 100%
          );
          position: relative;
        }

        .stat-sparkline::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--icon-color),
            transparent
          );
          opacity: 0.5;
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

        @media (max-width: 640px) {
          .stat-value {
            font-size: 1.75rem;
          }

          .stat-icon {
            width: 48px;
            height: 48px;
          }
        }
      `}</style>
    </div>
  );
};

// Pre-configured stat cards for common metrics
export const RevenueCard = ({ value, change }) => (
  <StatCard
    title="Total Revenue"
    value={value}
    change={change}
    changeType={change >= 0 ? 'increase' : 'decrease'}
    icon={DollarSign}
    iconColor="#10b981"
    format="currency"
  />
);

export const OrdersCard = ({ value, change }) => (
  <StatCard
    title="Total Orders"
    value={value}
    change={change}
    changeType={change >= 0 ? 'increase' : 'decrease'}
    icon={ShoppingCart}
    iconColor="#3b82f6"
    format="number"
  />
);

export const ProductsCard = ({ value, change }) => (
  <StatCard
    title="Active Products"
    value={value}
    change={change}
    changeType={change >= 0 ? 'increase' : 'decrease'}
    icon={Package}
    iconColor="#8b5cf6"
    format="number"
  />
);

export const CustomersCard = ({ value, change }) => (
  <StatCard
    title="Total Customers"
    value={value}
    change={change}
    changeType={change >= 0 ? 'increase' : 'decrease'}
    icon={Users}
    iconColor="#f59e0b"
    format="number"
  />
);

export default StatCard;

import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

const RevenueChart = ({ 
  data = [],
  title = "Revenue Overview",
  period = 'monthly' // 'daily', 'weekly', 'monthly', 'yearly'
}) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length || 0;

  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">
            <Calendar size={14} />
            {period.charAt(0).toUpperCase() + period.slice(1)} view
          </p>
        </div>
        
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">
              {formatCurrency(data.reduce((sum, d) => sum + d.value, 0))}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value">
              {formatCurrency(avgValue)}
            </span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-y-axis">
          <span className="y-label">{formatCurrency(maxValue)}</span>
          <span className="y-label">{formatCurrency(maxValue * 0.75)}</span>
          <span className="y-label">{formatCurrency(maxValue * 0.5)}</span>
          <span className="y-label">{formatCurrency(maxValue * 0.25)}</span>
          <span className="y-label">0</span>
        </div>

        <div className="chart-content">
          <div className="chart-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid-line" />
            ))}
          </div>

          <div className="chart-bars">
            {data.map((item, index) => {
              const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              const isHovered = hoveredBar === index;
              
              return (
                <div 
                  key={index} 
                  className="bar-container"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div 
                    className={`bar ${isHovered ? 'hovered' : ''}`}
                    style={{ height: `${height}%` }}
                  >
                    {isHovered && (
                      <div className="bar-tooltip">
                        <span className="tooltip-label">{item.label}</span>
                        <span className="tooltip-value">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="bar-label">{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* Average line */}
          {avgValue > 0 && (
            <div 
              className="average-line"
              style={{ bottom: `${(avgValue / maxValue) * 100}%` }}
            >
              <span className="average-label">Avg: {formatCurrency(avgValue)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color revenue"></div>
          <span>Revenue</span>
        </div>
        <div className="legend-item">
          <div className="legend-color average"></div>
          <span>Average</span>
        </div>
        <div className="legend-item">
          <TrendingUp size={14} />
          <span>
            {data.length > 1 && data[data.length - 1].value > data[0].value 
              ? 'Trending up' 
              : 'Stable'}
          </span>
        </div>
      </div>

      <style jsx>{`
        .revenue-chart {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 1.5rem;
          animation: fadeIn 0.5s ease;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.25rem 0;
        }

        .chart-subtitle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          margin: 0;
        }

        .chart-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          color: #3b82f6;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .chart-container {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 1rem;
          min-height: 300px;
        }

        .chart-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem 0;
        }

        .y-label {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.75rem;
          text-align: right;
        }

        .chart-content {
          position: relative;
          padding: 1rem 0;
        }

        .chart-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem 0;
        }

        .grid-line {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          width: 100%;
        }

        .chart-bars {
          position: relative;
          height: 100%;
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          padding: 1rem 0;
        }

        .bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 40px;
          position: relative;
        }

        .bar {
          width: 100%;
          min-height: 4px;
          background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 0.375rem 0.375rem 0 0;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }

        .bar:hover,
        .bar.hovered {
          background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
          transform: scaleY(1.02);
        }

        .bar-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(59, 130, 246, 0.5);
          border-radius: 0.5rem;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          white-space: nowrap;
          margin-bottom: 0.5rem;
          animation: tooltipSlide 0.2s ease;
          z-index: 10;
        }

        .bar-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(59, 130, 246, 0.5);
        }

        .tooltip-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
        }

        .tooltip-value {
          color: #3b82f6;
          font-weight: 700;
          font-size: 1rem;
        }

        .bar-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .average-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f59e0b, transparent);
          border-top: 2px dashed #f59e0b;
          pointer-events: none;
        }

        .average-label {
          position: absolute;
          right: 0;
          top: -20px;
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #f59e0b;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .chart-legend {
          display: flex;
          gap: 1.5rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 0.25rem;
        }

        .legend-color.revenue {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .legend-color.average {
          background: #f59e0b;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tooltipSlide {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @media (max-width: 768px) {
          .chart-header {
            flex-direction: column;
          }

          .chart-stats {
            width: 100%;
            justify-content: space-between;
          }

          .chart-container {
            grid-template-columns: 50px 1fr;
            min-height: 250px;
          }

          .bar-label {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RevenueChart;

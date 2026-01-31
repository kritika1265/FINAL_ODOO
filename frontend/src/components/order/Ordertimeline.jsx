import React from 'react';
import { 
  FileText, CheckCircle, Truck, Package, 
  RotateCcw, XCircle, Clock 
} from 'lucide-react';

const OrderTimeline = ({ 
  status, 
  timeline = [] 
}) => {
  // Default timeline steps based on status
  const getDefaultTimeline = () => {
    const steps = [
      { 
        status: 'draft', 
        label: 'Draft Created', 
        icon: FileText,
        completed: true,
        timestamp: timeline.find(t => t.status === 'draft')?.timestamp
      },
      { 
        status: 'confirmed', 
        label: 'Order Confirmed', 
        icon: CheckCircle,
        completed: ['confirmed', 'in-progress', 'completed', 'returned'].includes(status),
        timestamp: timeline.find(t => t.status === 'confirmed')?.timestamp
      },
      { 
        status: 'in-progress', 
        label: 'Pickup Scheduled', 
        icon: Truck,
        completed: ['in-progress', 'completed', 'returned'].includes(status),
        timestamp: timeline.find(t => t.status === 'in-progress')?.timestamp
      },
      { 
        status: 'with-customer', 
        label: 'With Customer', 
        icon: Package,
        completed: ['completed', 'returned'].includes(status),
        timestamp: timeline.find(t => t.status === 'with-customer')?.timestamp
      },
      { 
        status: 'returned', 
        label: 'Returned', 
        icon: RotateCcw,
        completed: status === 'returned',
        timestamp: timeline.find(t => t.status === 'returned')?.timestamp
      }
    ];

    // Handle cancelled status
    if (status === 'cancelled') {
      return [
        ...steps.filter(s => s.completed),
        {
          status: 'cancelled',
          label: 'Order Cancelled',
          icon: XCircle,
          completed: true,
          timestamp: timeline.find(t => t.status === 'cancelled')?.timestamp,
          isCancelled: true
        }
      ];
    }

    return steps;
  };

  const timelineSteps = getDefaultTimeline();

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="order-timeline">
      <h3 className="timeline-title">Order Progress</h3>
      
      <div className="timeline-container">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === timelineSteps.length - 1;
          const isCurrent = !step.completed && 
                           (index === 0 || timelineSteps[index - 1]?.completed);

          return (
            <div key={step.status} className="timeline-step">
              <div className="step-indicator">
                <div className={`step-icon ${step.completed ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${step.isCancelled ? 'cancelled' : ''}`}>
                  <Icon size={20} />
                </div>
                
                {!isLast && (
                  <div className={`step-connector ${step.completed ? 'completed' : ''}`} />
                )}
              </div>

              <div className="step-content">
                <div className="step-header">
                  <h4 className={`step-label ${step.completed ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    {step.label}
                  </h4>
                  {isCurrent && !step.completed && (
                    <span className="current-badge">
                      <Clock size={12} />
                      In Progress
                    </span>
                  )}
                </div>
                
                {step.timestamp && (
                  <p className="step-timestamp">{formatTimestamp(step.timestamp)}</p>
                )}
                
                {step.description && (
                  <p className="step-description">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .order-timeline {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .timeline-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0 0 1.5rem 0;
        }

        .timeline-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .timeline-step {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 1rem;
        }

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }

        .step-icon.completed {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
          color: #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }

        .step-icon.current {
          background: rgba(251, 191, 36, 0.2);
          border-color: #fbbf24;
          color: #fbbf24;
          animation: pulse 2s infinite;
        }

        .step-icon.cancelled {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #ef4444;
        }

        .step-connector {
          width: 2px;
          flex: 1;
          min-height: 40px;
          background: rgba(255, 255, 255, 0.1);
          margin-top: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .step-connector.completed {
          background: linear-gradient(
            180deg,
            #3b82f6 0%,
            rgba(59, 130, 246, 0.5) 100%
          );
        }

        .step-content {
          padding: 0.5rem 0 1rem 0;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.375rem;
        }

        .step-label {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          transition: color 0.3s ease;
        }

        .step-label.completed {
          color: rgba(255, 255, 255, 0.9);
        }

        .step-label.current {
          color: white;
        }

        .current-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          background: rgba(251, 191, 36, 0.2);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 0.5rem;
          color: #fbbf24;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .step-timestamp {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          margin: 0 0 0.25rem 0;
        }

        .step-description {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0.25rem 0 0 0;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
          }
        }

        @media (max-width: 640px) {
          .timeline-step {
            grid-template-columns: 48px 1fr;
            gap: 0.75rem;
          }

          .step-icon {
            width: 40px;
            height: 40px;
          }

          .step-icon svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderTimeline;

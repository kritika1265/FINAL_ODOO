import React from 'react';

const Loader = ({ 
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'primary', // 'primary', 'white', 'dark'
  fullScreen = false,
  text = ''
}) => {
  const sizeMap = {
    small: '24px',
    medium: '48px',
    large: '64px'
  };

  const loaderSize = sizeMap[size];

  const LoaderSpinner = () => (
    <div className={`loader-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="loader-spinner">
        <div className="spinner"></div>
        <div className="spinner-glow"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}

      <style jsx>{`
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .loader-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          z-index: 9999;
        }

        .loader-spinner {
          position: relative;
          width: ${loaderSize};
          height: ${loaderSize};
        }

        .spinner {
          width: 100%;
          height: 100%;
          border: 3px solid ${
            variant === 'white' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : variant === 'dark'
              ? 'rgba(0, 0, 0, 0.1)'
              : 'rgba(59, 130, 246, 0.2)'
          };
          border-top-color: ${
            variant === 'white'
              ? '#fff'
              : variant === 'dark'
              ? '#0f172a'
              : '#3b82f6'
          };
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120%;
          height: 120%;
          border-radius: 50%;
          background: ${
            variant === 'white'
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)'
              : variant === 'dark'
              ? 'radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
          };
          animation: pulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        .loader-text {
          color: ${
            variant === 'white'
              ? 'rgba(255, 255, 255, 0.9)'
              : variant === 'dark'
              ? 'rgba(0, 0, 0, 0.7)'
              : 'rgba(255, 255, 255, 0.9)'
          };
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0;
          animation: fadeInOut 2s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  return <LoaderSpinner />;
};

// Skeleton Loader Component
export const SkeletonLoader = ({ 
  type = 'text', // 'text', 'card', 'circle', 'rectangle'
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'circle':
        return <div className="skeleton skeleton-circle"></div>;
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton skeleton-image"></div>
            <div className="skeleton-card-content">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
            </div>
          </div>
        );
      case 'rectangle':
        return <div className="skeleton skeleton-rectangle"></div>;
      default:
        return <div className="skeleton skeleton-text"></div>;
    }
  };

  return (
    <div className={`skeleton-container ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}

      <style jsx>{`
        .skeleton-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 0.5rem;
        }

        .skeleton-text {
          height: 1rem;
          width: 100%;
        }

        .skeleton-text.short {
          width: 60%;
        }

        .skeleton-title {
          height: 1.5rem;
          width: 80%;
          margin-bottom: 0.75rem;
        }

        .skeleton-circle {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
        }

        .skeleton-rectangle {
          height: 12rem;
          width: 100%;
        }

        .skeleton-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .skeleton-image {
          height: 12rem;
          width: 100%;
        }

        .skeleton-card-content {
          padding: 1.5rem;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;

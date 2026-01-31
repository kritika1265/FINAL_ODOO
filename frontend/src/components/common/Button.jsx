import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger', 'success'
  size = 'medium', // 'small', 'medium', 'large'
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left', // 'left', 'right'
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success'
  };

  const sizeClasses = {
    small: 'btn-small',
    medium: 'btn-medium',
    large: 'btn-large'
  };

  return (
    <button
      type={type}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'btn-full' : ''} ${className}`}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="btn-loader" size={16} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn-icon">{icon}</span>
      )}
      
      <span className="btn-text">{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn-icon">{icon}</span>
      )}

      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .btn:active::before {
          width: 300px;
          height: 300px;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-text {
          position: relative;
          z-index: 1;
        }

        .btn-icon {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
        }

        /* Sizes */
        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .btn-medium {
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.05rem;
        }

        /* Variants */
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .btn-secondary:hover:not(:disabled) {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
          transform: translateY(-2px);
        }

        .btn-outline {
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
          box-shadow: none;
        }

        .btn-outline:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.1);
          border-color: #2563eb;
          color: #2563eb;
          transform: translateY(-2px);
        }

        .btn-ghost {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: none;
        }

        .btn-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .btn-danger:hover:not(:disabled) {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
          transform: translateY(-2px);
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-success:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          transform: translateY(-2px);
        }

        .btn-full {
          width: 100%;
        }

        .btn-loader {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
};

export default Button;

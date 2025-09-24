import React from 'react';

/**
 * Reusable loading spinner component with accessibility support
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner ('sm', 'md', 'lg')
 * @param {string} props.color - Color of the spinner
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.ariaLabel - Accessible label for screen readers
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'white', 
  className = '', 
  ariaLabel = 'Loading' 
}) => {
  const sizeClasses = {
    sm: { width: '16px', height: '16px', borderWidth: '2px' },
    md: { width: '20px', height: '20px', borderWidth: '2px' },
    lg: { width: '24px', height: '24px', borderWidth: '3px' }
  };

  const spinnerSize = sizeClasses[size];

  return (
    <div
      className={className}
      role="status"
      aria-label={ariaLabel}
      style={{
        display: 'inline-block',
        ...spinnerSize,
        border: `${spinnerSize.borderWidth} solid ${color === 'white' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
        borderTop: `${spinnerSize.borderWidth} solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    >
      <span style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}>
        {ariaLabel}
      </span>
    </div>
  );
};

export default LoadingSpinner;
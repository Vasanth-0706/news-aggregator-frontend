import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Enhanced button component with loading states and accessibility
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether button is in loading state
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.loadingText - Text to show when loading
 * @param {string} props.children - Button content when not loading
 * @param {string} props.type - Button type
 * @param {function} props.onClick - Click handler
 * @param {Object} props.style - Additional styles
 * @param {string} props.className - Additional CSS classes
 */
const LoadingButton = ({
  isLoading = false,
  disabled = false,
  loadingText = 'Loading...',
  children,
  type = 'button',
  onClick,
  style = {},
  className = '',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const baseStyles = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    color: 'white',
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: '48px', // Fixed height to prevent expansion
    boxSizing: 'border-box',
    ...style
  };

  const getBackgroundColor = () => {
    if (isDisabled) return '#9ca3af';
    return style.backgroundColor || '#2563eb';
  };

  const getHoverStyles = () => {
    if (isDisabled) return {};
    return {
      backgroundColor: style.backgroundColor ? 
        (style.backgroundColor === '#2563eb' ? '#1d4ed8' : style.backgroundColor) : 
        '#1d4ed8',
      transform: 'translateY(-1px)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)'
    };
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={className}
      aria-describedby={isLoading ? 'loading-description' : undefined}
      style={{
        ...baseStyles,
        backgroundColor: getBackgroundColor()
      }}
      onMouseOver={(e) => {
        if (!isDisabled) {
          Object.assign(e.target.style, getHoverStyles());
        }
      }}
      onMouseOut={(e) => {
        if (!isDisabled) {
          e.target.style.backgroundColor = getBackgroundColor();
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner 
            size="sm" 
            color="white" 
            ariaLabel="Loading, please wait"
          />
          <span>{loadingText}</span>
          <span 
            id="loading-description"
            style={{
              position: 'absolute',
              left: '-10000px',
              width: '1px',
              height: '1px',
              overflow: 'hidden'
            }}
          >
            Form is being submitted, please wait
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
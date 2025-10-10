import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

/**
 * Success message component with animation and accessibility support
 * @param {Object} props - Component props
 * @param {string} props.message - Success message to display
 * @param {boolean} props.show - Whether to show the message
 * @param {function} props.onHide - Callback when message is hidden
 * @param {number} props.duration - Duration to show message (ms)
 */
const SuccessMessage = ({ 
  message, 
  show = false, 
  onHide, 
  duration = 4000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Trigger animation after component mounts
      setTimeout(() => setIsAnimating(true), 10);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onHide && onHide();
        }, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: '#10b981',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '300px',
        transform: isAnimating ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
        opacity: isAnimating ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '14px',
        fontWeight: '500'
      }}
    >
      <CheckCircleIcon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
};

export default SuccessMessage;
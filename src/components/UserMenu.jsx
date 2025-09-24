import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

// Add CSS animation for pulse effect
const pulseAnimation = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

// Inject the CSS if not already present
if (typeof document !== 'undefined' && !document.getElementById('user-menu-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'user-menu-styles';
  styleSheet.textContent = pulseAnimation;
  document.head.appendChild(styleSheet);
}

/**
 * User menu component that shows different states based on authentication
 * Handles login/signup buttons for unauthenticated users and user dropdown for authenticated users
 * @returns {React.ReactElement} User menu component
 */
const UserMenu = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#e5e7eb',
          borderRadius: '50%',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
      </div>
    );
  }

  // Show login/signup buttons for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link
          to="/login"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            transition: 'all 0.2s ease',
            border: '1px solid transparent'
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#2563eb';
            e.target.style.backgroundColor = '#f8fafc';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#374151';
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          Log In
        </Link>
        <Link
          to="/signup"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'white',
            backgroundColor: '#3b82f6',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            transition: 'all 0.2s ease',
            border: 'none'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#3b82f6';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Sign Up
        </Link>
      </div>
    );
  }

  // Show user menu for authenticated users
  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#f3f4f6';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <UserCircleIcon style={{ width: '32px', height: '32px', color: '#4b5563' }} />
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#111827'
          }}>
            {user?.firstName || user?.fullName || 'User'}
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {user?.email}
          </span>
        </div>
        <ChevronDownIcon 
          style={{
            width: '16px',
            height: '16px',
            color: '#6b7280',
            transition: 'transform 0.2s ease',
            transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          marginTop: '0.5rem',
          width: '224px',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          padding: '0.25rem 0',
          zIndex: 50
        }}>
          {/* User Info */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#111827',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              {user?.firstName || user?.fullName || 'User'}
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email}
            </p>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '0.25rem 0' }}>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: '#374151',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => setIsMenuOpen(false)}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <UserIcon style={{ width: '16px', height: '16px' }} />
              Profile
            </Link>
            
            <Link
              to="/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: '#374151',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => setIsMenuOpen(false)}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Cog6ToothIcon style={{ width: '16px', height: '16px' }} />
              Settings
            </Link>
          </div>

          {/* Logout */}
          <div style={{
            borderTop: '1px solid #f3f4f6',
            padding: '0.25rem 0'
          }}>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: isLoggingOut ? '#9ca3af' : '#dc2626',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                if (!isLoggingOut) {
                  e.target.style.backgroundColor = '#fef2f2';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoggingOut) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <ArrowRightOnRectangleIcon style={{ width: '16px', height: '16px' }} />
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
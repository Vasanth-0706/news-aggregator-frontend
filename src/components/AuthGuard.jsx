import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * Enhanced authentication guard component that handles both protected and public routes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 * @param {string} props.redirectTo - Where to redirect based on auth state
 * @param {boolean} props.showLoading - Whether to show loading spinner (default: true)
 * @returns {React.ReactElement} Auth guard component
 */
const AuthGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo, 
  showLoading = true 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading && showLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" ariaLabel="Checking authentication..." />
      </div>
    );
  }

  // Handle protected routes (requireAuth = true)
  if (requireAuth) {
    if (!isAuthenticated) {
      // Redirect to login with current location for return after login
      const loginRedirect = redirectTo || '/login';
      return (
        <Navigate 
          to={loginRedirect} 
          state={{ from: location.pathname }} 
          replace 
        />
      );
    }
    // User is authenticated, render protected content
    return children;
  }

  // Handle public routes (requireAuth = false)
  if (isAuthenticated) {
    // User is authenticated but trying to access public route (like login/signup)
    // Redirect to intended destination or home
    const homeRedirect = redirectTo || location.state?.from || '/';
    return <Navigate to={homeRedirect} replace />;
  }

  // User is not authenticated, render public content
  return children;
};

export default AuthGuard;
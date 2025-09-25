import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * Component for public routes that should redirect authenticated users
 * Typically used for login/signup pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @param {string} props.redirectTo - Where to redirect if authenticated (default: '/')
 * @returns {React.ReactElement} Public route component
 */
const PublicRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If authenticated, redirect to home or intended destination
  if (isAuthenticated) {
    // Check if there's a stored location to redirect to
    const from = location.state?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  // If not authenticated, render the public content
  return children;
};

export default PublicRoute;
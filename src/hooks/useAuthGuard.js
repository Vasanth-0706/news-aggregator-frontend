import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Custom hook for authentication guards and redirects
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAuth - Whether authentication is required
 * @param {string} options.redirectTo - Where to redirect if auth check fails
 * @param {boolean} options.immediate - Whether to redirect immediately (default: true)
 * @returns {Object} Auth guard state and utilities
 */
export const useAuthGuard = ({ 
  requireAuth = true, 
  redirectTo, 
  immediate = true 
} = {}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const shouldRedirect = !loading && (
    (requireAuth && !isAuthenticated) || 
    (!requireAuth && isAuthenticated)
  );

  const getRedirectPath = () => {
    if (requireAuth && !isAuthenticated) {
      // Redirect to login for protected routes
      return redirectTo || '/login';
    }
    if (!requireAuth && isAuthenticated) {
      // Redirect to home for public routes when authenticated
      return redirectTo || location.state?.from || '/';
    }
    return null;
  };

  useEffect(() => {
    if (shouldRedirect && immediate) {
      const redirectPath = getRedirectPath();
      if (redirectPath) {
        if (requireAuth && !isAuthenticated) {
          // Store current location for return after login
          navigate(redirectPath, { 
            state: { from: location.pathname },
            replace: true 
          });
        } else {
          navigate(redirectPath, { replace: true });
        }
      }
    }
  }, [shouldRedirect, immediate, requireAuth, isAuthenticated, navigate, location, redirectTo]);

  return {
    isAuthenticated,
    loading,
    user,
    shouldRedirect,
    redirectPath: getRedirectPath(),
    canAccess: !shouldRedirect
  };
};

/**
 * Hook specifically for protected routes
 * @param {string} redirectTo - Where to redirect if not authenticated
 * @returns {Object} Protected route state
 */
export const useProtectedRoute = (redirectTo = '/login') => {
  return useAuthGuard({ requireAuth: true, redirectTo });
};

/**
 * Hook specifically for public routes (like login/signup)
 * @param {string} redirectTo - Where to redirect if authenticated
 * @returns {Object} Public route state
 */
export const usePublicRoute = (redirectTo = '/') => {
  return useAuthGuard({ requireAuth: false, redirectTo });
};

// Legacy aliases for backward compatibility
export const useRequireAuth = useProtectedRoute;
export const useRedirectIfAuthenticated = usePublicRoute;

export default useAuthGuard;
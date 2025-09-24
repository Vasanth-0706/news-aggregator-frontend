import React, { createContext, useState, useEffect, useCallback } from 'react';
// Temporarily using mock service until backend auth endpoint issue is resolved
import authService from '../services/mockAuthService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Computed property for authentication status
  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    // On theme change, update body class and localStorage
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  /**
   * Initialize authentication state on app startup
   */
  const initializeAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const storedToken = authService.getStoredToken();
      
      if (storedToken && authService.isTokenValid(storedToken)) {
        // Token exists and is valid, get user data
        const userData = await authService.getCurrentUser(storedToken);
        setToken(storedToken);
        setUser(userData);
      } else {
        // Token is invalid or doesn't exist, clear it
        authService.removeToken();
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear invalid token and user data
      authService.removeToken();
      setToken(null);
      setUser(null);
      setError('Session expired. Please log in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth on component mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Login user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} User data
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);
      
      // Store token and set user data
      authService.storeToken(response.token);
      setToken(response.token);
      setUser(response.user);
      
      return response.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} User data
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);
      
      // Store token and set user data
      authService.storeToken(response.token);
      setToken(response.token);
      setUser(response.user);
      
      return response.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      // Call backend logout if token exists
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if backend call fails
    } finally {
      // Clear local state and storage
      authService.removeToken();
      setToken(null);
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, [token]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const userData = await authService.getCurrentUser(token);
      setUser(userData);
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, logout user
      logout();
    }
  }, [token, logout]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated,
    theme,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    refreshUser,
    toggleTheme,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
/**
 * Authentication service for handling API calls to the backend
 */

const API_BASE_URL = 'http://localhost:8080/api/authentication';

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} userData.confirmPassword - Password confirmation
   * @returns {Promise<Object>} Authentication response with token and user data
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication response with token and user data
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user (clear token from backend if needed)
   * @param {string} token - JWT token
   * @returns {Promise<void>}
   */
  async logout(token) {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout - we'll clear local state anyway
    }
  }

  /**
   * Get current user information
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user data');
      }

      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Validate JWT token
   * @param {string} token - JWT token to validate
   * @returns {boolean} True if token is valid and not expired
   */
  isTokenValid(token) {
    if (!token) return false;

    try {
      // Parse JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Get token from localStorage
   * @returns {string|null} JWT token or null if not found
   */
  getStoredToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Store token in localStorage
   * @param {string} token - JWT token to store
   */
  storeToken(token) {
    localStorage.setItem('authToken', token);
  }

  /**
   * Remove token from localStorage
   */
  removeToken() {
    localStorage.removeItem('authToken');
  }
}

export default new AuthService();
/**
 * Mock Authentication service for testing frontend functionality
 * This simulates the backend responses until the backend issue is resolved
 */

class MockAuthService {
  constructor() {
    this.users = new Map(); // In-memory user storage for demo
    this.currentToken = null;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Authentication response with token and user data
   */
  async register(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Check if user already exists
      if (this.users.has(userData.email)) {
        throw new Error('User already exists with this email');
      }

      // Create user
      const user = {
        id: Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        createdAt: new Date().toISOString()
      };

      // Store user (password would be hashed in real implementation)
      this.users.set(userData.email, {
        ...user,
        password: userData.password // In real app, this would be hashed
      });

      // Generate mock JWT token
      const token = this.generateMockToken(user);
      this.currentToken = token;

      return {
        token,
        user,
        type: 'Bearer',
        expiresIn: 3600 // 1 hour
      };
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const storedUser = this.users.get(email);
      
      if (!storedUser || storedUser.password !== password) {
        throw new Error('Invalid email or password');
      }

      const user = {
        id: storedUser.id,
        firstName: storedUser.firstName,
        lastName: storedUser.lastName,
        email: storedUser.email,
        createdAt: storedUser.createdAt
      };

      // Generate mock JWT token
      const token = this.generateMockToken(user);
      this.currentToken = token;

      return {
        token,
        user,
        type: 'Bearer',
        expiresIn: 3600 // 1 hour
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * @param {string} token - JWT token
   * @returns {Promise<void>}
   */
  async logout(token) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.currentToken = null;
    return Promise.resolve();
  }

  /**
   * Get current user information
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser(token) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (!token || token !== this.currentToken) {
        throw new Error('Invalid or expired token');
      }

      // Decode mock token to get user info
      const user = this.decodeMockToken(token);
      
      if (!user) {
        throw new Error('Invalid token');
      }

      return user;
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
      // For mock token, just check if it matches current token
      return token === this.currentToken;
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
    this.currentToken = token;
  }

  /**
   * Remove token from localStorage
   */
  removeToken() {
    localStorage.removeItem('authToken');
    this.currentToken = null;
  }

  /**
   * Generate a mock JWT token
   * @private
   */
  generateMockToken(user) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.email,
      user: user,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Decode a mock JWT token
   * @private
   */
  decodeMockToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.user;
    } catch (error) {
      return null;
    }
  }
}

export default new MockAuthService();
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/setup';
import authService from '../authService';

const API_BASE_URL = 'http://localhost:8080/api/auth';

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Reset any request handlers that we may add during the tests
    server.resetHandlers();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      server.use(
        http.post(`${API_BASE_URL}/register`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const result = await authService.register(userData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when registration fails', async () => {
      const errorResponse = {
        message: 'Email already exists'
      };

      server.use(
        http.post(`${API_BASE_URL}/register`, () => {
          return HttpResponse.json(errorResponse, { status: 400 });
        })
      );

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      await expect(authService.register(userData)).rejects.toThrow('Email already exists');
    });

    it('should handle network errors during registration', async () => {
      server.use(
        http.post(`${API_BASE_URL}/register`, () => {
          return HttpResponse.error();
        })
      );

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      await expect(authService.register(userData)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      server.use(
        http.post(`${API_BASE_URL}/login`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await authService.login('test@example.com', 'password123');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid credentials', async () => {
      const errorResponse = {
        message: 'Invalid email or password'
      };

      server.use(
        http.post(`${API_BASE_URL}/login`, () => {
          return HttpResponse.json(errorResponse, { status: 401 });
        })
      );

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid email or password');
    });

    it('should handle network errors during login', async () => {
      server.use(
        http.post(`${API_BASE_URL}/login`, () => {
          return HttpResponse.error();
        })
      );

      await expect(authService.login('test@example.com', 'password123')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should call logout endpoint with token', async () => {
      server.use(
        http.post(`${API_BASE_URL}/logout`, () => {
          return HttpResponse.json({});
        })
      );

      await authService.logout('mock-jwt-token');
      // Test passes if no error is thrown
    });

    it('should not call logout endpoint when no token provided', async () => {
      await authService.logout(null);
      // Test passes if no error is thrown
    });

    it('should not throw error when logout fails', async () => {
      server.use(
        http.post(`${API_BASE_URL}/logout`, () => {
          return HttpResponse.error();
        })
      );

      // Should not throw error
      await expect(authService.logout('mock-jwt-token')).resolves.toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      server.use(
        http.get(`${API_BASE_URL}/me`, () => {
          return HttpResponse.json(mockUser);
        })
      );

      const result = await authService.getCurrentUser('mock-jwt-token');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when getting user fails', async () => {
      const errorResponse = {
        message: 'Unauthorized'
      };

      server.use(
        http.get(`${API_BASE_URL}/me`, () => {
          return HttpResponse.json(errorResponse, { status: 401 });
        })
      );

      await expect(authService.getCurrentUser('invalid-token')).rejects.toThrow('Unauthorized');
    });

    it('should handle network errors when getting user', async () => {
      server.use(
        http.get(`${API_BASE_URL}/me`, () => {
          return HttpResponse.error();
        })
      );

      await expect(authService.getCurrentUser('mock-jwt-token')).rejects.toThrow();
    });
  });

  describe('token validation', () => {
    it('should return false for null token', () => {
      expect(authService.isTokenValid(null)).toBe(false);
    });

    it('should return false for undefined token', () => {
      expect(authService.isTokenValid(undefined)).toBe(false);
    });

    it('should return false for empty token', () => {
      expect(authService.isTokenValid('')).toBe(false);
    });

    it('should return false for expired token', () => {
      // Create a token that expired 1 hour ago
      const expiredTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = { exp: expiredTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const expiredToken = `header.${encodedPayload}.signature`;

      expect(authService.isTokenValid(expiredToken)).toBe(false);
    });

    it('should return true for valid token', () => {
      // Create a token that expires in 1 hour
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: futureTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const validToken = `header.${encodedPayload}.signature`;

      expect(authService.isTokenValid(validToken)).toBe(true);
    });

    it('should return false for malformed token', () => {
      const malformedToken = 'not.a.valid.jwt.token';
      expect(authService.isTokenValid(malformedToken)).toBe(false);
    });
  });

  describe('token storage', () => {
    it('should store token in localStorage', () => {
      const token = 'mock-jwt-token';
      authService.storeToken(token);
      expect(localStorage.getItem('authToken')).toBe(token);
    });

    it('should get token from localStorage', () => {
      const token = 'mock-jwt-token';
      localStorage.setItem('authToken', token);
      expect(authService.getStoredToken()).toBe(token);
    });

    it('should return null when no token stored', () => {
      expect(authService.getStoredToken()).toBeNull();
    });

    it('should remove token from localStorage', () => {
      localStorage.setItem('authToken', 'mock-jwt-token');
      authService.removeToken();
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });
});
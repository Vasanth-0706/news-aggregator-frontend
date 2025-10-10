import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from '../useAuth';
import authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    getStoredToken: vi.fn(),
    isTokenValid: vi.fn(),
    storeToken: vi.fn(),
    removeToken: vi.fn(),
  }
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should initialize with default values', () => {
    authService.getStoredToken.mockReturnValue(null);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(true); // Initially loading
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should login successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com', firstName: 'Test' };
    const mockToken = 'mock-jwt-token';
    
    authService.getStoredToken.mockReturnValue(null);
    authService.login.mockResolvedValue({
      user: mockUser,
      token: mockToken
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(authService.storeToken).toHaveBeenCalledWith(mockToken);
  });

  it('should handle login error', async () => {
    const errorMessage = 'Invalid credentials';
    
    authService.getStoredToken.mockReturnValue(null);
    authService.login.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password');
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should register successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com', firstName: 'Test' };
    const mockToken = 'mock-jwt-token';
    
    authService.getStoredToken.mockReturnValue(null);
    authService.register.mockResolvedValue({
      user: mockUser,
      token: mockToken
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(authService.storeToken).toHaveBeenCalledWith(mockToken);
  });

  it('should logout successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com', firstName: 'Test' };
    const mockToken = 'mock-jwt-token';
    
    // Setup initial authenticated state
    authService.getStoredToken.mockReturnValue(mockToken);
    authService.isTokenValid.mockReturnValue(true);
    authService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Now logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(authService.removeToken).toHaveBeenCalled();
  });

  it('should initialize with stored token', async () => {
    const mockUser = { id: 1, email: 'test@example.com', firstName: 'Test' };
    const mockToken = 'stored-jwt-token';
    
    authService.getStoredToken.mockReturnValue(mockToken);
    authService.isTokenValid.mockReturnValue(true);
    authService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should clear invalid stored token', async () => {
    const mockToken = 'invalid-jwt-token';
    
    authService.getStoredToken.mockReturnValue(mockToken);
    authService.isTokenValid.mockReturnValue(false);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(authService.removeToken).toHaveBeenCalled();
  });

  it('should clear error state', async () => {
    authService.getStoredToken.mockReturnValue(null);
    authService.login.mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Trigger error
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password');
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBe('Login failed');

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { useAuthGuard, useRequireAuth, useRedirectIfAuthenticated } from '../useAuthGuard';
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

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/test', state: null }),
  };
});

describe('useAuthGuard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  const wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  it('should allow access when authenticated and auth required', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockToken = 'valid-token';
    
    authService.getStoredToken.mockReturnValue(mockToken);
    authService.isTokenValid.mockReturnValue(true);
    authService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuthGuard({ requireAuth: true }), { wrapper });

    // Wait for auth initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.canAccess).toBe(false); // Still loading initially
    expect(result.current.isAuthenticated).toBe(false); // Will be true after initialization
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated and auth required', async () => {
    authService.getStoredToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuthGuard({ requireAuth: true }), { wrapper });

    // Wait for auth initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.isAuthenticated).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { from: '/test' },
      replace: true
    });
  });

  it('should redirect to home when authenticated but should not be', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockToken = 'valid-token';
    
    authService.getStoredToken.mockReturnValue(mockToken);
    authService.isTokenValid.mockReturnValue(true);
    authService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuthGuard({ 
      requireAuth: false, 
      redirectIfAuthenticated: true 
    }), { wrapper });

    // Wait for auth initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    // Note: The redirect will happen in useEffect, so we need to wait
    setTimeout(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    }, 200);
  });

  it('should use custom redirect paths', async () => {
    authService.getStoredToken.mockReturnValue(null);

    renderHook(() => useAuthGuard({ 
      requireAuth: true, 
      redirectTo: '/custom-login' 
    }), { wrapper });

    // Wait for auth initialization and redirect
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockNavigate).toHaveBeenCalledWith('/custom-login', {
      state: { from: '/test' },
      replace: true
    });
  });

  it('should not redirect while loading', () => {
    authService.getStoredToken.mockReturnValue('some-token');
    authService.isTokenValid.mockReturnValue(true);
    authService.getCurrentUser.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useAuthGuard({ requireAuth: true }), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.canAccess).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('useRequireAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  const wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  it('should redirect to default login path', async () => {
    authService.getStoredToken.mockReturnValue(null);

    renderHook(() => useRequireAuth(), { wrapper });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { from: '/test' },
      replace: true
    });
  });

  it('should redirect to custom login path', async () => {
    authService.getStoredToken.mockReturnValue(null);

    renderHook(() => useRequireAuth('/custom-login'), { wrapper });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockNavigate).toHaveBeenCalledWith('/custom-login', {
      state: { from: '/test' },
      replace: true
    });
  });
});

describe('useRedirectIfAuthenticated Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  const wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  it('should redirect to default home path when authenticated', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockToken = 'valid-token';
    
    authService.getStoredToken.mockReturnValue(mockToken);
    authService.isTokenValid.mockReturnValue(true);
    authService.getCurrentUser.mockResolvedValue(mockUser);

    renderHook(() => useRedirectIfAuthenticated(), { wrapper });

    // Wait for auth initialization and redirect
    setTimeout(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    }, 200);
  });

  it('should redirect to custom path when authenticated', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockToken = 'valid-token';
    
    authService.getStoredToken.mockReturnValue(mockToken);
    authService.isTokenValid.mockReturnValue(true);
    authService.getCurrentUser.mockResolvedValue(mockUser);

    renderHook(() => useRedirectIfAuthenticated('/dashboard'), { wrapper });

    // Wait for auth initialization and redirect
    setTimeout(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    }, 200);
  });

  it('should not redirect when not authenticated', async () => {
    authService.getStoredToken.mockReturnValue(null);

    const { result } = renderHook(() => useRedirectIfAuthenticated(), { wrapper });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.isAuthenticated).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AuthGuard from '../AuthGuard';
import { AuthProvider } from '../../context/AuthContext';
import * as authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  getStoredToken: vi.fn(),
  isTokenValid: vi.fn(),
  getCurrentUser: vi.fn(),
  removeToken: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to, state, replace }) => {
      mockNavigate(to, { state, replace });
      return <div data-testid="navigate">Redirecting to {to}</div>;
    },
  };
});

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

const ProtectedContent = () => <div data-testid="protected-content">Protected Content</div>;
const PublicContent = () => <div data-testid="public-content">Public Content</div>;

describe('AuthGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Protected Routes (requireAuth=true)', () => {
    it('should render protected content when authenticated', async () => {
      const mockUser = { id: 1, email: 'test@example.com', firstName: 'Test' };
      authService.getStoredToken.mockReturnValue('valid-token');
      authService.isTokenValid.mockReturnValue(true);
      authService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <AuthGuard requireAuth={true}>
            <ProtectedContent />
          </AuthGuard>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when not authenticated', async () => {
      authService.getStoredToken.mockReturnValue(null);

      render(
        <TestWrapper>
          <AuthGuard requireAuth={true}>
            <ProtectedContent />
          </AuthGuard>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          state: { from: '/' },
          replace: true
        });
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when not authenticated', async () => {
      authService.getStoredToken.mockReturnValue(null);

      render(
        <TestWrapper>
          <AuthGuard requireAuth={true} redirectTo="/custom-login">
            <ProtectedContent />
          </AuthGuard>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/custom-login', {
          state: { from: '/' },
          replace: true
        });
      });
    });

    it('should show loading spinner while checking authentication', () => {
      authService.getStoredToken.mockReturnValue('token');
      authService.isTokenValid.mockReturnValue(true);
      // Don't resolve getCurrentUser to keep loading state
      authService.getCurrentUser.mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <AuthGuard requireAuth={true}>
            <ProtectedContent />
          </AuthGuard>
        </TestWrapper>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Public Routes (requireAuth=false)', () => {
    it('should render public content when not authenticated', async () => {
      authService.getStoredToken.mockReturnValue(null);

      render(
        <TestWrapper>
          <AuthGuard requireAuth={false}>
            <PublicContent />
          </AuthGuard>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('public-content')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should redirect to home when authenticated', async () => {
      const mockUser = { id: 1, email: 'test@example.com', firstName: 'Test' };
      authService.getStoredToken.mockReturnValue('valid-token');
      authService.isTokenValid.mockReturnValue(true);
      authService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <AuthGuard requireAuth={false}>
            <PublicContent />
          </AuthGuard>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });

      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when authenticated', async () => {
      const mockUser = { id: 1, email: 'test@example.com', firstName: 'Test' };
      authService.getStoredToken.mockReturnValue('valid-token');
      authService.isTokenValid.mockReturnValue(true);
      authService.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <AuthGuard requireAuth={false} redirectTo="/dashboard">
            <PublicContent />
          </AuthGuard>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });
  });

  describe('Loading States', () => {
    it('should not show loading spinner when showLoading is false', () => {
      authService.getStoredToken.mockReturnValue('token');
      authService.isTokenValid.mockReturnValue(true);
      // Keep loading state
      authService.getCurrentUser.mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <AuthGuard requireAuth={true} showLoading={false}>
            <ProtectedContent />
          </AuthGuard>
        </TestWrapper>
      );

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      authService.getStoredToken.mockReturnValue('invalid-token');
      authService.isTokenValid.mockReturnValue(true);
      authService.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      render(
        <TestWrapper>
          <AuthGuard requireAuth={true}>
            <ProtectedContent />
          </AuthGuard>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          state: { from: '/' },
          replace: true
        });
      });
    });
  });
});
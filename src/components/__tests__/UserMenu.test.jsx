import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UserMenu from '../UserMenu';
import { AuthProvider } from '../../context/AuthContext';
import * as authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  getStoredToken: vi.fn(),
  isTokenValid: vi.fn(),
  getCurrentUser: vi.fn(),
  removeToken: vi.fn(),
  logout: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>{children}</a>
    ),
  };
});

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('UserMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      authService.getStoredToken.mockReturnValue(null);
    });

    it('should show login and signup buttons when not authenticated', async () => {
      render(
        <TestWrapper>
          <UserMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Log In')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
      });
    });

    it('should have correct links for login and signup', async () => {
      render(
        <TestWrapper>
          <UserMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        const loginLink = screen.getByText('Log In').closest('a');
        const signupLink = screen.getByText('Sign Up').closest('a');
        
        expect(loginLink).toHaveAttribute('href', '/login');
        expect(signupLink).toHaveAttribute('href', '/signup');
      });
    });
  });

  describe('Authenticated State', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    beforeEach(() => {
      authService.getStoredToken.mockReturnValue('valid-token');
      authService.isTokenValid.mockReturnValue(true);
      authService.getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should show user menu when authenticated', async () => {
      render(
        <TestWrapper>
          <UserMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('should show dropdown menu when clicked', async () => {
      render(
        <TestWrapper>
          <UserMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        const menuButton = screen.getByRole('button');
        fireEvent.click(menuButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });

    it('should handle logout when sign out is clicked', async () => {
      authService.logout.mockResolvedValue();

      render(
        <TestWrapper>
          <UserMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        const menuButton = screen.getByRole('button');
        fireEvent.click(menuButton);
      });

      await waitFor(() => {
        const signOutButton = screen.getByText('Sign Out');
        fireEvent.click(signOutButton);
      });

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should close menu when clicking outside', async () => {
      render(
        <div>
          <UserMenu />
          <div data-testid="outside">Outside</div>
        </div>
      );

      // Wait for auth to load
      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
      });

      // Open menu
      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));

      await waitFor(() => {
        expect(screen.queryByText('Profile')).not.toBeInTheDocument();
      });
    });

    it('should handle user with fullName instead of firstName', async () => {
      const userWithFullName = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Jane Smith'
      };

      authService.getCurrentUser.mockResolvedValue(userWithFullName);

      render(
        <TestWrapper>
          <UserMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton while checking authentication', () => {
      authService.getStoredToken.mockReturnValue('token');
      authService.isTokenValid.mockReturnValue(true);
      // Don't resolve to keep loading
      authService.getCurrentUser.mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <UserMenu />
        </TestWrapper>
      );

      expect(screen.getByRole('generic')).toHaveClass('animate-pulse');
    });
  });
});
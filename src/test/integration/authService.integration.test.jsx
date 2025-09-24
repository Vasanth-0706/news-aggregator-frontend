import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = 'http://localhost:8080/api/auth';

// Test component that uses the auth context
function TestAuthComponent() {
  const { user, login, register, logout, loading, error, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password123');
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && (
        <div data-testid="user-info">
          {user.firstName} {user.lastName} - {user.email}
        </div>
      )}
      {error && <div data-testid="error">{error}</div>}
      <button onClick={handleLogin} data-testid="login-btn">Login</button>
      <button onClick={handleRegister} data-testid="register-btn">Register</button>
      <button onClick={handleLogout} data-testid="logout-btn">Logout</button>
    </div>
  );
}

describe('AuthService Integration with AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

  it('should handle successful login flow', async () => {
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

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

    // Click login button
    fireEvent.click(screen.getByTestId('login-btn'));

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Check user info is displayed
    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe - test@example.com');

    // Check token is stored
    expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
  });

  it('should handle successful registration flow', async () => {
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

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

    // Click register button
    fireEvent.click(screen.getByTestId('register-btn'));

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Check user info is displayed
    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe - test@example.com');

    // Check token is stored
    expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
  });

  it('should handle logout flow', async () => {
    // Set up initial authenticated state
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    // Create a valid JWT token that expires in 1 hour
    const futureTime = Math.floor(Date.now() / 1000) + 3600;
    const payload = { exp: futureTime, sub: 'test@example.com' };
    const encodedPayload = btoa(JSON.stringify(payload));
    const validToken = `header.${encodedPayload}.signature`;

    localStorage.setItem('authToken', validToken);

    server.use(
      http.get(`${API_BASE_URL}/me`, () => {
        return HttpResponse.json(mockUser);
      }),
      http.post(`${API_BASE_URL}/logout`, () => {
        return HttpResponse.json({});
      })
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Click logout button
    fireEvent.click(screen.getByTestId('logout-btn'));

    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    // Check token is removed
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('should handle login error', async () => {
    const errorResponse = {
      message: 'Invalid credentials'
    };

    server.use(
      http.post(`${API_BASE_URL}/login`, () => {
        return HttpResponse.json(errorResponse, { status: 401 });
      })
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Click login button
    fireEvent.click(screen.getByTestId('login-btn'));

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });

    // Should still not be authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });

  it('should handle token persistence on app restart', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    // Create a valid JWT token that expires in 1 hour
    const futureTime = Math.floor(Date.now() / 1000) + 3600;
    const payload = { exp: futureTime, sub: 'test@example.com' };
    const encodedPayload = btoa(JSON.stringify(payload));
    const validToken = `header.${encodedPayload}.signature`;

    // Set up token in localStorage (simulating previous session)
    localStorage.setItem('authToken', validToken);

    server.use(
      http.get(`${API_BASE_URL}/me`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Should automatically authenticate on startup
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe - test@example.com');
  });

  it('should handle invalid token on app startup', async () => {
    // Set up invalid token in localStorage
    localStorage.setItem('authToken', 'invalid-token');

    server.use(
      http.get(`${API_BASE_URL}/me`, () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      })
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Should clear invalid token and show not authenticated
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    // Token should be removed from localStorage
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});
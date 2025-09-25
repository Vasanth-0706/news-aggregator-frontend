import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Home from '../Home';
import newsService from '../../services/newsService';

// Mock the news service
vi.mock('../../services/newsService');

// Mock router
const MockRouter = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Home Component - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Network Error Handling', () => {
    it('should display network error message when fetch fails', async () => {
      // Mock network error
      newsService.fetchNews.mockRejectedValue(
        new Error('Unable to connect to backend service. Please check if the backend is running.')
      );

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
        expect(screen.getByText(/Unable to connect to the news service/)).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should retry network request when retry button is clicked', async () => {
      // First call fails, second succeeds
      newsService.fetchNews
        .mockRejectedValueOnce(new Error('Unable to connect to backend service'))
        .mockResolvedValueOnce({
          articles: [
            {
              id: '1',
              title: 'Test Article',
              description: 'Test Description',
              url: 'https://example.com',
              source: { name: 'Test Source' }
            }
          ]
        });

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
      });

      // Click retry
      fireEvent.click(screen.getByText('Try Again'));

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });

      expect(newsService.fetchNews).toHaveBeenCalledTimes(2);
    });
  });

  describe('Rate Limit Error Handling', () => {
    it('should display rate limit error message', async () => {
      newsService.fetchNews.mockRejectedValue(
        new Error('Rate limit exceeded. Please try again later.')
      );

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
        expect(screen.getByText(/Too many requests/)).toBeInTheDocument();
      });
    });

    it('should implement exponential backoff for rate limit retries', async () => {
      vi.useFakeTimers();
      
      newsService.fetchNews.mockRejectedValue(
        new Error('Rate limit exceeded. Please try again later.')
      );

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
      });

      // First retry should be immediate
      fireEvent.click(screen.getByText(/Try Again/));
      expect(newsService.fetchNews).toHaveBeenCalledTimes(2);

      // Second retry should have delay
      fireEvent.click(screen.getByText(/Try Again/));
      expect(newsService.fetchNews).toHaveBeenCalledTimes(2); // Should not increase immediately

      vi.runAllTimers();
      await waitFor(() => {
        expect(newsService.fetchNews).toHaveBeenCalledTimes(3);
      });

      vi.useRealTimers();
    });
  });

  describe('Authentication Error Handling', () => {
    it('should display authentication error without retry option', async () => {
      newsService.fetchNews.mockRejectedValue(
        new Error('Backend API authentication failed. Please check NewsAPI configuration.')
      );

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Authentication Error')).toBeInTheDocument();
        expect(screen.getByText(/issue with the news service configuration/)).toBeInTheDocument();
      });

      // Should not show retry button for auth errors
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('Server Error Handling', () => {
    it('should display server error message', async () => {
      newsService.fetchNews.mockRejectedValue(
        new Error('Backend service is temporarily unavailable. Please try again later.')
      );

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Service Unavailable')).toBeInTheDocument();
        expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
      });
    });
  });

  describe('Fallback UI', () => {
    it('should show fallback UI when no articles and error exists', async () => {
      newsService.fetchNews.mockRejectedValue(
        new Error('Unable to connect to backend service')
      );

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to Load News')).toBeInTheDocument();
        expect(screen.getByText(/having trouble connecting/)).toBeInTheDocument();
      });

      // Should show both retry and refresh options
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    });

    it('should show no results message when no error and no articles', async () => {
      newsService.fetchNews.mockResolvedValue({
        articles: []
      });

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No Articles Found')).toBeInTheDocument();
        expect(screen.getByText(/No articles available/)).toBeInTheDocument();
      });
    });

    it('should show search-specific no results message', async () => {
      newsService.fetchNews.mockResolvedValue({
        articles: []
      });

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('No Articles Found')).toBeInTheDocument();
      });

      // Simulate search
      const searchInput = screen.getByPlaceholderText('Search news...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText(/No articles match your search for "nonexistent"/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should preserve articles when retry fails but previous data exists', async () => {
      const mockArticles = [
        {
          id: '1',
          title: 'Cached Article',
          description: 'This should remain visible',
          url: 'https://example.com',
          source: { name: 'Test Source' }
        }
      ];

      // First call succeeds, second fails
      newsService.fetchNews
        .mockResolvedValueOnce({ articles: mockArticles })
        .mockRejectedValueOnce(new Error('Network error'));

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      // Wait for initial success
      await waitFor(() => {
        expect(screen.getByText('Cached Article')).toBeInTheDocument();
      });

      // Trigger a retry that fails (simulate category change)
      const categoryButton = screen.getByText('Technology');
      fireEvent.click(categoryButton);

      // Should show error but keep articles
      await waitFor(() => {
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
        expect(screen.getByText('Cached Article')).toBeInTheDocument();
        expect(screen.getByText('Showing previously loaded articles')).toBeInTheDocument();
      });
    });

    it('should reset retry count on successful fetch', async () => {
      // Fail twice, then succeed
      newsService.fetchNews
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce({
          articles: [
            {
              id: '1',
              title: 'Success Article',
              description: 'Finally loaded',
              url: 'https://example.com',
              source: { name: 'Test Source' }
            }
          ]
        });

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      // Wait for first error
      await waitFor(() => {
        expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
      });

      // First retry
      fireEvent.click(screen.getByText('Try Again'));
      
      await waitFor(() => {
        expect(screen.getByText(/Try Again \(1\)/)).toBeInTheDocument();
      });

      // Second retry - should succeed
      fireEvent.click(screen.getByText(/Try Again \(1\)/));

      await waitFor(() => {
        expect(screen.getByText('Success Article')).toBeInTheDocument();
      });

      // Retry count should be reset - trigger another error to verify
      newsService.fetchNews.mockRejectedValueOnce(new Error('Rate limit exceeded'));
      
      const categoryButton = screen.getByText('Technology');
      fireEvent.click(categoryButton);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument(); // No retry count
      });
    });
  });

  describe('Loading States', () => {
    it('should show different loading states for initial load vs retry', async () => {
      newsService.fetchNews.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ articles: [] }), 100))
      );

      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      // Should show loading skeletons initially
      expect(screen.getAllByText('', { selector: '.animate-pulse' })).toHaveLength(6);

      await waitFor(() => {
        expect(screen.getByText('No Articles Found')).toBeInTheDocument();
      });

      // Mock error for retry test
      newsService.fetchNews
        .mockRejectedValueOnce(new Error('Network error'))
        .mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ articles: [] }), 100))
        );

      // Trigger error
      const categoryButton = screen.getByText('Technology');
      fireEvent.click(categoryButton);

      await waitFor(() => {
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
      });

      // Click retry - should show "Retrying..." state
      fireEvent.click(screen.getByText('Try Again'));
      expect(screen.getByText('Retrying...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('No Articles Found')).toBeInTheDocument();
      });
    });
  });
});
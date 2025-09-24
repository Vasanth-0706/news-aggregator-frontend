import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimizedNews } from '../useOptimizedNews';
import { vi } from 'vitest';

// Mock the news service
vi.mock('../../services/newsService', () => ({
  default: {
    fetchNews: vi.fn(),
    isCached: vi.fn(),
    _generateCacheKey: vi.fn(),
    _getFromCache: vi.fn(),
    clearCache: vi.fn(),
    getCacheStats: vi.fn()
  }
}));

import newsService from '../../services/newsService';

// Mock timers
vi.useFakeTimers();

describe('useOptimizedNews', () => {
  const mockArticles = [
    {
      id: '1',
      title: 'Test Article 1',
      description: 'Test description 1',
      url: 'https://example.com/1',
      urlToImage: 'https://example.com/image1.jpg',
      source: { name: 'Test Source 1' },
      publishedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Test Article 2',
      description: 'Test description 2',
      url: 'https://example.com/2',
      urlToImage: 'https://example.com/image2.jpg',
      source: { name: 'Test Source 2' },
      publishedAt: '2024-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // Reset news service mocks
    newsService.fetchNews.mockResolvedValue({ articles: mockArticles });
    newsService.isCached.mockReturnValue(false);
    newsService._generateCacheKey.mockImplementation(({ category = 'all', query = '' }) => 
      `${category.toLowerCase()}-${query.toLowerCase().trim()}`
    );
    newsService._getFromCache.mockReturnValue(null);
    newsService.clearCache.mockImplementation(() => {});
    newsService.getCacheStats.mockReturnValue({
      totalEntries: 0,
      validEntries: 0,
      expiredEntries: 0,
      ongoingRequests: 0
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useOptimizedNews());

    expect(result.current.articles).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.selectedCategory).toBe('All');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.isSearching).toBe(false);
  });

  test('should fetch news on initial load', async () => {
    const { result } = renderHook(() => useOptimizedNews());

    expect(newsService.fetchNews).toHaveBeenCalledWith({
      category: 'All',
      query: '',
      useCache: true
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.articles).toEqual(mockArticles);
  });

  test('should handle category changes with immediate cached data', async () => {
    // Setup cached data
    const cachedData = { articles: [mockArticles[0]], fromCache: true };
    newsService.isCached.mockReturnValue(true);
    newsService._getFromCache.mockReturnValue(cachedData);

    const { result } = renderHook(() => useOptimizedNews());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change category
    act(() => {
      result.current.handleCategoryChange('Technology');
    });

    // Should immediately show cached data
    expect(result.current.selectedCategory).toBe('Technology');
    expect(result.current.articles).toEqual([mockArticles[0]]);
  });

  test('should debounce search queries', async () => {
    const { result } = renderHook(() => useOptimizedNews({ debounceDelay: 300 }));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the initial call
    vi.clearAllMocks();

    // Rapid search changes
    act(() => {
      result.current.handleSearchChange('test');
    });

    expect(result.current.isSearching).toBe(true);

    act(() => {
      result.current.handleSearchChange('test search');
    });

    // Should not have made API calls yet
    expect(newsService.fetchNews).not.toHaveBeenCalled();

    // Fast forward time to complete debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now should make API call
    await waitFor(() => {
      expect(newsService.fetchNews).toHaveBeenCalledWith({
        category: 'All',
        query: 'test search',
        useCache: true
      });
    });

    expect(result.current.isSearching).toBe(false);
  });

  test('should handle API errors correctly', async () => {
    const errorMessage = 'Rate limit exceeded. Please try again later.';
    newsService.fetchNews.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useOptimizedNews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.errorType).toBe('RATE_LIMIT');
    expect(result.current.articles).toEqual([]);
  });

  test('should handle retry with exponential backoff for rate limits', async () => {
    const errorMessage = 'Rate limit exceeded. Please try again later.';
    newsService.fetchNews
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValueOnce({ articles: mockArticles });

    const { result } = renderHook(() => useOptimizedNews());

    // Wait for initial error
    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    // First retry should be immediate
    act(() => {
      result.current.handleRetry();
    });

    expect(result.current.isRetrying).toBe(true);

    await waitFor(() => {
      expect(result.current.isRetrying).toBe(false);
    });

    expect(result.current.articles).toEqual(mockArticles);
    expect(result.current.error).toBe(null);
  });

  test('should provide cache management functions', () => {
    const { result } = renderHook(() => useOptimizedNews());

    expect(typeof result.current.clearCache).toBe('function');
    expect(typeof result.current.getCacheStats).toBe('function');

    // Test cache functions
    act(() => {
      result.current.clearCache();
    });

    expect(newsService.clearCache).toHaveBeenCalled();

    act(() => {
      const stats = result.current.getCacheStats();
      expect(stats).toEqual({
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        ongoingRequests: 0
      });
    });
  });

  test('should handle network errors correctly', async () => {
    const networkError = new Error('Unable to connect to backend service. Please check if the backend is running.');
    newsService.fetchNews.mockRejectedValue(networkError);

    const { result } = renderHook(() => useOptimizedNews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(networkError.message);
    expect(result.current.errorType).toBe('NETWORK_ERROR');
  });

  test('should not clear articles on retry if cached data exists', async () => {
    const errorMessage = 'Server error';
    newsService.fetchNews.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useOptimizedNews());

    // Set some articles first
    act(() => {
      result.current.articles = mockArticles;
    });

    // Wait for error
    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    // Retry should not clear articles
    act(() => {
      result.current.handleRetry();
    });

    // Articles should still be there during retry
    expect(result.current.articles.length).toBeGreaterThan(0);
  });

  test('should handle custom configuration options', () => {
    const customOptions = {
      debounceDelay: 500,
      enableCache: false,
      initialCategory: 'Technology',
      initialSearchQuery: 'test query'
    };

    const { result } = renderHook(() => useOptimizedNews(customOptions));

    expect(result.current.selectedCategory).toBe('Technology');
    expect(result.current.searchQuery).toBe('test query');

    // Should call with cache disabled
    expect(newsService.fetchNews).toHaveBeenCalledWith({
      category: 'Technology',
      query: 'test query',
      useCache: false
    });
  });
});
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedSearch } from './useDebounce';
import newsService from '../services/newsService';

/**
 * Custom hook for optimized news fetching with caching, debouncing, and deduplication
 * @param {Object} options - Configuration options
 * @returns {Object} News state and handlers
 */
export const useOptimizedNews = (options = {}) => {
  const {
    debounceDelay = 300,
    enableCache = true,
    initialCategory = 'All',
    initialSearchQuery = ''
  } = options;

  // State management
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Debounced search
  const { debouncedSearchTerm, isSearching } = useDebouncedSearch(searchQuery, debounceDelay);

  // Refs for tracking
  const lastFetchParams = useRef(null);
  const abortController = useRef(null);

  // Determine error type based on error message
  const getErrorType = useCallback((errorMessage) => {
    if (errorMessage.includes('Rate limit exceeded') || errorMessage.includes('429')) {
      return 'RATE_LIMIT';
    }
    if (errorMessage.includes('authentication failed') || errorMessage.includes('401')) {
      return 'AUTH_ERROR';
    }
    if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('500')) {
      return 'SERVER_ERROR';
    }
    if (errorMessage.includes('Unable to connect') || errorMessage.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }, []);

  // Check if we have cached data for immediate display
  const getCachedDataIfAvailable = useCallback((category, query) => {
    if (!enableCache) return null;
    
    const params = { category, query };
    if (newsService.isCached(params)) {
      // Get cached data synchronously for immediate display
      const cacheKey = newsService._generateCacheKey(params);
      const cachedData = newsService._getFromCache(cacheKey);
      return cachedData;
    }
    return null;
  }, [enableCache]);

  // Fetch news data with optimization
  const fetchNews = useCallback(async (category, query, isRetry = false) => {
    // Cancel any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    // Check for immediate cached data for better UX
    const cachedData = getCachedDataIfAvailable(category, query);
    if (cachedData && !isRetry) {
      setArticles(cachedData.articles || []);
      setLoading(false);
      setError(null);
      setErrorType(null);
    }

    try {
      if (isRetry) {
        setIsRetrying(true);
      } else if (!cachedData) {
        setLoading(true);
      }
      
      setError(null);
      setErrorType(null);
      
      const params = { category, query, useCache: enableCache };
      lastFetchParams.current = params;
      
      console.log('Fetching news with params:', params);
      
      const data = await newsService.fetchNews(params);
      
      // Only update if this is still the latest request
      if (lastFetchParams.current === params) {
        console.log('Received news data:', data);
        setArticles(data?.articles || []);
        setRetryCount(0); // Reset retry count on success
      }
    } catch (error) {
      // Only handle error if this is still the latest request
      if (lastFetchParams.current && 
          lastFetchParams.current.category === category && 
          lastFetchParams.current.query === query) {
        
        console.error("Error fetching news:", error);
        const errorTypeValue = getErrorType(error.message);
        setError(error.message);
        setErrorType(errorTypeValue);
        
        // Don't clear articles if we have cached data and this is a retry
        if (!isRetry || articles.length === 0) {
          setArticles([]);
        }
      }
    } finally {
      if (lastFetchParams.current && 
          lastFetchParams.current.category === category && 
          lastFetchParams.current.query === query) {
        setLoading(false);
        setIsRetrying(false);
      }
    }
  }, [enableCache, getCachedDataIfAvailable, getErrorType, articles.length]);

  // Enhanced retry function with exponential backoff
  const handleRetry = useCallback(async () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // Implement exponential backoff for rate limit errors
    if (errorType === 'RATE_LIMIT' && newRetryCount > 1) {
      const delay = Math.min(1000 * Math.pow(2, newRetryCount - 1), 30000); // Max 30 seconds
      setTimeout(() => {
        fetchNews(selectedCategory, debouncedSearchTerm, true);
      }, delay);
    } else {
      await fetchNews(selectedCategory, debouncedSearchTerm, true);
    }
  }, [retryCount, errorType, selectedCategory, debouncedSearchTerm, fetchNews]);

  // Handle category change with immediate cached data display
  const handleCategoryChange = useCallback((newCategory) => {
    setSelectedCategory(newCategory);
    
    // Try to show cached data immediately for better UX
    const cachedData = getCachedDataIfAvailable(newCategory, debouncedSearchTerm);
    if (cachedData) {
      setArticles(cachedData.articles || []);
      setError(null);
      setErrorType(null);
    }
  }, [debouncedSearchTerm, getCachedDataIfAvailable]);

  // Handle search query change
  const handleSearchChange = useCallback((newQuery) => {
    setSearchQuery(newQuery);
  }, []);

  // Single effect to handle all news fetching
  useEffect(() => {
    // Skip if search is still being debounced
    if (debouncedSearchTerm !== searchQuery) {
      return;
    }
    
    fetchNews(selectedCategory, debouncedSearchTerm);
  }, [selectedCategory, debouncedSearchTerm, fetchNews]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Clear cache function
  const clearCache = useCallback(() => {
    newsService.clearCache();
  }, []);

  // Refresh function - clears cache and refetches current data
  const refresh = useCallback(async () => {
    // Clear cache first
    newsService.clearCache();
    // Then fetch fresh data
    await fetchNews(selectedCategory, debouncedSearchTerm, false);
  }, [selectedCategory, debouncedSearchTerm, fetchNews]);

  // Get cache stats
  const getCacheStats = useCallback(() => {
    return newsService.getCacheStats();
  }, []);

  return {
    // State
    articles,
    loading,
    error,
    errorType,
    retryCount,
    isRetrying,
    selectedCategory,
    searchQuery,
    isSearching,
    
    // Handlers
    handleRetry,
    handleCategoryChange,
    handleSearchChange,
    clearCache,
    refresh,
    getCacheStats,
    
    // Computed values
    hasArticles: articles.length > 0,
    isLoadingOrSearching: loading || isSearching
  };
};
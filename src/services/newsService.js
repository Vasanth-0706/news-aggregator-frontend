/**
 * News Service - Handles API communication with the backend
 */

import { mockNewsData } from './mockNewsData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

class NewsService {
  constructor() {
    // Cache for storing API responses
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    
    // Request deduplication - track ongoing requests
    this.ongoingRequests = new Map();
  }

  /**
   * Map frontend categories to backend categories
   * @param {string} category - Frontend category
   * @returns {string} Backend category
   */
  _mapCategoryToBackend(category) {
    const categoryMap = {
      'General': 'general',
      'Technology': 'technology',
      'Sports': 'sports',
      'Entertainment': 'entertainment',
      'Business': 'business',
      'Health': 'health',
      'Science': 'science'
    };
    
    return categoryMap[category] || category.toLowerCase();
  }

  /**
   * Generate cache key for request parameters
   * @param {Object} params - Request parameters
   * @returns {string} Cache key
   */
  _generateCacheKey(params = {}) {
    const { category = 'all', query = '' } = params;
    return `${category.toLowerCase()}-${query.toLowerCase().trim()}`;
  }

  /**
   * Check if cached data is still valid
   * @param {Object} cacheEntry - Cache entry with data and timestamp
   * @returns {boolean} Whether cache is valid
   */
  _isCacheValid(cacheEntry) {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < this.cacheTimeout;
  }

  /**
   * Get data from cache if available and valid
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} Cached data or null
   */
  _getFromCache(cacheKey) {
    const cacheEntry = this.cache.get(cacheKey);
    if (this._isCacheValid(cacheEntry)) {
      return { ...cacheEntry.data, fromCache: true };
    }
    
    // Remove expired cache entry
    if (cacheEntry) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Store data in cache
   * @param {string} cacheKey - Cache key
   * @param {Object} data - Data to cache
   */
  _setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data: { ...data, fromCache: false },
      timestamp: Date.now()
    });
  }

  /**
   * Clear expired cache entries
   */
  _cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
  /**
   * Fetch news articles from the backend API with caching and deduplication
   * @param {Object} options - Query options
   * @param {string} options.category - News category filter
   * @param {string} options.query - Search query
   * @param {boolean} options.useCache - Whether to use cache (default: true)
   * @returns {Promise<Object>} API response with articles
   */
  async fetchNews({ category = null, query = null, useCache = true } = {}) {
    // Clean up expired cache entries periodically
    this._cleanupCache();
    
    // Generate cache key
    const cacheKey = this._generateCacheKey({ category, query });
    
    // Check cache first if enabled
    if (useCache) {
      const cachedData = this._getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Check if there's an ongoing request for the same parameters
    if (this.ongoingRequests.has(cacheKey)) {
      // Return the existing promise to avoid duplicate requests
      return this.ongoingRequests.get(cacheKey);
    }
    // Create the request promise
    const requestPromise = this._performRequest({ category, query });
    
    // Store the ongoing request
    this.ongoingRequests.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      
      // Cache the successful result
      if (useCache) {
        this._setCache(cacheKey, result);
      }
      
      return result;
    } finally {
      // Remove from ongoing requests
      this.ongoingRequests.delete(cacheKey);
    }
  }

  /**
   * Perform the actual API request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response
   */
  async _performRequest({ category = null, query = null } = {}) {
    // Use mock data in development mode if enabled
    if (USE_MOCK_DATA) {
      // Add artificial delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
      return this._getMockData({ category, query });
    }

    try {
      const params = new URLSearchParams();
      
      if (category && category !== 'All') {
        params.append('category', this._mapCategoryToBackend(category));
      }
      
      if (query && query.trim()) {
        params.append('q', query.trim());
      }

      const url = `${API_BASE_URL}/news${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If we can't parse the error response, use the default message
        }
        
        if (response.status === 401) {
          errorMessage = 'Backend API authentication failed. Please check NewsAPI configuration.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = 'Backend service is temporarily unavailable. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch news');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to backend service. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  /**
   * Get filtered mock data for development
   * @param {Object} options - Filter options
   * @returns {Object} Filtered mock data
   */
  _getMockData({ category = null, query = null } = {}) {
    let articles = [...mockNewsData.data.articles];

    // Filter by category
    if (category && category !== 'All') {
      articles = articles.filter(article => 
        article.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search query
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.description.toLowerCase().includes(searchTerm)
      );
    }

    return {
      articles,
      totalResults: articles.length,
      page: 1,
      pageSize: 20
    };
  }

  /**
   * Fetch top headlines (general news)
   * @returns {Promise<Object>} API response with articles
   */
  async fetchTopHeadlines() {
    return this.fetchNews();
  }

  /**
   * Search news articles
   * @param {string} query - Search query
   * @returns {Promise<Object>} API response with articles
   */
  async searchNews(query) {
    return this.fetchNews({ query });
  }

  /**
   * Fetch news by category
   * @param {string} category - News category
   * @returns {Promise<Object>} API response with articles
   */
  async fetchNewsByCategory(category) {
    return this.fetchNews({ category });
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    this.ongoingRequests.clear();
  }

  /**
   * Clear cache for specific parameters
   * @param {Object} params - Parameters to clear cache for
   */
  clearCacheFor(params = {}) {
    const cacheKey = this._generateCacheKey(params);
    this.cache.delete(cacheKey);
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp < this.cacheTimeout) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      ongoingRequests: this.ongoingRequests.size
    };
  }

  /**
   * Check if data is available in cache for given parameters
   * @param {Object} params - Parameters to check
   * @returns {boolean} Whether data is cached
   */
  isCached(params = {}) {
    const cacheKey = this._generateCacheKey(params);
    const cacheEntry = this.cache.get(cacheKey);
    return this._isCacheValid(cacheEntry);
  }
}

// Export a singleton instance
export default new NewsService();
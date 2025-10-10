import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debounced search with loading state
 * @param {string} searchTerm - The search term to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Object} Object containing debouncedSearchTerm and isSearching
 */
export const useDebouncedSearch = (searchTerm, delay = 300) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Set searching state when search term changes
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }

    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay, debouncedSearchTerm]);

  return {
    debouncedSearchTerm,
    isSearching
  };
};
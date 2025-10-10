import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedSearch } from '../useDebounce';
import { vi } from 'vitest';

// Mock timers
vi.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  test('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  test('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time but not enough
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Fast forward enough time
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });

  test('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // Rapid changes
    rerender({ value: 'change1' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'change2' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'final' });
    
    // Should still be initial because timer keeps resetting
    expect(result.current).toBe('initial');

    // Now let it complete
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('final');
  });
});

describe('useDebouncedSearch', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  test('should return initial search term and not searching', () => {
    const { result } = renderHook(() => useDebouncedSearch('initial', 300));
    
    expect(result.current.debouncedSearchTerm).toBe('initial');
    expect(result.current.isSearching).toBe(false);
  });

  test('should set isSearching to true when search term changes', () => {
    const { result, rerender } = renderHook(
      ({ searchTerm }) => useDebouncedSearch(searchTerm, 300),
      { initialProps: { searchTerm: 'initial' } }
    );

    expect(result.current.isSearching).toBe(false);

    // Change search term
    rerender({ searchTerm: 'new search' });
    expect(result.current.isSearching).toBe(true);
    expect(result.current.debouncedSearchTerm).toBe('initial');
  });

  test('should update debounced term and set isSearching to false after delay', () => {
    const { result, rerender } = renderHook(
      ({ searchTerm }) => useDebouncedSearch(searchTerm, 300),
      { initialProps: { searchTerm: 'initial' } }
    );

    // Change search term
    rerender({ searchTerm: 'new search' });
    expect(result.current.isSearching).toBe(true);

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedSearchTerm).toBe('new search');
    expect(result.current.isSearching).toBe(false);
  });

  test('should handle rapid search changes correctly', () => {
    const { result, rerender } = renderHook(
      ({ searchTerm }) => useDebouncedSearch(searchTerm, 300),
      { initialProps: { searchTerm: 'initial' } }
    );

    // Rapid changes
    rerender({ searchTerm: 'search1' });
    expect(result.current.isSearching).toBe(true);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ searchTerm: 'search2' });
    expect(result.current.isSearching).toBe(true);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ searchTerm: 'final search' });
    expect(result.current.isSearching).toBe(true);

    // Should still be initial because timer keeps resetting
    expect(result.current.debouncedSearchTerm).toBe('initial');

    // Complete the debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedSearchTerm).toBe('final search');
    expect(result.current.isSearching).toBe(false);
  });

  test('should not set isSearching if term is same as debounced term', () => {
    const { result, rerender } = renderHook(
      ({ searchTerm }) => useDebouncedSearch(searchTerm, 300),
      { initialProps: { searchTerm: 'initial' } }
    );

    // Change and let it complete
    rerender({ searchTerm: 'new search' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isSearching).toBe(false);

    // Set to same value
    rerender({ searchTerm: 'new search' });
    expect(result.current.isSearching).toBe(false);
  });
});
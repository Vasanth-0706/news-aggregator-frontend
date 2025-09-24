/**
 * Test utilities for integration testing
 * Provides common mock data and helper functions
 */

// Mock news data for consistent testing
export const mockNewsData = {
  success: true,
  data: {
    articles: [
      {
        id: 'test-1',
        title: 'Test Article 1',
        description: 'This is a test article description',
        url: 'https://example.com/test-1',
        urlToImage: 'https://example.com/test-image-1.jpg',
        source: {
          id: 'test-source-1',
          name: 'Test Source 1'
        },
        author: 'Test Author 1',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'technology'
      },
      {
        id: 'test-2',
        title: 'Test Article 2',
        description: 'This is another test article description',
        url: 'https://example.com/test-2',
        urlToImage: 'https://example.com/test-image-2.jpg',
        source: {
          id: 'test-source-2',
          name: 'Test Source 2'
        },
        author: 'Test Author 2',
        publishedAt: '2024-01-15T11:00:00Z',
        category: 'business'
      }
    ],
    totalResults: 100,
    page: 1,
    pageSize: 20
  },
  message: null
}

// Mock error responses
export const mockErrorResponses = {
  networkError: {
    success: false,
    message: 'Unable to connect to backend service. Please check if the backend is running.',
    errorCode: 'NETWORK_ERROR'
  },
  rateLimitError: {
    success: false,
    message: 'Rate limit exceeded. Please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  },
  serviceUnavailable: {
    success: false,
    message: 'Backend service is temporarily unavailable. Please try again later.',
    errorCode: 'SERVICE_UNAVAILABLE'
  },
  unauthorized: {
    success: false,
    message: 'Backend API authentication failed. Please check NewsAPI configuration.',
    errorCode: 'UNAUTHORIZED'
  }
}

// Helper function to create mock API handlers
export const createMockApiHandlers = (baseUrl = 'http://localhost:8080/api') => {
  return {
    // Success handlers
    getNewsSuccess: (response = mockNewsData) => 
      http.get(`${baseUrl}/news`, () => HttpResponse.json(response)),
    
    getCategorySuccess: (category, response = mockNewsData) =>
      http.get(`${baseUrl}/news`, ({ request }) => {
        const url = new URL(request.url)
        const categoryParam = url.searchParams.get('category')
        if (categoryParam === category) {
          return HttpResponse.json(response)
        }
        return HttpResponse.json(mockNewsData)
      }),
    
    getSearchSuccess: (query, response = mockNewsData) =>
      http.get(`${baseUrl}/news`, ({ request }) => {
        const url = new URL(request.url)
        const queryParam = url.searchParams.get('q')
        if (queryParam === query) {
          return HttpResponse.json(response)
        }
        return HttpResponse.json(mockNewsData)
      }),
    
    // Error handlers
    getNewsError: (errorResponse, statusCode = 500) =>
      http.get(`${baseUrl}/news`, () => 
        HttpResponse.json(errorResponse, { status: statusCode })),
    
    getNewsNetworkError: () =>
      http.get(`${baseUrl}/news`, () => HttpResponse.error()),
    
    // Delayed response for testing loading states
    getNewsDelayed: (delay = 1000, response = mockNewsData) =>
      http.get(`${baseUrl}/news`, async () => {
        await new Promise(resolve => setTimeout(resolve, delay))
        return HttpResponse.json(response)
      })
  }
}

// Helper function to wait for async operations
export const waitForAsync = (timeout = 1000) => 
  new Promise(resolve => setTimeout(resolve, timeout))

// Helper function to create test environment
export const setupTestEnvironment = () => {
  // Mock environment variables
  vi.stubEnv('VITE_USE_MOCK_DATA', 'false')
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080/api')
  
  // Clear any existing timers
  vi.clearAllTimers()
  
  // Reset modules
  vi.resetModules()
}

// Helper function to verify API call parameters
export const verifyApiCall = (mockFn, expectedParams) => {
  expect(mockFn).toHaveBeenCalled()
  
  if (expectedParams) {
    const lastCall = mockFn.mock.calls[mockFn.mock.calls.length - 1]
    expect(lastCall[0]).toMatchObject(expectedParams)
  }
}

// Helper function to simulate user interactions
export const simulateUserInteraction = {
  search: async (user, searchInput, query) => {
    await user.clear(searchInput)
    await user.type(searchInput, query)
  },
  
  selectCategory: async (user, categoryButton) => {
    await user.click(categoryButton)
  },
  
  retry: async (user, retryButton) => {
    await user.click(retryButton)
  }
}

// Helper function to verify UI state
export const verifyUIState = {
  loading: (screen) => {
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  },
  
  articles: (screen, expectedCount) => {
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(expectedCount)
  },
  
  error: (screen, errorMessage) => {
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
  },
  
  noResults: (screen) => {
    expect(screen.getByText(/no articles found/i)).toBeInTheDocument()
  }
}

// Performance testing helpers
export const performanceHelpers = {
  measureRenderTime: async (renderFn) => {
    const start = performance.now()
    await renderFn()
    const end = performance.now()
    return end - start
  },
  
  measureApiCallCount: (mockFn) => {
    return mockFn.mock.calls.length
  },
  
  simulateSlowNetwork: (delay = 2000) => {
    return createMockApiHandlers().getNewsDelayed(delay)
  }
}

// Data validation helpers
export const dataValidation = {
  validateArticleStructure: (article) => {
    expect(article).toHaveProperty('id')
    expect(article).toHaveProperty('title')
    expect(article).toHaveProperty('description')
    expect(article).toHaveProperty('url')
    expect(article).toHaveProperty('source')
    expect(article.source).toHaveProperty('name')
    expect(article).toHaveProperty('publishedAt')
  },
  
  validateResponseStructure: (response) => {
    expect(response).toHaveProperty('success')
    expect(response).toHaveProperty('data')
    expect(response.data).toHaveProperty('articles')
    expect(response.data).toHaveProperty('totalResults')
    expect(response.data).toHaveProperty('page')
    expect(response.data).toHaveProperty('pageSize')
  },
  
  validateErrorStructure: (errorResponse) => {
    expect(errorResponse).toHaveProperty('success', false)
    expect(errorResponse).toHaveProperty('message')
    expect(errorResponse).toHaveProperty('errorCode')
  }
}
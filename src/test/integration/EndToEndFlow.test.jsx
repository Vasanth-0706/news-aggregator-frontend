import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../setup.js'
import Home from '../../pages/Home.jsx'
import newsService from '../../services/newsService.js'
import { 
  mockNewsData, 
  mockErrorResponses, 
  createMockApiHandlers,
  setupTestEnvironment,
  verifyUIState,
  simulateUserInteraction,
  dataValidation
} from '../utils/testUtils.js'

/**
 * End-to-End Integration Tests
 * Tests complete user flows from frontend to backend
 * Tests Requirements: 1.1, 1.4, 7.4
 */

describe('End-to-End News Flow Integration Tests', () => {
  const user = userEvent.setup()
  const apiHandlers = createMockApiHandlers()

  beforeEach(() => {
    setupTestEnvironment()
    newsService.clearCache()
  })

  describe('Complete User Journey - Happy Path', () => {
    it('should complete full user journey: load → search → filter → retry', async () => {
      // Setup mock responses for different stages
      const initialResponse = {
        ...mockNewsData,
        data: {
          ...mockNewsData.data,
          articles: [
            {
              id: 'initial-1',
              title: 'Initial News Article',
              description: 'This is the initial news article',
              url: 'https://example.com/initial',
              urlToImage: 'https://example.com/initial.jpg',
              source: { id: 'initial-source', name: 'Initial Source' },
              author: 'Initial Author',
              publishedAt: '2024-01-15T10:00:00Z',
              category: 'general'
            }
          ]
        }
      }

      const searchResponse = {
        ...mockNewsData,
        data: {
          ...mockNewsData.data,
          articles: [
            {
              id: 'search-1',
              title: 'AI Search Result',
              description: 'This article matches the AI search query',
              url: 'https://example.com/ai-search',
              urlToImage: 'https://example.com/ai-search.jpg',
              source: { id: 'ai-source', name: 'AI Source' },
              author: 'AI Author',
              publishedAt: '2024-01-15T11:00:00Z',
              category: 'technology'
            }
          ]
        }
      }

      const technologyResponse = {
        ...mockNewsData,
        data: {
          ...mockNewsData.data,
          articles: [
            {
              id: 'tech-1',
              title: 'Technology News Article',
              description: 'This is a technology category article',
              url: 'https://example.com/tech',
              urlToImage: 'https://example.com/tech.jpg',
              source: { id: 'tech-source', name: 'Tech Source' },
              author: 'Tech Author',
              publishedAt: '2024-01-15T12:00:00Z',
              category: 'technology'
            }
          ]
        }
      }

      // Setup API handlers for different requests
      server.use(
        http.get('http://localhost:8080/api/news', ({ request }) => {
          const url = new URL(request.url)
          const query = url.searchParams.get('q')
          const category = url.searchParams.get('category')
          
          if (query === 'artificial intelligence') {
            return HttpResponse.json(searchResponse)
          } else if (category === 'technology') {
            return HttpResponse.json(technologyResponse)
          } else {
            return HttpResponse.json(initialResponse)
          }
        })
      )

      // Step 1: Initial page load
      render(<Home />)
      
      // Verify loading state
      verifyUIState.loading(screen)
      
      // Wait for initial articles to load
      await waitFor(() => {
        expect(screen.getByText('Initial News Article')).toBeInTheDocument()
      })
      
      // Verify initial article data
      expect(screen.getByText('This is the initial news article')).toBeInTheDocument()
      expect(screen.getByText('Initial Source')).toBeInTheDocument()

      // Step 2: Perform search
      const searchInput = screen.getByPlaceholderText(/search news/i)
      await simulateUserInteraction.search(user, searchInput, 'artificial intelligence')
      
      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('AI Search Result')).toBeInTheDocument()
      })
      
      // Verify search results
      expect(screen.getByText('This article matches the AI search query')).toBeInTheDocument()
      expect(screen.getByText('AI Source')).toBeInTheDocument()

      // Step 3: Clear search and filter by category
      await user.clear(searchInput)
      
      // Wait for search to clear and show initial articles
      await waitFor(() => {
        expect(screen.getByText('Initial News Article')).toBeInTheDocument()
      })
      
      // Click technology category
      const technologyButton = screen.getByRole('button', { name: /technology/i })
      await simulateUserInteraction.selectCategory(user, technologyButton)
      
      // Wait for category results
      await waitFor(() => {
        expect(screen.getByText('Technology News Article')).toBeInTheDocument()
      })
      
      // Verify category filtering
      expect(screen.getByText('This is a technology category article')).toBeInTheDocument()
      expect(screen.getByText('Tech Source')).toBeInTheDocument()

      // Step 4: Verify all data transformations are correct
      const articles = screen.getAllByRole('article')
      expect(articles).toHaveLength(1)
      
      // Verify article structure and data integrity
      const techArticle = articles[0]
      expect(techArticle).toHaveTextContent('Technology News Article')
      expect(techArticle).toHaveTextContent('Tech Source')
      expect(techArticle).toHaveTextContent('Tech Author')
    })
  })

  describe('Error Handling and Recovery Flow', () => {
    it('should handle complete error recovery journey', async () => {
      let requestCount = 0
      
      // Setup API that fails initially then succeeds
      server.use(
        http.get('http://localhost:8080/api/news', () => {
          requestCount++
          if (requestCount === 1) {
            return HttpResponse.json(mockErrorResponses.serviceUnavailable, { status: 503 })
          } else if (requestCount === 2) {
            return HttpResponse.error() // Network error
          } else {
            return HttpResponse.json(mockNewsData)
          }
        })
      )

      // Step 1: Initial load with service error
      render(<Home />)
      
      await waitFor(() => {
        verifyUIState.error(screen, 'service is temporarily unavailable')
      })
      
      // Verify retry button is present
      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()

      // Step 2: Retry with network error
      await simulateUserInteraction.retry(user, retryButton)
      
      await waitFor(() => {
        verifyUIState.error(screen, 'unable to connect')
      })

      // Step 3: Retry with success
      const newRetryButton = screen.getByRole('button', { name: /try again/i })
      await simulateUserInteraction.retry(user, newRetryButton)
      
      await waitFor(() => {
        expect(screen.getByText('Test Article 1')).toBeInTheDocument()
      })
      
      // Verify successful recovery
      expect(screen.getByText('Test Article 2')).toBeInTheDocument()
      expect(requestCount).toBe(3) // Verify all three requests were made
    })

    it('should handle rate limit error with appropriate messaging', async () => {
      // Setup rate limit error
      server.use(
        http.get('http://localhost:8080/api/news', () => {
          return HttpResponse.json(mockErrorResponses.rateLimitError, { status: 429 })
        })
      )

      render(<Home />)
      
      await waitFor(() => {
        verifyUIState.error(screen, 'rate limit exceeded')
      })
      
      // Verify specific rate limit messaging
      expect(screen.getByText(/try again later/i)).toBeInTheDocument()
    })
  })

  describe('Caching and Performance Flow', () => {
    it('should demonstrate caching behavior across user interactions', async () => {
      let apiCallCount = 0
      
      // Setup API call counter
      server.use(
        http.get('http://localhost:8080/api/news', ({ request }) => {
          const url = new URL(request.url)
          const category = url.searchParams.get('category')
          
          apiCallCount++
          
          if (category === 'technology') {
            return HttpResponse.json({
              ...mockNewsData,
              data: {
                ...mockNewsData.data,
                articles: [{
                  ...mockNewsData.data.articles[0],
                  title: 'Cached Technology Article',
                  category: 'technology'
                }]
              }
            })
          }
          
          return HttpResponse.json(mockNewsData)
        })
      )

      render(<Home />)
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Article 1')).toBeInTheDocument()
      })
      
      const initialCallCount = apiCallCount

      // Switch to technology category
      const technologyButton = screen.getByRole('button', { name: /technology/i })
      await user.click(technologyButton)
      
      await waitFor(() => {
        expect(screen.getByText('Cached Technology Article')).toBeInTheDocument()
      })
      
      const afterTechCallCount = apiCallCount

      // Switch back to all categories (should use cache)
      const allButton = screen.getByRole('button', { name: /all/i })
      await user.click(allButton)
      
      await waitFor(() => {
        expect(screen.getByText('Test Article 1')).toBeInTheDocument()
      })
      
      const finalCallCount = apiCallCount

      // Verify caching behavior
      expect(afterTechCallCount).toBe(initialCallCount + 1) // One new call for technology
      expect(finalCallCount).toBe(afterTechCallCount) // No new call for cached "all" category
    })

    it('should handle concurrent requests efficiently', async () => {
      let requestCount = 0
      
      // Setup delayed API response
      server.use(
        http.get('http://localhost:8080/api/news', async () => {
          requestCount++
          await new Promise(resolve => setTimeout(resolve, 100))
          return HttpResponse.json(mockNewsData)
        })
      )

      // Render multiple components simultaneously (simulating concurrent requests)
      const { rerender } = render(<Home />)
      rerender(<Home />)
      rerender(<Home />)
      
      // Wait for all to complete
      await waitFor(() => {
        expect(screen.getByText('Test Article 1')).toBeInTheDocument()
      })
      
      // Verify only one request was made despite multiple renders
      expect(requestCount).toBe(1)
    })
  })

  describe('Data Transformation and Validation Flow', () => {
    it('should validate complete data transformation pipeline', async () => {
      // Setup detailed mock response
      const detailedResponse = {
        success: true,
        data: {
          articles: [
            {
              id: 'detailed-1',
              title: 'Detailed Article Title',
              description: 'This is a comprehensive article description that should be displayed correctly',
              url: 'https://detailed.example.com/article',
              urlToImage: 'https://detailed.example.com/image.jpg',
              source: {
                id: 'detailed-source',
                name: 'Detailed News Source'
              },
              author: 'Detailed Author Name',
              publishedAt: '2024-01-15T14:30:00Z',
              category: 'technology'
            }
          ],
          totalResults: 1,
          page: 1,
          pageSize: 20
        },
        message: null
      }

      server.use(
        http.get('http://localhost:8080/api/news', () => {
          return HttpResponse.json(detailedResponse)
        })
      )

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Detailed Article Title')).toBeInTheDocument()
      })
      
      // Validate all article fields are displayed correctly
      expect(screen.getByText('This is a comprehensive article description that should be displayed correctly')).toBeInTheDocument()
      expect(screen.getByText('Detailed News Source')).toBeInTheDocument()
      expect(screen.getByText('Detailed Author Name')).toBeInTheDocument()
      
      // Validate link functionality
      const readMoreLink = screen.getByRole('link', { name: /read more/i })
      expect(readMoreLink).toHaveAttribute('href', 'https://detailed.example.com/article')
      expect(readMoreLink).toHaveAttribute('target', '_blank')
      
      // Validate data structure
      dataValidation.validateResponseStructure(detailedResponse)
      dataValidation.validateArticleStructure(detailedResponse.data.articles[0])
    })

    it('should handle missing optional fields gracefully', async () => {
      // Setup response with missing fields
      const incompleteResponse = {
        success: true,
        data: {
          articles: [
            {
              id: 'incomplete-1',
              title: 'Article with Missing Fields',
              description: 'This article has some missing optional fields',
              url: 'https://incomplete.example.com/article',
              urlToImage: null, // Missing image
              source: {
                id: 'incomplete-source',
                name: 'Incomplete Source'
              },
              author: null, // Missing author
              publishedAt: '2024-01-15T15:00:00Z',
              category: 'general'
            }
          ],
          totalResults: 1,
          page: 1,
          pageSize: 20
        },
        message: null
      }

      server.use(
        http.get('http://localhost:8080/api/news', () => {
          return HttpResponse.json(incompleteResponse)
        })
      )

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Article with Missing Fields')).toBeInTheDocument()
      })
      
      // Verify article displays despite missing fields
      expect(screen.getByText('This article has some missing optional fields')).toBeInTheDocument()
      expect(screen.getByText('Incomplete Source')).toBeInTheDocument()
      
      // Verify graceful handling of missing author and image
      // The exact behavior depends on the component implementation
      // This test ensures the component doesn't crash with missing data
    })
  })

  describe('Search and Filter Integration Flow', () => {
    it('should handle complex search and filter combinations', async () => {
      const responses = {
        general: mockNewsData,
        technology: {
          ...mockNewsData,
          data: {
            ...mockNewsData.data,
            articles: [{
              ...mockNewsData.data.articles[0],
              title: 'Technology Article',
              category: 'technology'
            }]
          }
        },
        search: {
          ...mockNewsData,
          data: {
            ...mockNewsData.data,
            articles: [{
              ...mockNewsData.data.articles[0],
              title: 'Search Result Article',
              description: 'This article matches the search query'
            }]
          }
        }
      }

      server.use(
        http.get('http://localhost:8080/api/news', ({ request }) => {
          const url = new URL(request.url)
          const query = url.searchParams.get('q')
          const category = url.searchParams.get('category')
          
          if (query) {
            return HttpResponse.json(responses.search)
          } else if (category === 'technology') {
            return HttpResponse.json(responses.technology)
          } else {
            return HttpResponse.json(responses.general)
          }
        })
      )

      render(<Home />)
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Article 1')).toBeInTheDocument()
      })

      // Test category filter
      const technologyButton = screen.getByRole('button', { name: /technology/i })
      await user.click(technologyButton)
      
      await waitFor(() => {
        expect(screen.getByText('Technology Article')).toBeInTheDocument()
      })

      // Test search (should override category)
      const searchInput = screen.getByPlaceholderText(/search news/i)
      await user.type(searchInput, 'test query')
      
      await waitFor(() => {
        expect(screen.getByText('Search Result Article')).toBeInTheDocument()
      })

      // Clear search (should return to category filter)
      await user.clear(searchInput)
      
      await waitFor(() => {
        expect(screen.getByText('Technology Article')).toBeInTheDocument()
      })

      // Return to all categories
      const allButton = screen.getByRole('button', { name: /all/i })
      await user.click(allButton)
      
      await waitFor(() => {
        expect(screen.getByText('Test Article 1')).toBeInTheDocument()
      })
    })
  })
})
# Integration Test Suite

This directory contains comprehensive integration tests for the News Aggregator application, covering the complete flow from frontend to backend to NewsAPI.

## Test Structure

### Backend Integration Tests (`news-aggregator-backend/src/test/java/com/newsaggregator/integration/`)

1. **NewsApiIntegrationTest.java**
   - Tests end-to-end news fetching flow
   - Validates data transformation from NewsAPI to internal format
   - Tests error handling scenarios (unauthorized, rate limit, timeout)
   - Validates parameter handling and response structure

2. **CachingIntegrationTest.java**
   - Tests caching behavior and cache invalidation
   - Validates separate cache entries for different categories/queries
   - Tests concurrent request handling
   - Validates cache TTL and eviction policies

3. **FullStackIntegrationTest.java**
   - Tests complete flow with mock NewsAPI server
   - Validates real HTTP communication patterns
   - Tests error recovery and retry mechanisms
   - Validates request/response transformation accuracy

4. **IntegrationTestSuite.java**
   - Test suite runner for coordinated execution
   - Runs all integration tests in proper order

### Frontend Integration Tests (`news-aggregator/src/test/integration/`)

1. **NewsIntegration.test.jsx**
   - Tests frontend-backend API integration
   - Validates UI behavior with real API responses
   - Tests error handling and recovery scenarios
   - Validates caching behavior from frontend perspective
   - Tests data transformation accuracy

2. **EndToEndFlow.test.jsx**
   - Tests complete user journeys
   - Validates search and filter functionality
   - Tests error recovery flows
   - Validates performance optimizations (debouncing, caching)

### Test Utilities (`news-aggregator/src/test/utils/`)

1. **testUtils.js**
   - Common mock data and helper functions
   - API handler creators for MSW
   - UI state verification helpers
   - Performance testing utilities
   - Data validation helpers

## Test Coverage

### Requirements Covered

- **Requirement 1.1**: Real news articles display and fetching
- **Requirement 1.4**: Error handling and user feedback
- **Requirement 7.4**: RESTful API endpoints and data format

### Test Scenarios

#### Happy Path Scenarios
- Initial page load with news articles
- Category filtering with backend API
- Search functionality with backend API
- Data transformation accuracy
- Caching behavior

#### Error Handling Scenarios
- Backend service unavailable (503)
- Network connection errors
- Rate limit exceeded (429)
- Invalid API key (401)
- Request timeout
- Empty results handling

#### Performance Scenarios
- Caching effectiveness
- Concurrent request handling
- Search debouncing
- Loading state management

#### Data Validation Scenarios
- Complete data transformation pipeline
- Missing optional fields handling
- Response structure validation
- Article structure validation

## Running Tests

### Backend Tests
```bash
cd news-aggregator-backend
mvn test -Dtest="com.newsaggregator.integration.*"
```

### Frontend Tests
```bash
cd news-aggregator
npm run test:run src/test/integration/
```

### All Integration Tests
```bash
# Backend
cd news-aggregator-backend
mvn test -Dtest="IntegrationTestSuite"

# Frontend
cd news-aggregator
npm run test:run src/test/integration/
```

## Test Configuration

### Backend Configuration
- Uses H2 in-memory database for testing
- Mock NewsAPI server with MockWebServer
- Spring Boot test slices for focused testing
- Custom test profiles for different scenarios

### Frontend Configuration
- Vitest with jsdom environment
- MSW (Mock Service Worker) for API mocking
- React Testing Library for component testing
- Custom test utilities for common operations

## Mock Data

### Backend Mock Data
- Realistic NewsAPI response structures
- Various error response formats
- Different article categories and sources
- Edge cases (empty responses, missing fields)

### Frontend Mock Data
- Consistent test article data
- Error response scenarios
- Loading state simulations
- Cache behavior validation data

## Assertions and Validations

### Backend Assertions
- HTTP status codes and response headers
- JSON response structure and content
- Database state changes
- Cache behavior verification
- Request parameter validation

### Frontend Assertions
- UI element presence and content
- User interaction behavior
- API call verification
- Error message display
- Loading state transitions

## Best Practices

1. **Test Isolation**: Each test is independent and can run in any order
2. **Realistic Data**: Mock data closely resembles real NewsAPI responses
3. **Error Coverage**: Comprehensive error scenario testing
4. **Performance Testing**: Validates caching and optimization features
5. **Data Validation**: Ensures data integrity throughout the pipeline
6. **User Experience**: Tests complete user journeys and interactions

## Maintenance

- Update mock data when NewsAPI response format changes
- Add new test scenarios for new features
- Maintain test utilities for reusability
- Keep test configuration in sync with application configuration
- Regular review of test coverage and effectiveness
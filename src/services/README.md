# News Service

This service handles all API communication with the backend for news data.

## Usage

```javascript
import newsService from './newsService';

// Fetch all news
const allNews = await newsService.fetchNews();

// Fetch news by category
const techNews = await newsService.fetchNews({ category: 'Technology' });

// Search news
const searchResults = await newsService.fetchNews({ query: 'artificial intelligence' });

// Combined filtering
const filteredNews = await newsService.fetchNews({ 
  category: 'Technology', 
  query: 'AI' 
});
```

## Configuration

Set environment variables in `.env.development`:

```
# Use mock data for development (when backend is not available)
VITE_USE_MOCK_DATA=true

# Backend API URL
VITE_API_BASE_URL=http://localhost:8080/api
```

## Error Handling

The service provides detailed error messages for different scenarios:
- Network connectivity issues
- Backend authentication problems (401)
- Rate limiting (429)
- Server errors (5xx)

## Development Mode

When `VITE_USE_MOCK_DATA=true`, the service uses mock data instead of making API calls, useful for frontend development when the backend is not available.
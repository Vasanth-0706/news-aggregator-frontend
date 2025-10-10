/**
 * Mock news data for development and fallback scenarios
 */

export const mockNewsData = {
  success: true,
  data: {
    articles: [
      {
        id: "mock-1",
        title: "Breaking: Technology Advances Continue to Shape Our World",
        description: "Latest developments in artificial intelligence and machine learning are transforming industries across the globe, bringing both opportunities and challenges.",
        url: "https://techcrunch.com/2024/01/15/ai-developments/",
        urlToImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
        source: {
          id: "tech-source",
          name: "Tech News Daily"
        },
        author: "Jane Smith",
        publishedAt: new Date().toISOString(),
        category: "technology"
      },
      {
        id: "mock-2",
        title: "Global Markets Show Resilience Amid Economic Uncertainty",
        description: "Financial markets demonstrate stability as investors adapt to changing economic conditions and policy adjustments worldwide.",
        url: "https://www.reuters.com/business/markets/",
        urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
        source: {
          id: "business-source",
          name: "Business Weekly"
        },
        author: "John Doe",
        publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        category: "business"
      },
      {
        id: "mock-3",
        title: "Sports Championship Finals Draw Record Viewership",
        description: "The championship finals attracted millions of viewers worldwide, setting new records for sports broadcasting and engagement.",
        url: "https://www.espn.com/",
        urlToImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop",
        source: {
          id: "sports-source",
          name: "Sports Central"
        },
        author: "Mike Johnson",
        publishedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        category: "sports"
      },
      {
        id: "mock-4",
        title: "Climate Change Summit Reaches Historic Agreement",
        description: "World leaders unite on ambitious climate targets, setting new standards for environmental protection and sustainable development.",
        url: "https://www.bbc.com/news/science-environment",
        urlToImage: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=400&h=200&fit=crop",
        source: {
          id: "environment-source",
          name: "Environmental Times"
        },
        author: "Sarah Green",
        publishedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        category: "general"
      },
      {
        id: "mock-5",
        title: "Healthcare Innovation: New Treatment Shows Promise",
        description: "Breakthrough medical research offers hope for patients with rare diseases, marking a significant advancement in personalized medicine.",
        url: "https://www.nature.com/articles/",
        urlToImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop",
        source: {
          id: "health-source",
          name: "Medical Journal"
        },
        author: "Dr. Michael Chen",
        publishedAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        category: "health"
      },
      {
        id: "mock-6",
        title: "Entertainment Industry Embraces Digital Transformation",
        description: "Streaming platforms and virtual reality are reshaping how audiences consume entertainment content, creating new opportunities for creators.",
        url: "https://variety.com/",
        urlToImage: "https://images.unsplash.com/photo-1489599735734-79b4af4e22f6?w=400&h=200&fit=crop",
        source: {
          id: "entertainment-source",
          name: "Entertainment Weekly"
        },
        author: "Lisa Rodriguez",
        publishedAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
        category: "entertainment"
      }
    ],
    totalResults: 6,
    page: 1,
    pageSize: 20
  }
};

export default mockNewsData;
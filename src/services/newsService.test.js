/**
 * Simple test for news service functionality
 * Run this in the browser console to test the service
 */

import newsService from './newsService.js';

// Test function to verify news service
window.testNewsService = async () => {
  console.log('Testing News Service...');
  
  try {
    console.log('1. Testing fetchNews() with no parameters...');
    const allNews = await newsService.fetchNews();
    console.log('✓ All news:', allNews);
    
    console.log('2. Testing fetchNews() with category filter...');
    const techNews = await newsService.fetchNews({ category: 'Technology' });
    console.log('✓ Tech news:', techNews);
    
    console.log('3. Testing fetchNews() with search query...');
    const searchResults = await newsService.fetchNews({ query: 'technology' });
    console.log('✓ Search results:', searchResults);
    
    console.log('4. Testing fetchTopHeadlines()...');
    const headlines = await newsService.fetchTopHeadlines();
    console.log('✓ Top headlines:', headlines);
    
    console.log('All tests passed! ✓');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};

console.log('News Service test loaded. Run window.testNewsService() to test.');
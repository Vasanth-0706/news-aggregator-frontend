import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BookmarkIcon,
  ShareIcon,
  ClockIcon,
  FireIcon,
  NewspaperIcon,
  ExclamationTriangleIcon,
  WifiIcon,
  ServerIcon,
  KeyIcon,
  ClockIcon as ClockIconOutline,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useOptimizedNews } from '../hooks/useOptimizedNews';
import UserMenu from '../components/UserMenu';

// Error Display Component
const ErrorDisplay = ({ error, errorType, retryCount, isRetrying, onRetry, hasArticles }) => {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'RATE_LIMIT':
        return {
          icon: <ClockIconOutline style={{ width: '24px', height: '24px' }} />,
          title: 'Rate Limit Exceeded',
          message: 'Too many requests. Please wait a moment before trying again.',
          bgColor: '#fef3c7',
          borderColor: '#fcd34d',
          textColor: '#92400e',
          titleColor: '#78350f',
          buttonColor: '#f59e0b',
          canRetry: true,
          retryDelay: retryCount > 1 ? Math.min(1000 * Math.pow(2, retryCount - 1), 30000) : 0
        };
      case 'AUTH_ERROR':
        return {
          icon: <KeyIcon style={{ width: '24px', height: '24px' }} />,
          title: 'Authentication Error',
          message: 'There\'s an issue with the news service configuration. Please contact support.',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          textColor: '#7f1d1d',
          titleColor: '#dc2626',
          buttonColor: '#dc2626',
          canRetry: false
        };
      case 'SERVER_ERROR':
        return {
          icon: <ServerIcon style={{ width: '24px', height: '24px' }} />,
          title: 'Service Unavailable',
          message: 'The news service is temporarily unavailable. Please try again in a few minutes.',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          textColor: '#7f1d1d',
          titleColor: '#dc2626',
          buttonColor: '#dc2626',
          canRetry: true
        };
      case 'NETWORK_ERROR':
        return {
          icon: <WifiIcon style={{ width: '24px', height: '24px' }} />,
          title: 'Connection Error',
          message: 'Unable to connect to the news service. Please check your internet connection.',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          textColor: '#7f1d1d',
          titleColor: '#dc2626',
          buttonColor: '#dc2626',
          canRetry: true
        };
      default:
        return {
          icon: <ExclamationTriangleIcon style={{ width: '24px', height: '24px' }} />,
          title: 'Something went wrong',
          message: error || 'An unexpected error occurred while loading news.',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          textColor: '#7f1d1d',
          titleColor: '#dc2626',
          buttonColor: '#dc2626',
          canRetry: true
        };
    }
  };

  const config = getErrorConfig();
  
  return (
    <div style={{
      backgroundColor: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem'
    }}>
      <div style={{ 
        color: config.titleColor,
        flexShrink: 0,
        marginTop: '2px'
      }}>
        {config.icon}
      </div>
      
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          color: config.titleColor, 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          margin: 0
        }}>
          {config.title}
        </h3>
        <p style={{ 
          color: config.textColor, 
          fontSize: '0.875rem', 
          margin: '0.5rem 0 1rem 0',
          lineHeight: '1.5'
        }}>
          {config.message}
        </p>
        
        {hasArticles && (
          <p style={{ 
            color: config.textColor, 
            fontSize: '0.75rem', 
            margin: '0 0 1rem 0',
            fontStyle: 'italic'
          }}>
            Showing previously loaded articles
          </p>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {config.canRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              style={{
                backgroundColor: config.buttonColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                cursor: isRetrying ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: isRetrying ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              {isRetrying ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Retrying...
                </>
              ) : (
                `Try Again${retryCount > 0 ? ` (${retryCount})` : ''}`
              )}
            </button>
          )}
          
          {config.retryDelay > 0 && (
            <span style={{ 
              color: config.textColor, 
              fontSize: '0.75rem' 
            }}>
              Waiting {Math.ceil(config.retryDelay / 1000)}s before retry...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Add CSS animation for spinner
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = spinnerStyle;
  document.head.appendChild(styleSheet);
}

// Fallback UI Component
const FallbackUI = ({ hasError, errorType, searchQuery, selectedCategory, onRetry, isRetrying }) => {
  if (hasError) {
    // Show error-specific fallback
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '2px dashed #e2e8f0'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <ExclamationTriangleIcon style={{
            width: '40px',
            height: '40px',
            color: '#dc2626'
          }} />
        </div>
        
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '0.75rem',
          color: '#1e293b'
        }}>
          Unable to Load News
        </h3>
        
        <p style={{ 
          color: '#64748b', 
          fontSize: '1rem',
          marginBottom: '2rem',
          maxWidth: '400px',
          margin: '0 auto 2rem'
        }}>
          We're having trouble connecting to our news service. 
          {errorType === 'NETWORK_ERROR' && ' Please check your internet connection and try again.'}
          {errorType === 'RATE_LIMIT' && ' We\'ve hit our request limit. Please wait a moment.'}
          {errorType === 'SERVER_ERROR' && ' Our servers are experiencing issues. Please try again later.'}
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onRetry}
            disabled={isRetrying}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: isRetrying ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            {isRetrying ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Retrying...
              </>
            ) : (
              'Try Again'
            )}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#cbd5e1';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#e2e8f0';
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  // Show no results message
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#64748b'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        backgroundColor: '#f1f5f9',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem'
      }}>
        <NewspaperIcon style={{
          width: '40px',
          height: '40px',
          color: '#cbd5e1'
        }} />
      </div>
      
      <h3 style={{ 
        fontSize: '1.5rem', 
        fontWeight: '600', 
        marginBottom: '0.75rem',
        color: '#1e293b'
      }}>
        No Articles Found
      </h3>
      
      <p style={{ 
        fontSize: '1rem',
        marginBottom: '2rem',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {searchQuery ? (
          <>No articles match your search for "<strong>{searchQuery}</strong>"{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.</>
        ) : (
          <>No articles available{selectedCategory !== 'All' ? ` for ${selectedCategory}` : ''} at the moment.</>
        )}
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '0.875rem',
          fontStyle: 'italic'
        }}>
          Try adjusting your search terms or selecting a different category
        </p>
      </div>
    </div>
  );
};

const Home = () => {
  // Use optimized news hook
  const {
    articles,
    loading,
    error,
    errorType,
    retryCount,
    isRetrying,
    selectedCategory,
    searchQuery,
    isSearching,
    handleRetry,
    handleCategoryChange,
    handleSearchChange,
    hasArticles,
    isLoadingOrSearching,
    clearCache,
    refresh
  } = useOptimizedNews({
    debounceDelay: 300,
    enableCache: true,
    initialCategory: 'All',
    initialSearchQuery: ''
  });

  // Local UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = ['All', 'Technology', 'General', 'Sports', 'Entertainment', 'Business', 'Health', 'Science'];

  // Articles are already filtered by the backend API, but let's ensure no duplicates
  const filteredArticles = React.useMemo(() => {
    if (!articles || articles.length === 0) return [];
    
    // Remove duplicates based on URL (most reliable unique identifier)
    const seen = new Set();
    return articles.filter(article => {
      const key = article.url || article.id || article.title;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [articles]);

  const toggleBookmark = (articleId) => {
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
    } else {
      newBookmarks.add(articleId);
    }
    setBookmarkedArticles(newBookmarks);
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Use the refresh function from the hook
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-48 w-full rounded-t-xl mb-4"></div>
      <div className="px-6 pb-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bars3Icon style={{ width: '24px', height: '24px', color: '#64748b' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <NewspaperIcon style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1e293b',
                margin: 0
              }}>
                NewsAggregator
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            position: 'relative',
            maxWidth: '400px',
            width: '100%',
            margin: '0 2rem'
          }}>
            <MagnifyingGlassIcon style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: isSearching ? '#3b82f6' : '#64748b',
              transition: 'color 0.2s ease'
            }} />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '44px',
                paddingRight: isSearching ? '44px' : '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                border: `1px solid ${isSearching ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: '24px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: '#f8fafc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                if (!isSearching) {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {isSearching && (
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
          </div>

          {/* User Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button style={{
              padding: '0.5rem',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <BellIcon style={{ width: '24px', height: '24px', color: '#64748b' }} />
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%'
              }}></span>
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Sidebar */}
        <aside style={{
          width: isSidebarOpen ? '280px' : '0',
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          position: 'sticky',
          top: '64px',
          height: 'calc(100vh - 64px)'
        }}>
          <div style={{ padding: '1.5rem 1rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FireIcon style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
              Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selectedCategory === category ? '#3b82f6' : 'transparent',
                    color: selectedCategory === category ? 'white' : '#64748b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: selectedCategory === category ? '500' : '400',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (selectedCategory !== category) {
                      e.target.style.backgroundColor = '#f1f5f9';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedCategory !== category) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '2rem 1rem',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {/* Header Section */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1e293b',
                margin: 0
              }}>
                {selectedCategory === 'All' ? 'Latest News' : `${selectedCategory} News`}
              </h2>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isRefreshing || loading ? 'not-allowed' : 'pointer',
                  opacity: isRefreshing || loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                  if (!isRefreshing && !loading) {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isRefreshing && !loading) {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                <ArrowPathIcon 
                  style={{ 
                    width: '16px', 
                    height: '16px',
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }} 
                />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                Stay updated with the latest headlines and breaking news
              </p>
              
              {/* Last updated indicator */}
              {hasArticles && !loading && (
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: '0.75rem', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <ClockIcon style={{ width: '12px', height: '12px' }} />
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Enhanced Error Display */}
          {error && (
            <ErrorDisplay 
              error={error}
              errorType={errorType}
              retryCount={retryCount}
              isRetrying={isRetrying}
              onRetry={handleRetry}
              hasArticles={articles.length > 0}
            />
          )}

          {/* Loading State Indicator */}
          {(isSearching && hasArticles) && (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#0369a1'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid #0369a1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Searching for "{searchQuery}"...
            </div>
          )}

          {/* Refresh State Indicator */}
          {(isRefreshing && hasArticles) && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#15803d'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid #15803d',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Refreshing news content...
            </div>
          )}

          {/* Articles Grid */}
          {loading && !hasArticles ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {[...Array(6)].map((_, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                  <LoadingSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredArticles.map((article, index) => (
                <article
                  key={article.id || article.url || index}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Article Image */}
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                      src={article.urlToImage || 'https://via.placeholder.com/400x200?text=News'}
                      alt={article.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {article.category && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {article.category}
                      </div>
                    )}
                  </div>

                  {/* Article Content */}
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '0.75rem',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {article.title}
                    </h3>
                    
                    <p style={{
                      color: '#64748b',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {article.description}
                    </p>

                    {/* Article Meta */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ClockIcon style={{ width: '16px', height: '16px', color: '#64748b' }} />
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {article.source?.name || 'Unknown Source'}
                        </span>
                      </div>
                      {article.publishedAt && (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Article Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#3b82f6',
                          fontSize: '14px',
                          fontWeight: '500',
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Read More
                      </a>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(article.id || article.url);
                          }}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {bookmarkedArticles.has(article.id || article.url) ? (
                            <BookmarkSolidIcon style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                          ) : (
                            <BookmarkIcon style={{ width: '20px', height: '20px', color: '#64748b' }} />
                          )}
                        </button>
                        
                        <button style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ShareIcon style={{ width: '20px', height: '20px', color: '#64748b' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* No Results / Fallback UI */}
          {!loading && !isSearching && filteredArticles.length === 0 && (
            <FallbackUI 
              hasError={!!error}
              errorType={errorType}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onRetry={handleRetry}
              isRetrying={isRetrying}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
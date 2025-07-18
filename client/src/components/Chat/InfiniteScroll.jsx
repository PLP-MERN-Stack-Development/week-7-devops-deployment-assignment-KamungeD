import React, { useEffect, useRef, useCallback } from 'react';

const InfiniteScroll = ({ 
  children, 
  hasMore, 
  isLoading, 
  onLoadMore, 
  threshold = 100,
  className = ""
}) => {
  const containerRef = useRef(null);
  const prevScrollHeight = useRef(0);
  const isLoadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isLoadingRef.current || !hasMore) return;

    const { scrollTop, scrollHeight } = container;
    
    // Load more when scrolled to top (for chat messages)
    if (scrollTop <= threshold) {
      isLoadingRef.current = true;
      prevScrollHeight.current = scrollHeight;
      onLoadMore();
    }
  }, [hasMore, onLoadMore, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
    
    // Maintain scroll position after loading new messages
    if (!isLoading && prevScrollHeight.current > 0) {
      const container = containerRef.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        const scrollDiff = newScrollHeight - prevScrollHeight.current;
        container.scrollTop += scrollDiff;
        prevScrollHeight.current = 0;
      }
    }
  }, [isLoading]);

  return (
    <div 
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: '100%' }}
    >
      {/* Loading indicator at top */}
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm">Loading messages...</span>
          </div>
        </div>
      )}
      
      {/* Load more button (alternative to infinite scroll) */}
      {hasMore && !isLoading && (
        <div className="flex justify-center p-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
          >
            Load More Messages
          </button>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default InfiniteScroll;

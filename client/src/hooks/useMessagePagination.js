import { useState, useEffect, useCallback } from 'react';

const useMessagePagination = (initialMessages = [], pageSize = 50) => {
  const [allMessages, setAllMessages] = useState(initialMessages);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial messages
  useEffect(() => {
    if (initialMessages.length > 0) {
      setAllMessages(initialMessages);
      const initialDisplay = initialMessages.slice(0, pageSize);
      setDisplayedMessages(initialDisplay);
      setHasMore(initialMessages.length > pageSize);
    }
  }, [initialMessages, pageSize]);

  // Load more messages (for infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    try {
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const moreMessages = allMessages.slice(startIndex, endIndex);
      
      if (moreMessages.length > 0) {
        setDisplayedMessages(prev => [...moreMessages, ...prev]);
        setCurrentPage(prev => prev + 1);
        setHasMore(endIndex < allMessages.length);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [allMessages, currentPage, pageSize, isLoading, hasMore]);

  // Add new message
  const addMessage = useCallback((message) => {
    setAllMessages(prev => [...prev, message]);
    setDisplayedMessages(prev => [...prev, message]);
  }, []);

  // Update message (for reactions, read receipts)
  const updateMessage = useCallback((messageId, updates) => {
    setAllMessages(prev => 
      prev.map(msg => msg.id === messageId ? { ...msg, ...updates } : msg)
    );
    setDisplayedMessages(prev => 
      prev.map(msg => msg.id === messageId ? { ...msg, ...updates } : msg)
    );
  }, []);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setDisplayedMessages(allMessages.slice(0, pageSize));
    setHasMore(allMessages.length > pageSize);
  }, [allMessages, pageSize]);

  return {
    displayedMessages,
    hasMore,
    isLoading,
    loadMoreMessages,
    addMessage,
    updateMessage,
    resetPagination
  };
};

export default useMessagePagination;

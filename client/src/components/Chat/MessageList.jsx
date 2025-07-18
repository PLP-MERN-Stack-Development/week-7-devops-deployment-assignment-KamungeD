import React, { useEffect, useRef } from 'react';
import Message from './Message';
import InfiniteScroll from './InfiniteScroll';
import useMessagePagination from '../../hooks/useMessagePagination';

const MessageList = ({ 
  messages, 
  currentUser, 
  onMessageReact, 
  onLoadMoreMessages,
  hasMoreMessages = true,
  isLoadingMessages = false 
}) => {
  const messagesEndRef = useRef(null);
  const {
    displayedMessages,
    hasMore,
    isLoading,
    loadMoreMessages,
    addMessage,
    updateMessage
  } = useMessagePagination(messages, 50);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  // Handle new messages
  useEffect(() => {
    if (messages.length > displayedMessages.length) {
      const newMessages = messages.slice(displayedMessages.length);
      newMessages.forEach(addMessage);
    }
  }, [messages, displayedMessages.length, addMessage]);

  const handleLoadMore = async () => {
    if (onLoadMoreMessages) {
      await onLoadMoreMessages();
    }
    await loadMoreMessages();
  };

  return (
    <InfiniteScroll
      hasMore={hasMore || hasMoreMessages}
      isLoading={isLoading || isLoadingMessages}
      onLoadMore={handleLoadMore}
      className="flex-1 p-4"
    >
      <div className="space-y-3">
        {displayedMessages.map(message => (
          <Message
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === currentUser}
            onReact={onMessageReact}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </InfiniteScroll>
  );
};

export default MessageList;
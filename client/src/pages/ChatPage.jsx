import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket/socket.jsx';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import TypingIndicator from '../components/Chat/TypingIndicator';
import NotificationManager from '../components/Notifications/NotificationManager';
import ProfileEdit from '../components/Auth/ProfileEdit';
import MessagePaginationService from '../services/MessagePaginationService';
import MessageSearch from '../components/Chat/MessageSearch';

const ChatPage = ({ user, onLogout }) => {
  const { logout } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState({ id: 'general', name: 'General' });
  const [chatMode, setChatMode] = useState('room');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(new Map());
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    messages,
    users,
    typingUsers,
    sendMessage,
    setTyping,
    sendPrivateMessage,
    isConnected,
    socket,
    reactToMessage,
    editMessage,
    deleteMessage,
    replyToMessage
  } = useSocket(user);

  // Load notification preferences
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    const savedNotificationsEnabled = localStorage.getItem('notificationsEnabled');
    
    if (savedSoundEnabled !== null) {
      setSoundEnabled(JSON.parse(savedSoundEnabled));
    }
    if (savedNotificationsEnabled !== null) {
      setNotificationsEnabled(JSON.parse(savedNotificationsEnabled));
    }
  }, []);

  // Save notification preferences
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  // Handle sending messages
  const handleSendMessage = (message) => {
    if (chatMode === 'private' && selectedUser) {
      sendPrivateMessage(selectedUser.id, message);
    } else {
      sendMessage({
        ...message,
        room: currentRoom.id
      });
    }
  };

  // Handle room selection
  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setSelectedUser(null);
    setChatMode('room');
  };

  // Handle private chat
  const handleUserSelect = (user) => {
    if (user.username !== user.username) {
      setSelectedUser(user);
      setChatMode('private');
    }
  };

  // Toggle notification settings
  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleToggleNotifications = (enabled) => {
    setNotificationsEnabled(enabled);
  };

  // Load more messages function
  const handleLoadMoreMessages = async () => {
    if (isLoadingMoreMessages || !hasMoreMessages) return;
    
    setIsLoadingMoreMessages(true);
    
    try {
      const result = await MessagePaginationService.loadMoreMessages(
        chatMode === 'room' ? currentRoom.id : null
      );
      
      setHasMoreMessages(result.hasMore);
      
      // You would typically update the messages state here
      // This depends on how your socket context is structured
      
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };

  // Filter messages based on chat mode
  const filteredMessages = messages.filter(message => {
    if (chatMode === 'private' && selectedUser) {
      return (
        message.isPrivate &&
        ((message.senderId === user.username && message.recipient === selectedUser.id) ||
         (message.senderId === selectedUser.id && message.recipient === user.username))
      );
    } else {
      return !message.isPrivate && message.room === currentRoom.id;
    }
  });

  // Handle search results
  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearchActive(true);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchResults([]);
    setIsSearchActive(false);
  };

  // Get messages to display (search results or regular messages)
  const displayMessages = isSearchActive ? searchResults : filteredMessages;

  // Message reaction, edit, delete, and reply handlers
  const handleMessageReact = (messageId, emoji) => {
    reactToMessage(messageId, emoji);
  };

  const handleMessageEdit = (messageId, newContent) => {
    editMessage(messageId, newContent);
  };

  const handleMessageDelete = (messageId) => {
    deleteMessage(messageId);
  };

  const handleMessageReply = (messageId, replyContent) => {
    replyToMessage(messageId, replyContent);
  };

  // Message reaction, edit, delete, and reply handlers
  useEffect(() => {
    if (!socket) return;

    const handleMessageReaction = (data) => {
      console.log('Message reaction received:', data);
      // The socket context should handle updating the messages
      // If needed, you can emit a refresh event or handle this in the socket context
    };

    const handleMessageEdited = (data) => {
      console.log('Message edited:', data);
      // The socket context should handle updating the messages
    };

    const handleMessageDeleted = (data) => {
      console.log('Message deleted:', data);
      // The socket context should handle updating the messages
    };

    const handleMessageReply = (data) => {
      console.log('Message reply:', data);
      // The socket context should handle updating the messages
    };

    socket.on('message_reaction', handleMessageReaction);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_reply', handleMessageReply);

    return () => {
      socket.off('message_reaction', handleMessageReaction);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_reply', handleMessageReply);
    };
  }, [socket]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header 
        user={user}
        onlineUsers={users} 
        onLogout={handleLogout}
        isConnected={isConnected}
        unreadCount={unreadCount}
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
        onToggleSound={handleToggleSound}
        onToggleNotifications={handleToggleNotifications}
        onEditProfile={() => setShowProfileEdit(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onlineUsers={users}
          currentUser={user.username}
          onUserSelect={handleUserSelect}
          selectedUser={selectedUser}
          currentRoom={currentRoom}
          onRoomSelect={handleRoomSelect}
          chatMode={chatMode}
          unreadMessages={unreadMessages}
        />
        
        <div className="flex-1 flex flex-col bg-white">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-800">
                {chatMode === 'private' && selectedUser
                  ? `Private chat with ${selectedUser.username}`
                  : `# ${currentRoom.name}`
                }
              </h2>
              {!isConnected && (
                <span className="text-red-500 text-sm">
                  Disconnected - Reconnecting...
                </span>
              )}
            </div>
            
            {/* Search Component */}
            <div className="w-full max-w-md">
              <MessageSearch
                messages={filteredMessages}
                onSearchResults={handleSearchResults}
                onSearchClear={handleSearchClear}
                placeholder="Search messages..."
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <MessageList
              messages={displayMessages}
              currentUser={user.username}
              onMessageReact={handleMessageReact}
              onLoadMoreMessages={handleLoadMoreMessages}
              hasMoreMessages={hasMoreMessages}
              isLoadingMessages={isLoadingMoreMessages}
            />
            <div ref={messagesEndRef} />
          </div>
          
          <TypingIndicator 
            typingUsers={typingUsers}
            chatMode={chatMode}
            currentRoom={currentRoom}
            selectedUser={selectedUser}
          />
          
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={setTyping}
            placeholder={
              chatMode === 'private' && selectedUser
                ? `Message ${selectedUser.username}`
                : `Message #${currentRoom.name}`
            }
          />
        </div>
      </div>
      
      <NotificationManager
        newMessage={messages[messages.length - 1]}
        currentUser={user.username}
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
        onToggleSound={handleToggleSound}
        onToggleNotifications={handleToggleNotifications}
        chatMode={chatMode}
        selectedUser={selectedUser}
        currentRoom={currentRoom}
      />

      {showProfileEdit && (
        <ProfileEdit onClose={() => setShowProfileEdit(false)} />
      )}
    </div>
  );
};

export default ChatPage;
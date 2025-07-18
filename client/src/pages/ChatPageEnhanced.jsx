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
import ConnectionStatus from '../components/Layout/ConnectionStatus';
import useReconnection from '../hooks/useReconnection';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    messages,
    users,
    typingUsers,
    sendMessage,
    setTyping,
    sendPrivateMessage,
    socket
  } = useSocket(user);

  const {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    maxReconnectAttempts,
    isReconnecting,
    manualReconnect
  } = useReconnection(socket, user);

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

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (!isSearchActive) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSearchActive]);

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

  // Handle message reactions
  const handleMessageReact = (messageId, reaction) => {
    if (socket && isConnected) {
      socket.emit('add_reaction', { messageId, reaction });
    }
  };

  // Handle room selection
  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setSelectedUser(null);
    setChatMode('room');
    setIsSearchActive(false);
    setSearchResults([]);
  };

  // Handle private chat
  const handleUserSelect = (user) => {
    if (user.username !== user.username) {
      setSelectedUser(user);
      setChatMode('private');
      setIsSearchActive(false);
      setSearchResults([]);
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
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
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <ConnectionStatus
              isConnected={isConnected}
              connectionStatus={connectionStatus}
              reconnectAttempts={reconnectAttempts}
              maxReconnectAttempts={maxReconnectAttempts}
              isReconnecting={isReconnecting}
              onManualReconnect={manualReconnect}
            />
            <div className="text-sm opacity-90">
              Check your internet connection
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 ease-in-out bg-white shadow-xl border-r border-gray-200`}>
          <Sidebar
            onlineUsers={users}
            currentUser={user.username}
            onUserSelect={handleUserSelect}
            selectedUser={selectedUser}
            currentRoom={currentRoom}
            onRoomSelect={handleRoomSelect}
            chatMode={chatMode}
            unreadMessages={unreadMessages}
            collapsed={sidebarCollapsed}
          />
        </div>
        
        {/* Enhanced Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white shadow-2xl rounded-l-xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {chatMode === 'private' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {chatMode === 'private' && selectedUser
                      ? `${selectedUser.username}`
                      : `# ${currentRoom.name}`
                    }
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {chatMode === 'private' && selectedUser
                      ? 'Private conversation'
                      : `${users.length} members online`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isConnected && (
                  <div className="flex items-center space-x-1 text-green-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Connected</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Search Component */}
            <div className="w-full max-w-md">
              <MessageSearch
                messages={filteredMessages}
                onSearchResults={handleSearchResults}
                onSearchClear={handleSearchClear}
                placeholder="Search messages..."
              />
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-hidden bg-gray-50">
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
          
          {/* Typing Indicator */}
          <TypingIndicator 
            typingUsers={typingUsers}
            chatMode={chatMode}
            currentRoom={currentRoom}
            selectedUser={selectedUser}
          />
          
          {/* Enhanced Message Input */}
          <div className="bg-white border-t border-gray-200 shadow-lg">
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={setTyping}
              disabled={!isConnected}
              placeholder={
                isConnected 
                  ? `Message ${chatMode === 'private' ? selectedUser?.username : `#${currentRoom.name}`}`
                  : 'Connecting...'
              }
            />
          </div>
        </div>
      </div>
      
      {/* Notification Manager */}
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
      
      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <ProfileEdit
          user={user}
          onClose={() => setShowProfileEdit(false)}
          onSave={(updatedUser) => {
            // Handle profile update
            setShowProfileEdit(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatPage;

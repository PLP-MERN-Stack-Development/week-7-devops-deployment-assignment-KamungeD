import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  onlineUsers, 
  currentUser, 
  onSelectUser,
  selectedUser,
  messageSearch,
  onSearchChange,
  searchResults,
  onClearSearch,
  recentChats = []
}) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'chats', label: 'Chats', icon: '💬' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'search', label: 'Search', icon: '🔍' }
  ];

  const filteredUsers = onlineUsers.filter(user =>
    user.id !== currentUser?.id &&
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = recentChats.filter(chat =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <div
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 md:relative md:translate-x-0 md:shadow-none md:border-r border-gray-200 transform transition-transform duration-300 ease-in-out"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Chat Hub
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/60 rounded-lg transition-colors md:hidden"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="mt-3 relative">
                  <input
                    type="text"
                    placeholder="Search users or chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'chats' && (
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Chats</h3>
                    {filteredChats.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">💬</div>
                        <p className="text-sm">No recent chats</p>
                      </div>
                    ) : (
                      filteredChats.map((chat, index) => (
                        <div
                          key={chat.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedUser?.id === chat.id
                              ? 'bg-blue-50 border-2 border-blue-200'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                          onClick={() => onSelectUser(chat)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              {chat.avatar ? (
                                <img 
                                  src={chat.avatar} 
                                  alt={chat.username}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    {chat.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {chat.username}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {chat.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                            {chat.unreadCount > 0 && (
                              <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {chat.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {activeTab === 'users' && (
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      Online Users ({filteredUsers.length})
                    </h3>
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">👥</div>
                        <p className="text-sm">No users online</p>
                      </div>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedUser?.id === user.id
                              ? 'bg-blue-50 border-2 border-blue-200'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                          onClick={() => onSelectUser(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              {user.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={user.username}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {user.username}
                              </p>
                              <p className="text-xs text-green-600 font-medium">
                                Online
                              </p>
                            </div>
                            <div className="text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
                
                {activeTab === 'search' && (
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Message Search</h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={messageSearch}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-4 py-2 pl-10 pr-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {messageSearch && (
                        <button
                          onClick={onClearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-xs font-medium text-gray-500">Search Results</h4>
                        {searchResults.map((result, index) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                          >
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-semibold">
                                  {result.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800">
                                  {result.username}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                  {result.content}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(result.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {messageSearch && searchResults.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">🔍</div>
                        <p className="text-sm">No messages found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
};

export default Sidebar;

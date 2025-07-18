import React, { useState } from 'react';
import NotificationSettings from '../Notifications/NotificationSettings';
import BadgeCounter from '../Notifications/BadgeCounter';

const Header = ({ 
  user,
  onlineUsers,
  onLogout, 
  isConnected,
  unreadCount,
  soundEnabled,
  notificationsEnabled,
  onToggleSound,
  onToggleNotifications
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">MERN Chat</h1>
              {unreadCount > 0 && (
                <BadgeCounter count={unreadCount} />
              )}
            </div>
            <div className={`flex items-center space-x-2 ${
              isConnected ? 'text-green-200' : 'text-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.avatar && (
                <img 
                  src={user.avatar} 
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border-2 border-blue-400"
                />
              )}
              <div className="text-sm">
                <span className="text-blue-200">Welcome, </span>
                <span className="font-semibold">{user?.displayName || user?.username}</span>
              </div>
            </div>
            
            <div className="text-sm bg-blue-700 px-3 py-1 rounded-full">
              {onlineUsers.length} online
            </div>
            
            <NotificationSettings
              soundEnabled={soundEnabled}
              notificationsEnabled={notificationsEnabled}
              onToggleSound={onToggleSound}
              onToggleNotifications={onToggleNotifications}
            />
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
                title="User Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // Add profile edit functionality later
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
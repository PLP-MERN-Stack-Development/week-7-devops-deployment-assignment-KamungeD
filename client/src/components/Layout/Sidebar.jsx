import React, { useState } from 'react';
import BadgeCounter from '../Notifications/BadgeCounter';

const Sidebar = ({ 
  onlineUsers, 
  currentUser, 
  onUserSelect, 
  selectedUser,
  currentRoom,
  onRoomSelect,
  chatMode,
  unreadMessages = new Map()
}) => {
  const [activeTab, setActiveTab] = useState('rooms');
  
  const defaultRooms = [
    { id: 'general', name: 'General' },
    { id: 'random', name: 'Random' },
    { id: 'tech-talk', name: 'Tech Talk' }
  ];

  const getUnreadCount = (type, id) => {
    const key = type === 'private' ? `private_${id}` : `room_${id}`;
    return unreadMessages.get(key) || 0;
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 py-3 px-4 text-sm font-medium relative ${
            activeTab === 'rooms'
              ? 'bg-gray-700 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          Rooms
          {/* Show total unread count for rooms */}
          {Array.from(unreadMessages.entries())
            .filter(([key]) => key.startsWith('room_'))
            .reduce((total, [, count]) => total + count, 0) > 0 && (
            <BadgeCounter 
              count={Array.from(unreadMessages.entries())
                .filter(([key]) => key.startsWith('room_'))
                .reduce((total, [, count]) => total + count, 0)}
              className="absolute -top-1 -right-1"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-4 text-sm font-medium relative ${
            activeTab === 'users'
              ? 'bg-gray-700 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          Users ({onlineUsers.length})
          {/* Show total unread count for private messages */}
          {Array.from(unreadMessages.entries())
            .filter(([key]) => key.startsWith('private_'))
            .reduce((total, [, count]) => total + count, 0) > 0 && (
            <BadgeCounter 
              count={Array.from(unreadMessages.entries())
                .filter(([key]) => key.startsWith('private_'))
                .reduce((total, [, count]) => total + count, 0)}
              className="absolute -top-1 -right-1"
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'rooms' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">CHAT ROOMS</h3>
            <div className="space-y-1">
              {defaultRooms.map(room => {
                const unreadCount = getUnreadCount('room', room.id);
                return (
                  <button
                    key={room.id}
                    onClick={() => onRoomSelect(room)}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between ${
                      chatMode === 'room' && currentRoom?.id === room.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">#</span>
                      {room.name}
                    </div>
                    {unreadCount > 0 && (
                      <BadgeCounter count={unreadCount} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">ONLINE USERS</h3>
            <div className="space-y-1">
              {onlineUsers.map(user => {
                const unreadCount = user.username !== currentUser ? 
                  getUnreadCount('private', user.id) : 0;
                
                return (
                  <button
                    key={user.id}
                    onClick={() => onUserSelect(user)}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between ${
                      chatMode === 'private' && selectedUser?.id === user.id
                        ? 'bg-blue-600 text-white'
                        : user.username === currentUser
                        ? 'bg-gray-700 text-gray-300'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        user.isOnline ? 'bg-green-400' : 'bg-gray-500'
                      }`}></div>
                      <span className="flex-1">{user.username}</span>
                      {user.username === currentUser && (
                        <span className="text-xs text-gray-400 mr-2">(You)</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <BadgeCounter count={unreadCount} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
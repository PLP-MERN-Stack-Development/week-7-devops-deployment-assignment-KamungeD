import React, { useState, useRef, useEffect } from 'react';

const MessageEnhanced = ({ 
  message, 
  isOwn, 
  onReact, 
  onReply, 
  onEdit, 
  onDelete,
  onMarkAsRead,
  reactions = [],
  showReactions = true,
  showTimestamp = true,
  showAvatar = true,
  showUsername = true,
  isEditing = false,
  onEditSave,
  onEditCancel
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [imageLoading, setImageLoading] = useState(true);
  const menuRef = useRef(null);
  const editInputRef = useRef(null);

  const commonReactions = ['👍', '❤️', '😊', '😮', '😢', '😡', '👏', '🎉'];

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowReactionPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReaction = (emoji) => {
    if (onReact) {
      onReact(message.id, emoji);
    }
    setShowReactionPicker(false);
  };

  const handleEditSave = () => {
    if (onEditSave && editText.trim()) {
      onEditSave(message.id, editText.trim());
    }
  };

  const handleEditCancel = () => {
    setEditText(message.content);
    if (onEditCancel) {
      onEditCancel();
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  const isImage = (content) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(content);
  };

  const isVideo = (content) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(content);
  };

  const isFile = (content) => {
    return message.file || /\.(pdf|doc|docx|txt|zip|rar)$/i.test(content);
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-3">
          <textarea
            ref={editInputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleEditSave();
              } else if (e.key === 'Escape') {
                handleEditCancel();
              }
            }}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleEditCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    if (message.file) {
      return (
        <div className="space-y-2">
          {isImage(message.file.name) && (
            <div className="relative">
              <img
                src={message.file.url}
                alt={message.file.name}
                className={`max-w-xs rounded-lg shadow-md cursor-pointer transition-opacity duration-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onClick={() => window.open(message.file.url, '_blank')}
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          )}
          {isVideo(message.file.name) && (
            <video
              src={message.file.url}
              controls
              className="max-w-xs rounded-lg shadow-md"
            />
          )}
          {isFile(message.file.name) && !isImage(message.file.name) && !isVideo(message.file.name) && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {message.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round(message.file.size / 1024)} KB
                </p>
              </div>
              <button
                onClick={() => window.open(message.file.url, '_blank')}
                className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          )}
          {message.content && (
            <p className="text-gray-700 whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>
      );
    }

    return (
      <p className="text-gray-700 whitespace-pre-wrap break-words">
        {message.content}
      </p>
    );
  };

  return (
    <div
      className={`flex items-start space-x-3 group opacity-0 translate-y-5 animate-fade-in ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.user?.avatar ? (
            <img
              src={message.user.avatar}
              alt={message.user.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {message.user?.username?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className={`flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${isOwn ? 'flex flex-col items-end' : ''}`}>
        {showUsername && !isOwn && (
          <p className="text-xs text-gray-500 mb-1 font-medium">
            {message.user?.username}
          </p>
        )}
        
        <div className="relative" ref={menuRef}>
          <div
            className={`relative p-3 rounded-lg shadow-sm ${
              isOwn
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            {renderContent()}
            
            {/* Message menu */}
            {showMenu && (
              <div
                className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-10 transform transition-all duration-200`}
              >
                  {showReactions && (
                    <button
                      onClick={() => setShowReactionPicker(!showReactionPicker)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                      title="React"
                    >
                      😊
                    </button>
                  )}
                  {onReply && (
                    <button
                      onClick={() => onReply(message)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                      title="Reply"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                  )}
                  {isOwn && onEdit && (
                    <button
                      onClick={() => onEdit(message)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  {isOwn && onDelete && (
                    <button
                      onClick={() => onDelete(message)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

            {/* Reaction picker */}
            {showReactionPicker && (
              <div
                className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 transform transition-all duration-200`}
              >
                  <div className="flex space-x-1">
                    {commonReactions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Reactions display */}
          {reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handleReaction(reaction.emoji)}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors transform hover:scale-105"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-gray-600">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {showTimestamp && (
          <div className={`flex items-center space-x-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <p className="text-xs text-gray-500">
              {formatTimestamp(message.timestamp)}
            </p>
            {isOwn && message.readBy && (
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-blue-500">Read</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageEnhanced;

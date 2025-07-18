import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const Message = ({ message, isCurrentUser, onReact }) => {
  const [showReactions, setShowReactions] = useState(false);

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleReaction = (reaction) => {
    onReact(message.id, reaction);
    setShowReactions(false);
  };

  if (message.system) {
    return (
      <div className="text-center text-gray-500 text-sm italic">
        {message.message}
      </div>
    );
  }

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isCurrentUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        {!isCurrentUser && (
          <div className="font-semibold text-xs mb-1">{message.sender}</div>
        )}
        
        {message.fileUrl && (
          <div className="mb-2">
            {message.fileType?.startsWith('image/') ? (
              <img 
                src={message.fileUrl} 
                alt="Shared image" 
                className="max-w-full rounded"
              />
            ) : (
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 underline"
              >
                📎 {message.fileName}
              </a>
            )}
          </div>
        )}
        
        <div>{message.message || message.text}</div>
        
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(message.reactions).map(([reaction, users]) => (
              <span 
                key={reaction}
                className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-200"
                onClick={() => handleReaction(message.id, reaction)}
              >
                {reaction} {users.length}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs opacity-75">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
          
          {message.readBy && (
            <span className="text-xs opacity-75">
              Read by {message.readBy.length}
            </span>
          )}
        </div>
        
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full w-6 h-6 text-xs hover:bg-gray-700"
        >
          😀
        </button>
        
        {showReactions && (
          <div className="absolute -top-8 right-0 bg-white border rounded shadow-lg p-2 flex gap-1">
            {reactions.map(reaction => (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className="text-lg hover:bg-gray-100 p-1 rounded"
              >
                {reaction}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
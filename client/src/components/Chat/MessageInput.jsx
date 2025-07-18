import React, { useState } from 'react';
import FileUpload from './FileUpload';

const MessageInput = ({ onSendMessage, onTyping, onFileUpload }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage({ content: message, type: 'text' });
      setMessage('');
      onTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  const handleFileUpload = async (fileData) => {
    setIsUploading(true);
    try {
      // Send file message
      await onSendMessage({
        content: fileData.fileName,
        type: 'file',
        fileUrl: fileData.fileUrl,
        fileType: fileData.fileType,
        fileName: fileData.fileName
      });
    } catch (error) {
      console.error('Error sending file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex items-center space-x-2">
        <FileUpload 
          onFileUpload={handleFileUpload}
          disabled={isUploading}
        />
        
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onBlur={() => onTyping(false)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUploading}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || isUploading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
        >
          {isUploading ? '⏳' : 'Send'}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
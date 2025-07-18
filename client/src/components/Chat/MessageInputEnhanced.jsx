import React, { useState, useRef, useEffect } from 'react';
import FileUpload from './FileUpload';

const MessageInputEnhanced = ({ 
  onSendMessage, 
  onTyping, 
  onStopTyping, 
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 2000,
  showFileUpload = true,
  showEmojiPicker = true,
  showFormatting = true,
  replyTo = null,
  onCancelReply = null,
  currentUser
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [files, setFiles] = useState([]);
  
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const commonEmojis = [
    '😊', '😂', '😍', '😢', '😮', '😡', '👍', '👎', 
    '❤️', '💔', '🔥', '⭐', '👏', '🎉', '🚀', '💯'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Handle typing indicator
      if (value.length > 0 && !isTyping) {
        setIsTyping(true);
        onTyping && onTyping();
      }
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onStopTyping && onStopTyping();
      }, 1000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || files.length > 0) {
      onSendMessage({
        content: message.trim(),
        files: files,
        replyTo: replyTo?.id || null
      });
      setMessage('');
      setFiles([]);
      setIsTyping(false);
      onStopTyping && onStopTyping();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleEmojiClick = (emoji) => {
    const newMessage = message + emoji;
    if (newMessage.length <= maxLength) {
      setMessage(newMessage);
      inputRef.current?.focus();
    }
  };

  const handleFileSelect = (selectedFiles) => {
    setFiles(prev => [...prev, ...selectedFiles]);
    setShowFileUpload(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const insertFormatting = (format) => {
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText || 'strikethrough'}~~`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    if (newMessage.length <= maxLength) {
      setMessage(newMessage);
      
      // Set cursor position after formatting
      setTimeout(() => {
        input.focus();
        const newCursorPos = start + formattedText.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      setIsExpanded(textarea.scrollHeight > 60);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Reply indicator */}
      {replyTo && (
        <div
          className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg transform transition-all duration-200"
        >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="text-sm text-blue-700 font-medium">
                  Replying to {replyTo.user?.username}
                </span>
              </div>
              <button
                onClick={onCancelReply}
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {replyTo.content}
            </p>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div
          className="mb-3 flex flex-wrap gap-2 transform transition-all duration-200"
        >
          {files.map((file, index) => (
            <div
              key={index}
              className="relative bg-gray-100 rounded-lg p-2 flex items-center space-x-2 max-w-xs transform transition-all duration-200 hover:scale-105"
            >
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(file.size / 1024)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="relative">
        <div className="flex items-end space-x-2">
          {/* Left buttons */}
          <div className="flex items-center space-x-1">
            {showFileUpload && (
              <div className="relative">
                <button
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Attach file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                {showFileUpload && (
                  <div
                    className="absolute bottom-full left-0 mb-2 z-10 transform transition-all duration-200"
                  >
                    <FileUpload onFileSelect={handleFileSelect} />
                  </div>
                )}
              </div>
            )}

            {showEmojiPicker && (
              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Add emoji"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {showEmojiPicker && (
                  <div
                    className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 transform transition-all duration-200"
                  >
                    <div className="grid grid-cols-8 gap-1 max-w-xs">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiClick(emoji)}
                          className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showFormatting && (
              <div className="relative">
                <button
                  onClick={() => setShowFormatting(!showFormatting)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Format text"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </button>
                {showFormatting && (
                  <div
                    className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 transform transition-all duration-200"
                  >
                    <div className="flex space-x-1">
                      <button
                        onClick={() => insertFormatting('bold')}
                        className="p-2 hover:bg-gray-100 rounded font-bold"
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        onClick={() => insertFormatting('italic')}
                        className="p-2 hover:bg-gray-100 rounded italic"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        onClick={() => insertFormatting('code')}
                        className="p-2 hover:bg-gray-100 rounded font-mono text-sm"
                        title="Code"
                      >
                        {'<>'}
                      </button>
                      <button
                        onClick={() => insertFormatting('strikethrough')}
                        className="p-2 hover:bg-gray-100 rounded line-through"
                        title="Strikethrough"
                      >
                        S
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-2">
              <span className={`text-xs ${message.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                {message.length}/{maxLength}
              </span>
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={disabled || (!message.trim() && files.length === 0)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              disabled || (!message.trim() && files.length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95'
            }`}
            title="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="mt-2 text-xs text-gray-500">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {showFormatting && (
          <span className="ml-4">
            **bold** *italic* `code` ~~strikethrough~~
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageInputEnhanced;

import React, { useState, useEffect, useRef } from 'react';

const MessageSearch = ({ 
  messages, 
  onSearchResults, 
  onSearchClear,
  placeholder = "Search messages..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      onSearchClear && onSearchClear();
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]); // Removed messages from dependency array

  // Re-run search when messages change if there's an active search
  useEffect(() => {
    if (searchTerm.trim() && showResults) {
      performSearch(searchTerm);
    }
  }, [messages]);

  const performSearch = async (term) => {
    if (!term.trim()) return;

    setIsSearching(true);
    
    try {
      // Filter messages based on search term
      const filteredMessages = messages.filter(message => {
        const content = message.content || message.message || '';
        const senderName = message.sender || message.senderName || '';
        
        return (
          content.toLowerCase().includes(term.toLowerCase()) ||
          senderName.toLowerCase().includes(term.toLowerCase())
        );
      });

      // Sort by relevance (exact matches first, then partial matches)
      const sortedResults = filteredMessages.sort((a, b) => {
        const aContent = (a.content || a.message || '').toLowerCase();
        const bContent = (b.content || b.message || '').toLowerCase();
        const searchLower = term.toLowerCase();

        // Exact matches first
        if (aContent.includes(searchLower) && !bContent.includes(searchLower)) return -1;
        if (!aContent.includes(searchLower) && bContent.includes(searchLower)) return 1;

        // More recent messages first
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setSearchResults(sortedResults);
      setShowResults(true);
      onSearchResults && onSearchResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    onSearchClear && onSearchClear();
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Search icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
          
          {/* Clear button */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-600">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {searchResults.map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                onClick={() => {
                  // You can implement scroll to message functionality here
                  console.log('Navigate to message:', message.id);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800">
                    {message.sender || message.senderName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <div
                  className="text-sm text-gray-600 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(message.content || message.message || '', searchTerm)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {showResults && searchResults.length === 0 && searchTerm && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No messages found for "{searchTerm}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageSearch;

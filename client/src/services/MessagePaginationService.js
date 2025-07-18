// MessagePaginationService.js - Handle message pagination logic
class MessagePaginationService {
  constructor() {
    this.pageSize = 50;
    this.currentPage = 1;
    this.hasMore = true;
    this.isLoading = false;
  }

  async loadMessages(page = 1, limit = this.pageSize, roomId = null) {
    if (this.isLoading) return { messages: [], hasMore: false };
    
    this.isLoading = true;
    
    try {
      const url = new URL(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/messages`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      if (roomId) url.searchParams.append('room', roomId);

      const token = localStorage.getItem('authTokens') ? 
        JSON.parse(localStorage.getItem('authTokens')).accessToken : null;

      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const messages = await response.json();
      
      // Update pagination state
      this.currentPage = page;
      this.hasMore = messages.length === limit;
      
      return {
        messages,
        hasMore: this.hasMore,
        currentPage: this.currentPage
      };
      
    } catch (error) {
      console.error('Error loading messages:', error);
      return { messages: [], hasMore: false };
    } finally {
      this.isLoading = false;
    }
  }

  async loadMoreMessages(roomId = null) {
    return this.loadMessages(this.currentPage + 1, this.pageSize, roomId);
  }

  reset() {
    this.currentPage = 1;
    this.hasMore = true;
    this.isLoading = false;
  }
}

export default new MessagePaginationService();

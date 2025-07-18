// socket.jsx - Socket.io client setup

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (user) {
      // Get the token from localStorage
      const authTokens = localStorage.getItem('authTokens');
      let token = null;
      
      if (authTokens) {
        try {
          const parsedTokens = JSON.parse(authTokens);
          token = parsedTokens.accessToken || parsedTokens.token;
        } catch (error) {
          console.error('Error parsing auth tokens:', error);
        }
      }

      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: token,
          userId: user.id,
          username: user.username
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('user_list', (userList) => {
        setUsers(userList);
      });

      newSocket.on('user_joined', (user) => {
        console.log(`${user.username} joined the chat`);
      });

      newSocket.on('user_left', (user) => {
        console.log(`${user.username} left the chat`);
      });

      newSocket.on('receive_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('typing_users', (users) => {
        setTypingUsers(users);
      });

      newSocket.on('message_reaction', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, reactions: data.reactions } : msg
        ));
      });

      newSocket.on('message_edited', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, content: data.newContent, edited: true, editedAt: new Date() }
            : msg
        ));
      });

      newSocket.on('message_deleted', (data) => {
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
      });

      newSocket.on('message_reply', (data) => {
        setMessages(prev => [...prev, data.message]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    }
  };

  const sendPrivateMessage = (recipientId, messageData) => {
    if (socket && isConnected) {
      socket.emit('send_private_message', {
        recipient: recipientId,
        ...messageData
      });
    }
  };

  const setTyping = (isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', isTyping);
    }
  };

  const addReaction = (messageId, reaction) => {
    if (socket && isConnected) {
      socket.emit('add_reaction', { messageId, reaction });
    }
  };

  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
    }
  };

  const loadMoreMessages = async (page = 1, limit = 50) => {
    if (isLoadingMessages || !hasMoreMessages) return;
    
    setIsLoadingMessages(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/messages?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authTokens') ? 
              JSON.parse(localStorage.getItem('authTokens')).accessToken : ''}`
          }
        }
      );
      
      if (response.ok) {
        const olderMessages = await response.json();
        
        if (olderMessages.length < limit) {
          setHasMoreMessages(false);
        }
        
        setMessageHistory(prev => [...olderMessages, ...prev]);
        return olderMessages;
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const reactToMessage = (messageId, emoji) => {
    if (socket && isConnected) {
      socket.emit('message_reaction', { messageId, emoji });
    }
  };

  const editMessage = (messageId, newContent) => {
    if (socket && isConnected) {
      socket.emit('message_edit', { messageId, newContent });
    }
  };

  const deleteMessage = (messageId) => {
    if (socket && isConnected) {
      socket.emit('message_delete', { messageId });
    }
  };

  const replyToMessage = (messageId, replyContent) => {
    if (socket && isConnected) {
      socket.emit('message_reply', { messageId, replyContent });
    }
  };

  const value = {
    socket,
    messages,
    users,
    typingUsers,
    isConnected,
    messageHistory,
    hasMoreMessages,
    isLoadingMessages,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    addReaction,
    joinRoom,
    leaveRoom,
    loadMoreMessages,
    reactToMessage,
    editMessage,
    deleteMessage,
    replyToMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;

import { useEffect, useRef, useState } from 'react';

const useReconnection = (socket, user) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // Start with 1 second
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      setIsReconnecting(false);
      
      console.log('✅ Socket connected successfully');
      
      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const handleDisconnect = (reason) => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      console.log('❌ Socket disconnected:', reason);
      
      // Don't attempt reconnection if it was a manual disconnect
      if (reason === 'io client disconnect') {
        return;
      }
      
      // Start reconnection process
      attemptReconnection();
    };

    const handleConnectError = (error) => {
      setIsConnected(false);
      setConnectionStatus('error');
      
      console.error('🔴 Socket connection error:', error);
      
      // Attempt reconnection on error
      attemptReconnection();
    };

    const handleReconnect = (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber} successful`);
      setReconnectAttempts(attemptNumber);
    };

    const handleReconnectError = (error) => {
      console.error('🔴 Reconnection error:', error);
      setConnectionStatus('reconnecting');
    };

    const handleReconnectFailed = () => {
      console.error('💥 Reconnection failed - maximum attempts reached');
      setConnectionStatus('failed');
      setIsReconnecting(false);
    };

    const attemptReconnection = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        setConnectionStatus('failed');
        setIsReconnecting(false);
        return;
      }

      setIsReconnecting(true);
      setConnectionStatus('reconnecting');
      
      const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
      
      console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        
        if (socket && typeof socket.connect === 'function') {
          socket.connect();
        }
      }, delay);
    };

    const manualReconnect = () => {
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Reset attempts and try to reconnect
      setReconnectAttempts(0);
      setIsReconnecting(true);
      setConnectionStatus('reconnecting');
      
      console.log('🔄 Manual reconnection initiated');
      
      if (socket && typeof socket.connect === 'function') {
        socket.connect();
      }
    };

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_error', handleReconnectError);
    socket.on('reconnect_failed', handleReconnectFailed);

    // Initial connection status
    setIsConnected(socket.connected);
    setConnectionStatus(socket.connected ? 'connected' : 'disconnected');

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect', handleReconnect);
      socket.off('reconnect_error', handleReconnectError);
      socket.off('reconnect_failed', handleReconnectFailed);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [socket, reconnectAttempts, maxReconnectAttempts, reconnectDelay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    isReconnecting,
    maxReconnectAttempts,
    manualReconnect: () => {
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Reset attempts and try to reconnect
      setReconnectAttempts(0);
      setIsReconnecting(true);
      setConnectionStatus('reconnecting');
      
      console.log('🔄 Manual reconnection initiated');
      
      if (socket && typeof socket.connect === 'function') {
        socket.connect();
      }
    }
  };
};

export default useReconnection;

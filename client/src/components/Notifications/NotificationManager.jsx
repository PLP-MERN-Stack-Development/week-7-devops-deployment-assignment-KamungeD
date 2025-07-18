// filepath: client/src/components/Notifications/NotificationManager.jsx
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';

const NotificationManager = ({ 
  newMessage, 
  currentUser,
  soundEnabled, 
  notificationsEnabled,
  onToggleSound,
  onToggleNotifications,
  chatMode,
  selectedUser,
  currentRoom
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(new Map());
  const [permission, setPermission] = useState(Notification.permission);
  const notificationSound = useRef(null);
  const lastNotificationTime = useRef(0);

  // Initialize notification sound
  useEffect(() => {
    notificationSound.current = new Audio('/notification.mp3');
    notificationSound.current.volume = 0.5;
    
    // Fallback sound if file doesn't exist
    notificationSound.current.onerror = () => {
      notificationSound.current = null;
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      onToggleNotifications && onToggleNotifications(result === 'granted');
    }
  };

  // Handle new messages
  useEffect(() => {
    if (!newMessage || newMessage.senderId === currentUser) return;

    const now = Date.now();
    // Throttle notifications to prevent spam
    if (now - lastNotificationTime.current < 1000) return;
    lastNotificationTime.current = now;

    // Determine if this message should trigger notification
    const shouldNotify = shouldShowNotification(newMessage);
    
    if (shouldNotify) {
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Update unread messages map
      setUnreadMessages(prev => {
        const newMap = new Map(prev);
        const key = newMessage.isPrivate ? 
          `private_${newMessage.senderId}` : 
          `room_${newMessage.room}`;
        
        const currentCount = newMap.get(key) || 0;
        newMap.set(key, currentCount + 1);
        return newMap;
      });

      // Show toast notification
      showToastNotification(newMessage);
      
      // Play sound
      if (soundEnabled) {
        playNotificationSound();
      }
      
      // Show browser notification
      if (notificationsEnabled && permission === 'granted') {
        showBrowserNotification(newMessage);
      }
      
      // Update document title with unread count
      updateDocumentTitle();
    }
  }, [newMessage, currentUser, soundEnabled, notificationsEnabled, permission]);

  // Check if message should trigger notification
  const shouldShowNotification = (message) => {
    // Don't notify for own messages
    if (message.senderId === currentUser) return false;
    
    // Always notify for private messages
    if (message.isPrivate) return true;
    
    // For room messages, only notify if user is mentioned or window is not focused
    if (message.content.includes(`@${currentUser}`)) return true;
    if (document.hidden) return true;
    
    // Don't notify if user is actively viewing the room
    if (chatMode === 'room' && currentRoom?.id === message.room) return false;
    
    return true;
  };

  // Show toast notification
  const showToastNotification = (message) => {
    const messagePreview = message.content.length > 50 ? 
      message.content.substring(0, 50) + '...' : 
      message.content;
    
    const toastContent = message.isPrivate ? 
      `${message.sender}: ${messagePreview}` :
      `#${message.room} - ${message.sender}: ${messagePreview}`;
    
    toast.info(toastContent, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: message.isPrivate ? '💬' : '📢'
    });
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch(e => 
        console.log('Audio play failed:', e)
      );
    } else {
      // Fallback beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  // Show browser notification
  const showBrowserNotification = (message) => {
    if (document.hidden) {
      const title = message.isPrivate ? 
        `New message from ${message.sender}` :
        `New message in #${message.room}`;
      
      const body = message.content.length > 100 ? 
        message.content.substring(0, 100) + '...' : 
        message.content;
      
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/badge-icon.png',
        tag: message.isPrivate ? `private_${message.senderId}` : `room_${message.room}`,
        requireInteraction: false,
        silent: false
      });
      
      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  // Update document title with unread count
  const updateDocumentTitle = () => {
    const baseTitle = 'Real-Time Chat';
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  };

  // Clear unread count when user focuses window
  useEffect(() => {
    const handleFocus = () => {
      setUnreadCount(0);
      setUnreadMessages(new Map());
      document.title = 'Real-Time Chat';
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Component doesn't render anything visible
  return null;
};

export default NotificationManager;
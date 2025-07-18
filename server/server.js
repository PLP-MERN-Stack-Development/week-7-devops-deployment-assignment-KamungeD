// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const userService = require('./services/userService');
const messageService = require('./services/messageService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const { authenticateSocket } = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Production logging
const isDevelopment = process.env.NODE_ENV !== 'production';
const log = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()}: ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toISOString()}: ${message}`)
};

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|mp4|wav/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, documents, and audio files are allowed!'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// File upload handler
const handleFileUpload = async (fileData) => {
  // Implement actual file upload logic
  // This is a placeholder
  return `/uploads/${fileData.filename}`;
};

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file);

    // Return file information
    const fileInfo = {
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date()
    };

    res.json(fileInfo);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory storage for active typing users (can remain in memory)
const typingUsers = {};

// Add rooms functionality
const rooms = new Map();

// Socket.io connection handler
io.use(authenticateSocket);

io.on('connection', async (socket) => {
  console.log('User connected:', socket.user.username);
  
  try {
    await userService.createOrUpdateUser(socket.user, socket.id);
    const onlineUsers = await userService.getOnlineUsers();
    io.emit('user_list', onlineUsers);
    
    socket.broadcast.emit('user_joined', {
      id: socket.user._id,
      username: socket.user.username,
      displayName: socket.user.getDisplayName()
    });
  } catch (error) {
    console.error('Error handling user connection:', error);
  }

  // Handle user joining
  socket.on('user_join', async (username) => {
    try {
      const user = await userService.createOrUpdateUser(username, socket.id);
      
      // Get all online users
      const onlineUsers = await userService.getOnlineUsers();
      
      // Emit user list to all clients
      io.emit('user_list', onlineUsers);
      io.emit('user_joined', { username: user.username, id: user._id });
      
      console.log(`${username} joined the chat`);
    } catch (error) {
      console.error('Error handling user join:', error.message);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Join a specific chat room
  socket.on('join_room', async (roomId) => {
    try {
      console.log(`User attempting to join room: ${roomId}`);
      
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) {
        console.log('User not found when joining room');
        return;
      }

      // Leave all previous rooms except the socket.id room
      Array.from(socket.rooms).forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
          console.log(`User left room: ${room}`);
        }
      });

      // Join the new room
      socket.join(roomId);
      console.log(`${user.username} joined room: ${roomId}`);
      
      // Notify other users in the room
      socket.to(roomId).emit('user_joined_room', {
        username: user.username,
        userId: user._id,
        roomId: roomId,
        timestamp: new Date()
      });

      // Send room message history to the user
      const roomMessages = await messageService.getMessagesByRoom(roomId);
      socket.emit('room_messages', roomMessages);

      // Send current room users list
      const roomUsers = await userService.getRoomUsers(roomId);
      socket.emit('room_users', roomUsers);

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave a chat room
  socket.on('leave_room', async (roomId) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      socket.leave(roomId);
      console.log(`${user.username} left room: ${roomId}`);
      
      // Notify other users in the room
      socket.to(roomId).emit('user_left_room', {
        username: user.username,
        userId: user._id,
        roomId: roomId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Enhanced message handling with rooms
  socket.on('send_message', async (messageData) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      const message = await messageService.createMessage({
        sender: user._id,
        senderName: user.username,
        content: messageData.content || messageData.message,
        room: messageData.room || 'general',
        type: messageData.type || 'text',
        fileUrl: messageData.fileUrl,
        isPrivate: false
      });

      const messageToSend = {
        id: message._id,
        sender: message.senderName,
        senderId: message.sender,
        message: message.content,
        timestamp: message.createdAt,
        reactions: message.reactions,
        type: message.type,
        fileUrl: message.fileUrl,
        room: message.room
      };

      // Send to room
      io.to(messageData.room || 'general').emit('receive_message', messageToSend);

      // Send notifications to offline users
      const roomUsers = rooms.get(messageData.room || 'general') || new Set();
      for (const userId of roomUsers) {
        const roomUser = await userService.getUserById(userId);
        if (roomUser && !roomUser.isOnline) {
          // Here you would typically send push notifications
          // For now, we'll just log it
          console.log(`Notification for ${roomUser.username}: New message in ${messageData.room}`);
        }
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle read receipts
  socket.on('message_read', async ({ messageId, room }) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      const message = await messageService.markAsRead(messageId, user._id);
      
      io.to(room).emit('message_read_receipt', {
        messageId,
        readBy: message.readBy
      });

    } catch (error) {
      console.error('Error handling read receipt:', error);
    }
  });

  // Handle file uploads
  socket.on('file_upload', async (fileData) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      // Process file upload (you'd implement actual file handling)
      const fileUrl = await handleFileUpload(fileData);
      
      const message = await messageService.createMessage({
        sender: user._id,
        senderName: user.username,
        content: fileData.filename,
        room: fileData.room || 'general',
        type: 'file',
        fileUrl: fileUrl,
        isPrivate: false
      });

      io.to(fileData.room || 'general').emit('receive_message', {
        id: message._id,
        sender: message.senderName,
        senderId: message.sender,
        message: message.content,
        timestamp: message.createdAt,
        type: 'file',
        fileUrl: message.fileUrl,
        room: message.room
      });

    } catch (error) {
      console.error('Error handling file upload:', error);
    }
  });

  // Handle typing indicator (keep in memory for performance)
  socket.on('typing', async (isTyping) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (user) {
        if (isTyping) {
          typingUsers[socket.id] = user.username;
        } else {
          delete typingUsers[socket.id];
        }
        io.emit('typing_users', Object.values(typingUsers));
      }
    } catch (error) {
      console.error('Error handling typing:', error.message);
    }
  });

  // Handle message reactions
  socket.on('message_reaction', async ({ messageId, reaction }) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      const message = await messageService.addReaction(messageId, user._id, reaction);
      
      io.emit('message_reaction', {
        messageId,
        reactions: message.reactions
      });
    } catch (error) {
      console.error('Error handling message reaction:', error.message);
    }
  });

  // Private message event
  socket.on('private_message', async ({ recipientId, content }) => {
    const sender = await userService.getUserBySocketId(socket.id);
    if (!sender) return;

    // Save message to DB
    const message = await messageService.createMessage({
      sender: sender._id,
      senderName: sender.username,
      recipient: recipientId,
      isPrivate: true,
      content,
      messageType: 'text'
    });

    // Emit to recipient and sender
    io.to(socket.id).emit('receive_private_message', message);
    const recipientSocketId = await userService.getSocketIdByUserId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_private_message', message);
    }
  });

  // Private messaging - allows users to send direct messages to each other
  socket.on('send_private_message', async (data) => {
    try {
      console.log('Private message received:', data);
      
      // Get the sender's information from the database
      const sender = await userService.getUserBySocketId(socket.id);
      if (!sender) {
        console.log('Sender not found');
        return;
      }

      // Create and save the private message to the database
      const message = await messageService.createMessage({
        sender: sender._id,
        senderName: sender.username,
        content: data.content,
        recipient: data.recipientId,
        isPrivate: true,
        messageType: 'text'
      });

      // Format the message for real-time transmission
      const messageData = {
        id: message._id,
        sender: message.senderName,
        senderId: message.sender,
        content: message.content,
        timestamp: message.createdAt,
        isPrivate: true,
        recipient: message.recipient
      };

      // Send message to the sender (confirmation)
      socket.emit('receive_private_message', messageData);
      
      // Send message to the recipient if they're online
      const recipient = await userService.getUserById(data.recipientId);
      if (recipient && recipient.socketId) {
        socket.to(recipient.socketId).emit('receive_private_message', messageData);
      }

    } catch (error) {
      console.error('Error sending private message:', error);
      socket.emit('error', { message: 'Failed to send private message' });
    }
  });

  // Get private message history between two users
  socket.on('get_private_messages', async (data) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      const messages = await messageService.getPrivateMessages(user._id, data.recipientId);
      socket.emit('private_messages_history', messages);
    } catch (error) {
      console.error('Error getting private messages:', error);
    }
  });

  // Enhanced typing indicator for rooms
  socket.on('typing_in_room', async (data) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      console.log(`${user.username} is typing in room: ${data.roomId}`);
      
      // Broadcast to other users in the room (excluding sender)
      socket.to(data.roomId).emit('user_typing_in_room', {
        username: user.username,
        userId: user._id,
        roomId: data.roomId
      });
    } catch (error) {
      console.error('Error handling typing in room:', error);
    }
  });

  // Stop typing in room
  socket.on('stop_typing_in_room', async (data) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      console.log(`${user.username} stopped typing in room: ${data.roomId}`);
      
      // Broadcast to other users in the room
      socket.to(data.roomId).emit('user_stopped_typing_in_room', {
        username: user.username,
        userId: user._id,
        roomId: data.roomId
      });
    } catch (error) {
      console.error('Error handling stop typing in room:', error);
    }
  });

  // Typing indicator for private messages
  socket.on('typing_private', async (data) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      // Send typing indicator to the specific recipient
      const recipient = await userService.getUserById(data.recipientId);
      if (recipient && recipient.socketId) {
        socket.to(recipient.socketId).emit('user_typing_private', {
          username: user.username,
          userId: user._id,
          senderId: user._id
        });
      }
    } catch (error) {
      console.error('Error handling private typing:', error);
    }
  });

  // Stop typing for private messages
  socket.on('stop_typing_private', async (data) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      const recipient = await userService.getUserById(data.recipientId);
      if (recipient && recipient.socketId) {
        socket.to(recipient.socketId).emit('user_stopped_typing_private', {
          username: user.username,
          userId: user._id,
          senderId: user._id
        });
      }
    } catch (error) {
      console.error('Error handling stop private typing:', error);
    }
  });

  // Add reaction to a message
  socket.on('add_reaction', async (data) => {
    try {
      console.log('Adding reaction:', data);
      
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      // Add reaction to the message
      const message = await messageService.addReaction(data.messageId, data.reaction);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Prepare reaction update data
      const reactionData = {
        messageId: data.messageId,
        reactions: message.reactions,
        updatedBy: user.username
      };

      // Broadcast reaction update based on message type
      if (message.isPrivate) {
        // For private messages, send to both sender and recipient
        socket.emit('reaction_updated', reactionData);
        
        const recipient = await userService.getUserById(message.recipient);
        if (recipient && recipient.socketId) {
          socket.to(recipient.socketId).emit('reaction_updated', reactionData);
        }
      } else {
        // For room messages, broadcast to all users in the room
        const roomId = message.room?.toString() || 'general';
        io.to(roomId).emit('reaction_updated', reactionData);
      }

    } catch (error) {
      console.error('Error adding reaction:', error);
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });

  // Remove reaction from a message
  socket.on('remove_reaction', async (data) => {
    try {
      console.log('Removing reaction:', data);
      
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      // Remove reaction from the message
      const message = await messageService.removeReaction(data.messageId, data.reaction);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Prepare reaction update data
      const reactionData = {
        messageId: data.messageId,
        reactions: message.reactions,
        updatedBy: user.username
      };

      // Broadcast reaction update
      if (message.isPrivate) {
        socket.emit('reaction_updated', reactionData);
        
        const recipient = await userService.getUserById(message.recipient);
        if (recipient && recipient.socketId) {
          socket.to(recipient.socketId).emit('reaction_updated', reactionData);
        }
      } else {
        const roomId = message.room?.toString() || 'general';
        io.to(roomId).emit('reaction_updated', reactionData);
      }

    } catch (error) {
      console.error('Error removing reaction:', error);
      socket.emit('error', { message: 'Failed to remove reaction' });
    }
  });

  // Mark message as read
  socket.on('mark_message_read', async (data) => {
    try {
      console.log('Marking message as read:', data);
      
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      // Mark the message as read
      const message = await messageService.markAsRead(data.messageId, user._id);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Prepare read receipt data
      const readReceiptData = {
        messageId: data.messageId,
        readBy: message.readBy,
        readByUser: {
          id: user._id,
          username: user.username,
          readAt: new Date()
        }
      };

      // Send read receipt notification
      if (message.isPrivate) {
        // For private messages, notify the sender
        const sender = await userService.getUserById(message.sender);
        if (sender && sender.socketId && sender._id.toString() !== user._id.toString()) {
          socket.to(sender.socketId).emit('message_read_receipt', readReceiptData);
        }
      } else {
        // For room messages, broadcast to all users in the room
        const roomId = message.room?.toString() || 'general';
        socket.to(roomId).emit('message_read_receipt', readReceiptData);
      }

    } catch (error) {
      console.error('Error marking message as read:', error);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  });

  // Mark multiple messages as read (for bulk operations)
  socket.on('mark_messages_read', async (data) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      const results = await Promise.all(
        data.messageIds.map(messageId => 
          messageService.markAsRead(messageId, user._id)
        )
      );

      // Send bulk read receipt updates
      results.forEach(message => {
        if (message) {
          const readReceiptData = {
            messageId: message._id,
            readBy: message.readBy,
            readByUser: {
              id: user._id,
              username: user.username,
              readAt: new Date()
            }
          };

          if (message.isPrivate) {
            const sender = userService.getUserById(message.sender);
            if (sender && sender.socketId && sender._id.toString() !== user._id.toString()) {
              socket.to(sender.socketId).emit('message_read_receipt', readReceiptData);
            }
          } else {
            const roomId = message.room?.toString() || 'general';
            socket.to(roomId).emit('message_read_receipt', readReceiptData);
          }
        }
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const user = await userService.setUserOffline(socket.id);
      
      if (user) {
        console.log(`${user.username} left the chat`);
        io.emit('user_left', { username: user.username, id: user._id });
      }
      
      // Clean up typing users
      delete typingUsers[socket.id];
      
      // Get updated online users list
      const onlineUsers = await userService.getOnlineUsers();
      io.emit('user_list', onlineUsers);
      io.emit('typing_users', Object.values(typingUsers));
    } catch (error) {
      console.error('Error handling disconnect:', error.message);
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);

app.get('/api/messages', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await messageService.getMessages(
      null, 
      parseInt(limit), 
      (parseInt(page) - 1) * parseInt(limit)
    );
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await userService.getOnlineUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server with MongoDB is running');
});

// Global error handler
app.use((err, req, res, next) => {
  log.error(`Unhandled error: ${err.message}`);
  log.error(err.stack);
  
  if (res.headersSent) {
    return next(err);
  }
  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
    
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  log.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    log.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    log.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };
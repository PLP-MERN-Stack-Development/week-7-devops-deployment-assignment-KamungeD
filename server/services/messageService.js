const Message = require('../models/Message');
const User = require('../models/User');

class MessageService {
  async createMessage(messageData) {
    try {
      const message = new Message(messageData);
      await message.save();
      
      // Populate sender information
      await message.populate('sender', 'username avatar');
      
      return message;
    } catch (error) {
      throw new Error('Error creating message: ' + error.message);
    }
  }

  async getMessages(roomId = null, limit = 50, skip = 0) {
    try {
      const query = roomId ? { room: roomId } : { room: null, isPrivate: false };
      
      return await Message.find(query)
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      throw new Error('Error getting messages: ' + error.message);
    }
  }

  async getMessagesByRoom(roomId, limit = 50, offset = 0) {
    try {
      console.log(`Getting messages for room: ${roomId}`);
      
      const messages = await Message.find({ room: roomId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('sender', 'username')
        .populate('room', 'name');
      
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting room messages:', error);
      throw new Error('Failed to get room messages: ' + error.message);
    }
  }

  async getPrivateMessages(userId1, userId2, limit = 50, offset = 0) {
    try {
      console.log(`Getting private messages between ${userId1} and ${userId2}`);
      
      const messages = await Message.find({
        isPrivate: true,
        $or: [
          { sender: userId1, recipient: userId2 },
          { sender: userId2, recipient: userId1 }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('sender', 'username')
        .populate('recipient', 'username');
      
      return messages.reverse();
    } catch (error) {
      console.error('Error getting private messages:', error);
      throw new Error('Failed to get private messages: ' + error.message);
    }
  }

  async addReaction(messageId, userId, reaction) {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw new Error('Message not found');

      if (!message.reactions) {
        message.reactions = new Map();
      }

      if (!message.reactions.get(reaction)) {
        message.reactions.set(reaction, []);
      }

      const users = message.reactions.get(reaction);
      if (!users.includes(userId)) {
        users.push(userId);
        message.reactions.set(reaction, users);
      }

      await message.save();
      return message;
    } catch (error) {
      throw new Error('Failed to add reaction: ' + error.message);
    }
  }

  async removeReaction(messageId, reaction) {
    try {
      console.log(`Removing reaction ${reaction} from message ${messageId}`);
      
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const currentCount = message.reactions.get(reaction) || 0;
      
      if (currentCount > 1) {
        // Decrement the count
        message.reactions.set(reaction, currentCount - 1);
      } else {
        // Remove the reaction entirely
        message.reactions.delete(reaction);
      }
      
      await message.save();
      return message;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw new Error('Failed to remove reaction: ' + error.message);
    }
  }

  async markAsRead(messageId, userId) {
    try {
      console.log(`Marking message ${messageId} as read by user ${userId}`);
      
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Check if user has already read this message
      const existingRead = message.readBy.find(
        read => read.user.toString() === userId.toString()
      );
      
      if (!existingRead) {
        message.readBy.push({
          user: userId,
          readAt: new Date()
        });
        await message.save();
      }
      
      return message;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read: ' + error.message);
    }
  }

  async getAllRooms() {
    try {
      const rooms = await Message.distinct('room').exec();
      return rooms.filter(room => room !== null);
    } catch (error) {
      console.error('Error getting all rooms:', error);
      throw new Error('Failed to get rooms: ' + error.message);
    }
  }
}

module.exports = new MessageService();
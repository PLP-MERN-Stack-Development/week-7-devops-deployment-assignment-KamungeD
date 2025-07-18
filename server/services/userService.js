const User = require('../models/User');

class UserService {
  async createOrUpdateUser(user, socketId) {
    try {
      user.isOnline = true;
      user.socketId = socketId;
      user.lastSeen = new Date();
      await user.save();
      return user;
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  }

  async setUserOffline(socketId) {
    try {
      const user = await User.findOne({ socketId });
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        user.socketId = null;
        await user.save();
        return user;
      }
      return null;
    } catch (error) {
      throw new Error('Error setting user offline: ' + error.message);
    }
  }

  async getOnlineUsers() {
    try {
      return await User.find({ isOnline: true })
        .select('username firstName lastName avatar isOnline lastSeen')
        .lean();
    } catch (error) {
      throw new Error('Error getting online users: ' + error.message);
    }
  }

  async getUserBySocketId(socketId) {
    try {
      return await User.findOne({ socketId });
    } catch (error) {
      throw new Error('Error getting user by socket ID: ' + error.message);
    }
  }

  async getUserById(userId) {
    try {
      return await User.findById(userId);
    } catch (error) {
      throw new Error('Error getting user by ID: ' + error.message);
    }
  }

  async getUserChatProfile(userId) {
    try {
      const user = await User.findById(userId);
      return user ? user.getChatProfile() : null;
    } catch (error) {
      throw new Error('Error getting user chat profile: ' + error.message);
    }
  }
}

module.exports = new UserService();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRE,
      issuer: 'realtime-chat-app',
      audience: 'chat-users'
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { 
      expiresIn: JWT_REFRESH_EXPIRE,
      issuer: 'realtime-chat-app',
      audience: 'chat-users'
    }
  );
};

const generateTokens = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId)
  };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

const verifyTokenAndGetUser = async (token) => {
  try {
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    
    return user;
  } catch (error) {
    throw new Error('Token verification failed: ' + error.message);
  }
};

const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    
    return generateAccessToken(user._id);
  } catch (error) {
    throw new Error('Token refresh failed: ' + error.message);
  }
};

// Parse "Bearer <token>" format
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  generateTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyTokenAndGetUser,
  refreshAccessToken,
  extractTokenFromHeader,
  JWT_SECRET,
  JWT_EXPIRE
};
const express = require('express');
const User = require('../models/User');
const { generateTokens, refreshAccessToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validatePasswordChange, 
  validateProfileUpdate 
} = require('../validators/manualValidation');

const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    await User.checkDuplicates(username, email);
    
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });
    
    await user.save();
    
    const tokens = generateTokens(user._id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user.getPublicProfile(),
      tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        errors: [{
          field,
          message: `${field} already exists`
        }]
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    if (user.isAccountLocked()) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to failed login attempts'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      await user.incrementFailedAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    await user.resetFailedAttempts();
    
    const tokens = generateTokens(user._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: user.getPublicProfile(),
      tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    const newAccessToken = await refreshAccessToken(refreshToken);
    
    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, validateProfileUpdate, async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    const user = req.user;
    
    if (email && email !== user.email) {
      await User.checkDuplicates(user.username, email, user._id);
    }
    
    if (email) user.email = email;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Profile update failed'
    });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, validatePasswordChange, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

module.exports = router;
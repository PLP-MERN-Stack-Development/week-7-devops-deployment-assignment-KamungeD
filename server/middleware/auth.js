const { verifyTokenAndGetUser, extractTokenFromHeader } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided, authorization denied' 
      });
    }
    
    const user = await verifyTokenAndGetUser(token);
    
    if (user.isAccountLocked()) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to failed login attempts'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const user = await verifyTokenAndGetUser(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    next();
  }
};

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    const user = await verifyTokenAndGetUser(token);
    
    if (user.isAccountLocked()) {
      throw new Error('Account is temporarily locked');
    }
    
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authenticateSocket
};
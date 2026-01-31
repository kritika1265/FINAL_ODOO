const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Auth Middleware
 * Verifies JWT tokens and authenticates users
 */

// @desc    Verify JWT token and authenticate user
// @access  Protected routes
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Get token from cookie if not in header
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized to access this route. No token provided.' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.user.id).select('-password');

      if (!user) {
        return res.status(401).json({ 
          message: 'User not found. Token is invalid.' 
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(403).json({ 
          message: 'Account has been deactivated. Please contact support.' 
        });
      }

      // Attach user to request object
      req.user = user;
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired. Please login again.' 
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Token is invalid. Please login again.' 
        });
      }

      return res.status(401).json({ 
        message: 'Not authorized to access this route.' 
      });
    }

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      message: 'Server error during authentication' 
    });
  }
};

// @desc    Optional authentication - doesn't fail if no token
// @access  Public routes with optional user context
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token, continue without user
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.user.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }

      next();

    } catch (error) {
      // Invalid token - continue without user
      req.user = null;
      next();
    }

  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = null;
    next();
  }
};

// @desc    Verify API key for webhook endpoints
// @access  Webhook routes
const authenticateWebhook = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ 
        message: 'API key is required' 
      });
    }

    if (apiKey !== process.env.WEBHOOK_API_KEY) {
      return res.status(401).json({ 
        message: 'Invalid API key' 
      });
    }

    next();

  } catch (error) {
    console.error('Webhook authentication error:', error);
    return res.status(500).json({ 
      message: 'Server error during webhook authentication' 
    });
  }
};

// @desc    Refresh token middleware
// @access  Public (with valid refresh token)
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'Refresh token is required' 
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findById(decoded.user.id).select('-password');

      if (!user) {
        return res.status(401).json({ 
          message: 'User not found' 
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ 
          message: 'Account has been deactivated' 
        });
      }

      // Generate new access token
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      const newAccessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token: newAccessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Refresh token has expired. Please login again.' 
        });
      }

      return res.status(401).json({ 
        message: 'Invalid refresh token' 
      });
    }

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ 
      message: 'Server error during token refresh' 
    });
  }
};

// @desc    Rate limiting per user
// @access  Protected routes
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id.toString();
    const now = Date.now();
    
    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    validRequests.push(now);
    requests.set(userId, validRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, timestamps] of requests.entries()) {
        const valid = timestamps.filter(t => now - t < windowMs);
        if (valid.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, valid);
        }
      }
    }

    next();
  };
};

// @desc    Check if user owns the resource
// @access  Protected routes
const checkOwnership = (Model, paramName = 'id', ownerField = 'user') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ 
          message: 'Resource not found' 
        });
      }

      // Admin can access all resources
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check ownership
      const ownerId = typeof resource[ownerField] === 'object' 
        ? resource[ownerField].toString() 
        : resource[ownerField];

      if (ownerId !== req.user.id.toString()) {
        return res.status(403).json({ 
          message: 'Not authorized to access this resource' 
        });
      }

      req.resource = resource;
      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ 
        message: 'Server error during ownership verification' 
      });
    }
  };
};

// @desc    Verify email is confirmed
// @access  Protected routes requiring email verification
const requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      message: 'Please verify your email address to access this feature',
      emailVerificationRequired: true
    });
  }
  next();
};

// @desc    Check if user has completed profile
// @access  Protected routes requiring complete profile
const requireCompleteProfile = (req, res, next) => {
  const requiredFields = ['name', 'companyName', 'gstin', 'phone'];
  const missingFields = requiredFields.filter(field => !req.user[field]);

  if (missingFields.length > 0) {
    return res.status(403).json({
      message: 'Please complete your profile to access this feature',
      missingFields,
      profileIncomplete: true
    });
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authenticateWebhook,
  refreshToken,
  userRateLimit,
  checkOwnership,
  requireEmailVerification,
  requireCompleteProfile
};
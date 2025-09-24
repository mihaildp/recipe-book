const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated (this should come after authMiddleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Check if admin account is active
    if (req.user.accountStatus !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin account is not active' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = adminMiddleware;

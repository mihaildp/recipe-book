const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Sign In
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    // Check if user exists
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        picture
      });
      await user.save();
      console.log('New user created:', email);
    } else {
      // Update last login
      user.lastLogin = new Date();
      user.picture = picture; // Update picture in case it changed
      await user.save();
      console.log('User logged in:', email);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Authentication failed',
      error: error.message 
    });
  }
});

// Verify token and get user info
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-__v')
      .populate('recipes', 'title photos category rating');
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        preferences: user.preferences,
        recipesCount: user.recipes.length,
        favoritesCount: user.favoriteRecipes.length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user data' 
    });
  }
});

// Logout (optional - mainly for client-side token removal)
router.post('/logout', authMiddleware, (req, res) => {
  // In a JWT-based system, logout is mainly handled client-side
  // But we can add any server-side cleanup here if needed
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

module.exports = router;

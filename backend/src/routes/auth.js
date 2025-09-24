const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Traditional Signup
router.post('/signup', async (req, res) => {
  try {
    console.log('🚀 Signup attempt started with body:', { ...req.body, password: '[HIDDEN]' });
    
    const { email, password, name, username } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    console.log('✅ Basic validation passed');
    
    // Password strength validation
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    console.log('✅ Password length validation passed');
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected');
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database connected, checking for existing user');
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username: username || null }] 
    });
    
    console.log('🔍 Existing user check result:', existingUser ? 'Found existing user' : 'No existing user found');
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }
    
    console.log('✅ No existing user, proceeding to create new user');
    
    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('🔑 Generated verification token');
    
    // Create new user - don't include googleId field for local users
    const userObject = {
      email,
      password,
      name,
      authMethod: 'local',
      emailVerificationToken: verificationToken,
      isEmailVerified: false,
      isOnboardingComplete: true  // Make onboarding optional
    };
    
    // Only add username if provided
    if (username) {
      userObject.username = username;
    }
    
    console.log('📝 Creating user with object:', { ...userObject, password: '[HIDDEN]', emailVerificationToken: '[HIDDEN]' });
    
    const user = new User(userObject);
    
    console.log('⚙️ User model created, attempting to save...');
    await user.save();
    
    console.log('✅ User saved successfully with ID:', user._id);
    
    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    let emailSent = false;
    try {
      console.log('📧 Attempting to send verification email...');
      await sendEmail({
        to: email,
        subject: 'Welcome to Recipe Book - Verify Your Email',
        html: `
          <h2>Welcome to Recipe Book!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for joining Recipe Book! Please verify your email address to get started:</p>
          <a href="${verificationUrl}" style="padding: 10px 20px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
          <p>Or copy and paste this link: ${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        `
      });
      emailSent = true;
      console.log('✅ Email sent successfully');
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError);
      // Continue with signup even if email fails
      console.log('⚠️ Email service not configured - user can still use the app');
    }
    
    console.log('🔑 Generating JWT token...');
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('✅ JWT token generated successfully');
    
    const responseData = {
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        authMethod: user.authMethod,
        isEmailVerified: user.isEmailVerified,
        isOnboardingComplete: user.isOnboardingComplete
      },
      message: emailSent 
        ? 'Account created successfully! Please verify your email.'
        : 'Account created successfully! You can start using Recipe Book right away.'
    };
    
    console.log('✅ Signup completed successfully, sending response');
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('🚨 SIGNUP ERROR DETAILS:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      errorDetails: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        stack: error.stack
      } : undefined
    });
  }
});

// Traditional Signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user
    const user = await User.findOne({ email, authMethod: 'local' });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT
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
        username: user.username,
        picture: user.picture,
        authMethod: user.authMethod,
        isEmailVerified: user.isEmailVerified,
        isOnboardingComplete: user.isOnboardingComplete,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error signing in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Google Sign In (existing)
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
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email } // Also check email to link existing accounts
      ]
    });
    
    if (!user) {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        picture,
        authMethod: 'google',
        isEmailVerified: true, // Google emails are pre-verified
        isOnboardingComplete: true  // Make onboarding optional
      });
      await user.save();
      console.log('New Google user created:', email);
    } else {
      // Update existing user
      if (!user.googleId) {
        user.googleId = googleId;
        user.authMethod = 'google';
      }
      user.lastLogin = new Date();
      user.picture = picture; // Update picture in case it changed
      await user.save();
      console.log('Google user logged in:', email);
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
        username: user.username,
        picture: user.picture,
        authMethod: user.authMethod,
        isEmailVerified: user.isEmailVerified,
        isOnboardingComplete: user.isOnboardingComplete,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Email Verification
router.post('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ emailVerificationToken: token });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email'
    });
  }
});

// Resend Verification Email
router.post('/resend-verification', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    await user.save();
    
    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Recipe Book Email',
      html: `
        <h2>Verify Your Email</h2>
        <p>Hi ${user.name},</p>
        <p>Please verify your email address to complete your Recipe Book registration:</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p>Or copy and paste this link: ${verificationUrl}</p>
      `
    });
    
    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification email'
    });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        to: email,
        subject: 'Reset your Recipe Book password',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to create a new password:</p>
          <a href="${resetUrl}" style="padding: 10px 20px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
          <p>Or copy and paste this link: ${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    res.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request'
    });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully!'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

// Complete Onboarding
router.post('/complete-onboarding', authMiddleware, async (req, res) => {
  try {
    const { 
      cookingLevel, 
      favoritesCuisines, 
      dietaryPreferences,
      bio,
      location
    } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user profile
    if (cookingLevel) user.cookingLevel = cookingLevel;
    if (favoritesCuisines) user.favoritesCuisines = favoritesCuisines;
    if (dietaryPreferences) user.dietaryPreferences = { ...user.dietaryPreferences, ...dietaryPreferences };
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    
    user.isOnboardingComplete = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'Onboarding completed!',
      user: {
        id: user._id,
        isOnboardingComplete: true,
        cookingLevel: user.cookingLevel,
        favoritesCuisines: user.favoritesCuisines,
        dietaryPreferences: user.dietaryPreferences
      }
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing onboarding'
    });
  }
});

// Skip Onboarding
router.post('/skip-onboarding', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Mark onboarding as complete even though skipped
    user.isOnboardingComplete = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'Onboarding skipped successfully',
      user: {
        id: user._id,
        isOnboardingComplete: true
      }
    });
  } catch (error) {
    console.error('Skip onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error skipping onboarding'
    });
  }
});

// Verify token and get user info
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -passwordResetToken -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        picture: user.picture,
        bio: user.bio,
        location: user.location,
        cookingLevel: user.cookingLevel,
        favoritesCuisines: user.favoritesCuisines,
        dietaryPreferences: user.dietaryPreferences,
        preferences: user.preferences,
        authMethod: user.authMethod,
        isEmailVerified: user.isEmailVerified,
        isOnboardingComplete: user.isOnboardingComplete,
        recipesCount: user.recipes?.length || 0,
        favoritesCount: user.favoriteRecipes?.length || 0,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user data' 
    });
  }
});

// Change Password (for logged in users)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    // Verify current password for local auth users
    if (user.authMethod === 'local') {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }
      
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
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

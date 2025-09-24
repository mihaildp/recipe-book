const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only for non-Google users
    }
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  authMethod: {
    type: String,
    enum: ['local', 'google'],
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Profile fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  picture: {
    type: String,
    default: null
  },
  coverPhoto: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  
  // Cooking Profile
  cookingLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'professional'],
    default: 'beginner'
  },
  favoritesCuisines: [String],
  dietaryPreferences: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    dairyFree: { type: Boolean, default: false },
    keto: { type: Boolean, default: false },
    paleo: { type: Boolean, default: false },
    other: [String]
  },
  
  // Recipe Management
  recipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  favoriteRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  collections: [{
    name: String,
    description: String,
    recipes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    }],
    isPublic: {
      type: Boolean,
      default: false
    }
  }],
  
  // Social Features
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Settings & Preferences
  preferences: {
    defaultCategory: String,
    defaultRegion: String,
    defaultServings: {
      type: Number,
      default: 4
    },
    measurementUnit: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    dietaryRestrictions: [String],
    allergies: [String],
    emailNotifications: {
      newFollower: { type: Boolean, default: true },
      recipeShared: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false }
    }
  },
  
  // Account Status
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  isOnboardingComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate username from email if not provided
userSchema.pre('save', function(next) {
  if (!this.username && this.isNew) {
    // Create username from email and timestamp to ensure uniqueness
    const emailPrefix = this.email.split('@')[0];
    const timestamp = Date.now().toString().slice(-4);
    this.username = `${emailPrefix}_${timestamp}`;
  }
  next();
});

// Virtual for follower count
userSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// Clean up sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

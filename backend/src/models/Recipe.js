const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ingredients: [{
    type: String,
    required: true,
    trim: true
  }],
  instructions: [{
    type: String,
    required: true,
    trim: true
  }],
  prepTime: {
    type: Number,
    default: 0,
    min: 0
  },
  cookTime: {
    type: Number,
    default: 0,
    min: 0
  },
  servings: {
    type: Number,
    default: 1,
    min: 1
  },
  category: {
    type: String,
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Soup', 'Salad', 'Breakfast', 'Snack', 'Beverage', ''],
    default: ''
  },
  region: {
    type: String,
    enum: ['Italian', 'Asian', 'Mexican', 'American', 'French', 'Mediterranean', 'Indian', 'Thai', 'Japanese', 'Greek', ''],
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  photos: [{
    url: String,
    publicId: String
  }],
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  tags: [String],
  
  // Sharing settings
  visibility: {
    type: String,
    enum: ['private', 'public', 'shared'],
    default: 'public' // Changed to public by default
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    permission: {
      type: String,
      enum: ['view', 'copy', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Track recipe origin if copied/forked
  originalRecipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    default: null
  },
  forkedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  copies: {
    type: Number,
    default: 0
  },
  
  // Comments from shared users
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  sourceUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
recipeSchema.index({ owner: 1, createdAt: -1 });
recipeSchema.index({ title: 'text', tags: 'text' });
recipeSchema.index({ category: 1, region: 1 });
recipeSchema.index({ visibility: 1, rating: -1 });
recipeSchema.index({ 'sharedWith.user': 1 });
recipeSchema.index({ 'sharedWith.email': 1 });

// Virtual for total time
recipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Virtual for average comment rating
recipeSchema.virtual('averageRating').get(function() {
  if (this.comments.length === 0) return this.rating;
  const totalRating = this.comments.reduce((sum, comment) => {
    return sum + (comment.rating || 0);
  }, 0);
  return totalRating / this.comments.filter(c => c.rating).length;
});

// Method to check if user has access
recipeSchema.methods.hasAccess = function(userId, userEmail) {
  // Owner always has access
  if (this.owner.toString() === userId.toString()) return true;
  
  // Public recipes are accessible to all
  if (this.visibility === 'public') return true;
  
  // Check if shared with user
  if (this.visibility === 'shared') {
    return this.sharedWith.some(share => 
      (share.user && share.user.toString() === userId.toString()) ||
      (share.email && share.email === userEmail)
    );
  }
  
  return false;
};

// Method to check permission level
recipeSchema.methods.getPermission = function(userId, userEmail) {
  // Owner has full permissions
  if (this.owner.toString() === userId.toString()) return 'owner';
  
  // Find share entry
  const share = this.sharedWith.find(s => 
    (s.user && s.user.toString() === userId.toString()) ||
    (s.email && s.email === userEmail)
  );
  
  return share ? share.permission : null;
};

// Method to check if user has liked
recipeSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;

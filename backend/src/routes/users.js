const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const authMiddleware = require('../middleware/auth');

// Get user profile (enhanced)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -passwordResetToken -__v')
      .populate('recipes', 'title category region rating photos visibility')
      .populate('favoriteRecipes', 'title category photos')
      .populate('followers', 'name username picture')
      .populate('following', 'name username picture');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching profile' 
    });
  }
});

// Update user profile
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'username', 'bio', 'location', 'website',
      'cookingLevel', 'favoritesCuisines', 'dietaryPreferences'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // Check if username is already taken
    if (updates.username) {
      const existingUser = await User.findOne({ 
        username: updates.username,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken -__v');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile' 
    });
  }
});

// Update user preferences
router.patch('/preferences', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update preferences
    const { 
      defaultCategory, 
      defaultRegion, 
      defaultServings,
      measurementUnit,
      dietaryRestrictions, 
      allergies,
      emailNotifications 
    } = req.body;
    
    if (defaultCategory !== undefined) user.preferences.defaultCategory = defaultCategory;
    if (defaultRegion !== undefined) user.preferences.defaultRegion = defaultRegion;
    if (defaultServings !== undefined) user.preferences.defaultServings = defaultServings;
    if (measurementUnit !== undefined) user.preferences.measurementUnit = measurementUnit;
    if (dietaryRestrictions !== undefined) user.preferences.dietaryRestrictions = dietaryRestrictions;
    if (allergies !== undefined) user.preferences.allergies = allergies;
    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications = { 
        ...user.preferences.emailNotifications, 
        ...emailNotifications 
      };
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating preferences' 
    });
  }
});

// Get user statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('recipes', 'category region rating createdAt visibility likes views');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const stats = {
      totalRecipes: user.recipes.length,
      totalFavorites: user.favoriteRecipes.length,
      totalFollowers: user.followers.length,
      totalFollowing: user.following.length,
      totalCollections: user.collections.length,
      recipesByCategory: {},
      recipesByRegion: {},
      recipesByVisibility: {
        public: 0,
        private: 0,
        shared: 0
      },
      averageRating: 0,
      totalLikes: 0,
      totalViews: 0,
      recentRecipes: [],
      popularRecipes: [],
      monthlyRecipeCount: []
    };
    
    // Calculate statistics
    let totalRating = 0;
    let ratedRecipes = 0;
    
    user.recipes.forEach(recipe => {
      // Category stats
      if (recipe.category) {
        stats.recipesByCategory[recipe.category] = 
          (stats.recipesByCategory[recipe.category] || 0) + 1;
      }
      
      // Region stats
      if (recipe.region) {
        stats.recipesByRegion[recipe.region] = 
          (stats.recipesByRegion[recipe.region] || 0) + 1;
      }
      
      // Visibility stats
      if (recipe.visibility) {
        stats.recipesByVisibility[recipe.visibility]++;
      }
      
      // Rating stats
      if (recipe.rating > 0) {
        totalRating += recipe.rating;
        ratedRecipes++;
      }
      
      // Engagement stats
      if (recipe.likes) stats.totalLikes += recipe.likes.length;
      if (recipe.views) stats.totalViews += recipe.views;
    });
    
    if (ratedRecipes > 0) {
      stats.averageRating = parseFloat((totalRating / ratedRecipes).toFixed(1));
    }
    
    // Get recent recipes
    stats.recentRecipes = user.recipes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(r => ({
        _id: r._id,
        title: r.title,
        category: r.category,
        rating: r.rating,
        createdAt: r.createdAt
      }));
    
    // Get popular recipes (by likes)
    stats.popularRecipes = user.recipes
      .filter(r => r.likes)
      .sort((a, b) => b.likes.length - a.likes.length)
      .slice(0, 5)
      .map(r => ({
        _id: r._id,
        title: r.title,
        likes: r.likes ? r.likes.length : 0,
        views: r.views || 0
      }));
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics' 
    });
  }
});

// Get user collections
router.get('/collections', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('collections.recipes', 'title photos category');
    
    res.json({
      success: true,
      collections: user.collections
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching collections' 
    });
  }
});

// Create recipe collection
router.post('/collections', authMiddleware, async (req, res) => {
  try {
    const { name, description, isPublic, recipes } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if collection name already exists for this user
    const existingCollection = user.collections.find(c => c.name === name);
    if (existingCollection) {
      return res.status(400).json({
        success: false,
        message: 'Collection with this name already exists'
      });
    }
    
    user.collections.push({
      name,
      description: description || '',
      isPublic: isPublic || false,
      recipes: recipes || []
    });
    
    await user.save();
    
    const newCollection = user.collections[user.collections.length - 1];
    
    res.json({
      success: true,
      message: 'Collection created successfully',
      collection: newCollection
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating collection' 
    });
  }
});

// Update recipe collection
router.patch('/collections/:collectionId', authMiddleware, async (req, res) => {
  try {
    const { collectionId } = req.params;
    const updates = req.body;
    
    const user = await User.findById(req.user._id);
    const collection = user.collections.id(collectionId);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }
    
    // Update allowed fields
    if (updates.name !== undefined) collection.name = updates.name;
    if (updates.description !== undefined) collection.description = updates.description;
    if (updates.isPublic !== undefined) collection.isPublic = updates.isPublic;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Collection updated successfully',
      collection
    });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating collection' 
    });
  }
});

// Add recipe to collection
router.post('/collections/:collectionId/recipes', authMiddleware, async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { recipeId } = req.body;
    
    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Recipe ID is required'
      });
    }
    
    const user = await User.findById(req.user._id);
    const collection = user.collections.id(collectionId);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }
    
    // Check if recipe already in collection
    if (!collection.recipes.includes(recipeId)) {
      collection.recipes.push(recipeId);
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Recipe added to collection',
      collection
    });
  } catch (error) {
    console.error('Add to collection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding recipe to collection' 
    });
  }
});

// Remove recipe from collection
router.delete('/collections/:collectionId/recipes/:recipeId', authMiddleware, async (req, res) => {
  try {
    const { collectionId, recipeId } = req.params;
    
    const user = await User.findById(req.user._id);
    const collection = user.collections.id(collectionId);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }
    
    collection.recipes = collection.recipes.filter(
      r => r.toString() !== recipeId
    );
    await user.save();
    
    res.json({
      success: true,
      message: 'Recipe removed from collection'
    });
  } catch (error) {
    console.error('Remove from collection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing recipe from collection' 
    });
  }
});

// Delete collection
router.delete('/collections/:collectionId', authMiddleware, async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    const user = await User.findById(req.user._id);
    const collectionIndex = user.collections.findIndex(
      c => c._id.toString() === collectionId
    );
    
    if (collectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }
    
    user.collections.splice(collectionIndex, 1);
    await user.save();
    
    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting collection' 
    });
  }
});

// Follow user
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }
    
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const currentUser = await User.findById(req.user._id);
    
    // Check if already following
    if (!currentUser.following.includes(userId)) {
      currentUser.following.push(userId);
      userToFollow.followers.push(req.user._id);
      
      await Promise.all([
        currentUser.save(),
        userToFollow.save()
      ]);
    }
    
    res.json({
      success: true,
      message: `You are now following ${userToFollow.name}`,
      following: true
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error following user' 
    });
  }
});

// Unfollow user
router.post('/:userId/unfollow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const currentUser = await User.findById(req.user._id);
    
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user._id.toString()
    );
    
    await Promise.all([
      currentUser.save(),
      userToUnfollow.save()
    ]);
    
    res.json({
      success: true,
      message: `You have unfollowed ${userToUnfollow.name}`,
      following: false
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error unfollowing user' 
    });
  }
});

// Check if following
router.get('/:userId/following-status', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);
    
    const isFollowing = currentUser.following.includes(userId);
    
    res.json({
      success: true,
      following: isFollowing
    });
  } catch (error) {
    console.error('Check following error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error checking following status' 
    });
  }
});

// Search users
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user._id },
      accountStatus: 'active'
    })
    .select('name username picture bio followersCount cookingLevel')
    .limit(parseInt(limit));
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching users' 
    });
  }
});

// Get user's public profile by username
router.get('/u/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username, accountStatus: 'active' })
      .select('name username picture bio location website cookingLevel favoritesCuisines createdAt')
      .populate({
        path: 'recipes',
        match: { visibility: 'public' },
        select: 'title category region rating photos likes views createdAt',
        options: { limit: 12, sort: { createdAt: -1 } }
      });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get public collections
    const publicCollections = user.collections.filter(c => c.isPublic);
    
    res.json({
      success: true,
      user: {
        ...user.toJSON(),
        recipesCount: user.recipes.length,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        collections: publicCollections
      }
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user profile' 
    });
  }
});

// Add recipe to favorites
router.post('/favorites/:recipeId', authMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    if (!user.favoriteRecipes.includes(recipeId)) {
      user.favoriteRecipes.push(recipeId);
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Recipe added to favorites'
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding to favorites' 
    });
  }
});

// Remove recipe from favorites
router.delete('/favorites/:recipeId', authMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.favoriteRecipes = user.favoriteRecipes.filter(
      id => id.toString() !== recipeId
    );
    await user.save();
    
    res.json({
      success: true,
      message: 'Recipe removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing from favorites' 
    });
  }
});

// Delete user account (with confirmation)
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const { password, confirmation } = req.body;
    
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Please confirm account deletion by typing: DELETE MY ACCOUNT'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    // Verify password for security (local auth only)
    if (user.authMethod === 'local') {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password required to delete account'
        });
      }
      
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }
    }
    
    // Remove user from followers/following lists
    await User.updateMany(
      { followers: req.user._id },
      { $pull: { followers: req.user._id } }
    );
    
    await User.updateMany(
      { following: req.user._id },
      { $pull: { following: req.user._id } }
    );
    
    // Delete all user's recipes
    await Recipe.deleteMany({ owner: req.user._id });
    
    // Remove user from shared recipes
    await Recipe.updateMany(
      { 'sharedWith.user': req.user._id },
      { $pull: { sharedWith: { user: req.user._id } } }
    );
    
    // Delete user account
    await User.findByIdAndDelete(req.user._id);
    
    res.json({
      success: true,
      message: 'Account deleted successfully. We\'re sorry to see you go!'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting account' 
    });
  }
});

module.exports = router;

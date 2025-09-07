const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-__v -googleId')
      .populate('recipes', 'title category region rating');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching profile' 
    });
  }
});

// Update user preferences
router.patch('/preferences', authMiddleware, async (req, res) => {
  try {
    const { defaultCategory, defaultRegion, dietaryRestrictions, allergies } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (defaultCategory !== undefined) user.preferences.defaultCategory = defaultCategory;
    if (defaultRegion !== undefined) user.preferences.defaultRegion = defaultRegion;
    if (dietaryRestrictions !== undefined) user.preferences.dietaryRestrictions = dietaryRestrictions;
    if (allergies !== undefined) user.preferences.allergies = allergies;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
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
      .populate('recipes', 'category region rating createdAt');
    
    const stats = {
      totalRecipes: user.recipes.length,
      totalFavorites: user.favoriteRecipes.length,
      recipesByCategory: {},
      recipesByRegion: {},
      averageRating: 0,
      recentRecipes: []
    };
    
    // Calculate statistics
    let totalRating = 0;
    let ratedRecipes = 0;
    
    user.recipes.forEach(recipe => {
      // Category stats
      if (recipe.category) {
        stats.recipesByCategory[recipe.category] = (stats.recipesByCategory[recipe.category] || 0) + 1;
      }
      
      // Region stats
      if (recipe.region) {
        stats.recipesByRegion[recipe.region] = (stats.recipesByRegion[recipe.region] || 0) + 1;
      }
      
      // Rating stats
      if (recipe.rating > 0) {
        totalRating += recipe.rating;
        ratedRecipes++;
      }
    });
    
    if (ratedRecipes > 0) {
      stats.averageRating = (totalRating / ratedRecipes).toFixed(1);
    }
    
    // Get recent recipes
    stats.recentRecipes = user.recipes
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics' 
    });
  }
});

// Delete user account (with all recipes)
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const Recipe = require('../models/Recipe');
    
    // Delete all user's recipes
    await Recipe.deleteMany({ owner: req.user._id });
    
    // Delete user account
    await User.findByIdAndDelete(req.user._id);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting account' 
    });
  }
});

module.exports = router;

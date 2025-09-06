const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Share a recipe with specific users
router.post('/:id/share', authMiddleware, [
  body('emails').isArray().withMessage('Emails must be an array'),
  body('emails.*').isEmail().withMessage('Invalid email format'),
  body('permission').isIn(['view', 'copy', 'edit']).withMessage('Invalid permission level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emails, permission = 'view', message } = req.body;
    
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found or you do not have permission' 
      });
    }
    
    // Find users by email and add to sharedWith
    const shareResults = [];
    for (const email of emails) {
      const userToShare = await User.findOne({ email });
      
      // Check if already shared
      const existingShare = recipe.sharedWith.find(s => 
        s.email === email || (s.user && userToShare && s.user.toString() === userToShare._id.toString())
      );
      
      if (!existingShare) {
        recipe.sharedWith.push({
          user: userToShare ? userToShare._id : null,
          email: email,
          permission: permission,
          sharedAt: new Date()
        });
        shareResults.push({ email, status: 'shared' });
      } else {
        // Update permission if different
        existingShare.permission = permission;
        shareResults.push({ email, status: 'updated' });
      }
    }
    
    // Update visibility if not already shared
    if (recipe.visibility === 'private' && recipe.sharedWith.length > 0) {
      recipe.visibility = 'shared';
    }
    
    await recipe.save();
    
    res.json({
      success: true,
      message: 'Recipe shared successfully',
      results: shareResults
    });
  } catch (error) {
    console.error('Error sharing recipe:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sharing recipe' 
    });
  }
});

// Update recipe visibility (public/private)
router.patch('/:id/visibility', authMiddleware, async (req, res) => {
  try {
    const { visibility } = req.body;
    
    if (!['private', 'public', 'shared'].includes(visibility)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid visibility setting' 
      });
    }
    
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    recipe.visibility = visibility;
    
    // If changing to private, clear sharedWith
    if (visibility === 'private') {
      recipe.sharedWith = [];
    }
    
    await recipe.save();
    
    res.json({
      success: true,
      message: `Recipe is now ${visibility}`,
      visibility
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating visibility' 
    });
  }
});

// Remove sharing for specific users
router.delete('/:id/share', authMiddleware, async (req, res) => {
  try {
    const { emails } = req.body;
    
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    // Remove specified emails from sharedWith
    recipe.sharedWith = recipe.sharedWith.filter(share => 
      !emails.includes(share.email)
    );
    
    // Update visibility if no longer shared
    if (recipe.sharedWith.length === 0 && recipe.visibility === 'shared') {
      recipe.visibility = 'private';
    }
    
    await recipe.save();
    
    res.json({
      success: true,
      message: 'Sharing removed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error removing sharing' 
    });
  }
});

// Get all recipes shared with the current user
router.get('/shared-with-me', authMiddleware, async (req, res) => {
  try {
    const { category, region, search, sort = '-sharedWith.sharedAt' } = req.query;
    
    let query = {
      $or: [
        { 'sharedWith.user': req.user._id },
        { 'sharedWith.email': req.user.email }
      ]
    };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (region && region !== 'all') {
      query.region = region;
    }
    
    if (search) {
      query.$and = [
        query.$or,
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        }
      ];
      delete query.$or;
    }
    
    const recipes = await Recipe.find(query)
      .populate('owner', 'name email picture')
      .sort(sort)
      .select('-__v');
    
    res.json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Error fetching shared recipes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching shared recipes' 
    });
  }
});

// Get public recipes (discover/explore)
router.get('/public', authMiddleware, async (req, res) => {
  try {
    const { category, region, search, sort = '-createdAt', page = 1, limit = 12 } = req.query;
    
    let query = { 
      visibility: 'public',
      owner: { $ne: req.user._id } // Exclude user's own recipes
    };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (region && region !== 'all') {
      query.region = region;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const recipes = await Recipe.find(query)
      .populate('owner', 'name email picture')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Recipe.countDocuments(query);
    
    res.json({
      success: true,
      count: recipes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      recipes
    });
  } catch (error) {
    console.error('Error fetching public recipes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching public recipes' 
    });
  }
});

// Copy/fork a shared or public recipe
router.post('/:id/copy', authMiddleware, async (req, res) => {
  try {
    const originalRecipe = await Recipe.findById(req.params.id)
      .populate('owner', 'name');
    
    if (!originalRecipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    // Check if user has access to copy
    if (!originalRecipe.hasAccess(req.user._id, req.user.email)) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to copy this recipe' 
      });
    }
    
    const permission = originalRecipe.getPermission(req.user._id, req.user.email);
    if (permission === 'view' && originalRecipe.visibility !== 'public') {
      return res.status(403).json({ 
        success: false,
        message: 'You only have view permission for this recipe' 
      });
    }
    
    // Create a copy of the recipe
    const recipeCopy = new Recipe({
      title: `${originalRecipe.title} (Copy)`,
      ingredients: [...originalRecipe.ingredients],
      instructions: [...originalRecipe.instructions],
      prepTime: originalRecipe.prepTime,
      cookTime: originalRecipe.cookTime,
      servings: originalRecipe.servings,
      category: originalRecipe.category,
      region: originalRecipe.region,
      notes: originalRecipe.notes,
      photos: [...originalRecipe.photos],
      tags: [...originalRecipe.tags],
      nutrition: originalRecipe.nutrition ? { ...originalRecipe.nutrition } : null,
      owner: req.user._id,
      originalRecipe: originalRecipe._id,
      forkedFrom: originalRecipe.owner,
      visibility: 'private', // Copies start as private
      rating: 0 // Reset rating for copy
    });
    
    await recipeCopy.save();
    
    // Increment copy count on original
    originalRecipe.copies = (originalRecipe.copies || 0) + 1;
    await originalRecipe.save();
    
    // Add to user's recipes
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { recipes: recipeCopy._id } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Recipe copied successfully',
      recipe: recipeCopy
    });
  } catch (error) {
    console.error('Error copying recipe:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error copying recipe' 
    });
  }
});

// Add comment/review to a shared recipe
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { text, rating } = req.body;
    
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    // Check if user has access
    if (!recipe.hasAccess(req.user._id, req.user.email)) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have access to this recipe' 
      });
    }
    
    // Check if user already commented
    const existingComment = recipe.comments.find(
      c => c.user.toString() === req.user._id.toString()
    );
    
    if (existingComment) {
      // Update existing comment
      existingComment.text = text;
      if (rating) existingComment.rating = rating;
      existingComment.createdAt = new Date();
    } else {
      // Add new comment
      recipe.comments.push({
        user: req.user._id,
        text,
        rating,
        createdAt: new Date()
      });
    }
    
    await recipe.save();
    
    // Populate user info for the response
    await recipe.populate('comments.user', 'name picture');
    
    res.json({
      success: true,
      message: existingComment ? 'Comment updated' : 'Comment added',
      comments: recipe.comments
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error adding comment' 
    });
  }
});

// Delete a comment
router.delete('/:id/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    const comment = recipe.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }
    
    // Check if user owns the comment or the recipe
    if (comment.user.toString() !== req.user._id.toString() && 
        recipe.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only delete your own comments' 
      });
    }
    
    recipe.comments.pull(req.params.commentId);
    await recipe.save();
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting comment' 
    });
  }
});

// Get sharing details for a recipe
router.get('/:id/sharing', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      owner: req.user._id
    })
    .populate('sharedWith.user', 'name email picture')
    .select('title visibility sharedWith');
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    res.json({
      success: true,
      sharing: {
        visibility: recipe.visibility,
        sharedWith: recipe.sharedWith.map(share => ({
          email: share.email,
          user: share.user,
          permission: share.permission,
          sharedAt: share.sharedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching sharing details' 
    });
  }
});

module.exports = router;

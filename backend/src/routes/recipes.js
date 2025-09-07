const express = require('express');
const router = express.Router();
const multer = require('multer');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all recipes for the authenticated user
router.get('/my-recipes', authMiddleware, async (req, res) => {
  try {
    const { category, region, search, sort = '-createdAt' } = req.query;
    
    let query = { owner: req.user._id };
    
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
    
    const recipes = await Recipe.find(query)
      .sort(sort)
      .select('-__v');
    
    res.json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recipes' 
    });
  }
});

// Get a single recipe (with access control)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('owner', 'name email picture')
      .populate('comments.user', 'name picture')
      .select('-__v');
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    // Check if user has access to this recipe
    const hasAccess = recipe.hasAccess(req.user._id, req.user.email);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have access to this recipe' 
      });
    }
    
    // Increment view count if not owner
    if (recipe.owner._id.toString() !== req.user._id.toString()) {
      recipe.views = (recipe.views || 0) + 1;
      await recipe.save();
    }
    
    res.json({
      success: true,
      recipe
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recipe' 
    });
  }
});

// Create a new recipe
router.post('/', authMiddleware, async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      owner: req.user._id
    };
    
    // Filter out empty ingredients and instructions
    if (recipeData.ingredients) {
      recipeData.ingredients = recipeData.ingredients.filter(i => i.trim());
    }
    if (recipeData.instructions) {
      recipeData.instructions = recipeData.instructions.filter(i => i.trim());
    }
    
    const recipe = new Recipe(recipeData);
    await recipe.save();
    
    // Add recipe to user's recipes array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { recipes: recipe._id } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error creating recipe',
      error: error.message 
    });
  }
});

// Update a recipe (with permission check)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    // Check permission
    const permission = recipe.getPermission(req.user._id, req.user.email);
    
    if (permission !== 'owner' && permission !== 'edit') {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to edit this recipe' 
      });
    }
    
    // Filter out empty ingredients and instructions
    if (req.body.ingredients) {
      req.body.ingredients = req.body.ingredients.filter(i => i.trim());
    }
    if (req.body.instructions) {
      req.body.instructions = req.body.instructions.filter(i => i.trim());
    }
    
    // Don't allow non-owners to change visibility or sharing settings
    if (permission !== 'owner') {
      delete req.body.visibility;
      delete req.body.sharedWith;
      delete req.body.owner;
    }
    
    Object.assign(recipe, req.body);
    recipe.updatedAt = new Date();
    await recipe.save();
    
    res.json({
      success: true,
      message: 'Recipe updated successfully',
      recipe
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating recipe',
      error: error.message 
    });
  }
});

// Delete a recipe (owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found or you do not have permission to delete it' 
      });
    }
    
    await recipe.deleteOne();
    
    // Remove recipe from user's recipes array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { recipes: recipe._id, favoriteRecipes: recipe._id } }
    );
    
    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting recipe' 
    });
  }
});

// Upload images for a recipe (simplified version - in production, use Cloudinary or S3)
router.post('/:id/images', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    // Check permission
    const permission = recipe.getPermission(req.user._id, req.user.email);
    
    if (permission !== 'owner' && permission !== 'edit') {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to add images to this recipe' 
      });
    }
    
    // In production, upload to Cloudinary/S3 here
    // For now, we'll store base64 (not recommended for production)
    const images = req.files.map(file => ({
      url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      publicId: `recipe_${recipe._id}_${Date.now()}`
    }));
    
    recipe.photos.push(...images);
    await recipe.save();
    
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      photos: recipe.photos
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error uploading images',
      error: error.message 
    });
  }
});

// Toggle favorite recipe
router.post('/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipe not found' 
      });
    }
    
    // Check if user has access
    const hasAccess = recipe.hasAccess(req.user._id, req.user.email);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have access to this recipe' 
      });
    }
    
    const user = await User.findById(req.user._id);
    const isFavorite = user.favoriteRecipes.includes(recipe._id);
    
    if (isFavorite) {
      user.favoriteRecipes.pull(recipe._id);
      // Also remove from recipe likes if it's there
      if (recipe.likes.includes(req.user._id)) {
        recipe.likes.pull(req.user._id);
        await recipe.save();
      }
    } else {
      user.favoriteRecipes.push(recipe._id);
      // Also add to recipe likes
      if (!recipe.likes.includes(req.user._id)) {
        recipe.likes.push(req.user._id);
        await recipe.save();
      }
    }
    
    await user.save();
    
    res.json({
      success: true,
      isFavorite: !isFavorite,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating favorites' 
    });
  }
});

// Get favorite recipes
router.get('/favorites/list', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favoriteRecipes',
        select: 'title photos category region rating prepTime cookTime servings visibility owner',
        populate: {
          path: 'owner',
          select: 'name email picture'
        }
      });
    
    res.json({
      success: true,
      favorites: user.favoriteRecipes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching favorites' 
    });
  }
});

module.exports = router;

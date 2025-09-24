const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalRecipes,
      publicRecipes,
      privateRecipes,
      recentUsers,
      recentRecipes
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountStatus: 'active' }),
      User.countDocuments({ accountStatus: 'suspended' }),
      Recipe.countDocuments(),
      Recipe.countDocuments({ visibility: 'public' }),
      Recipe.countDocuments({ visibility: 'private' }),
      User.find().sort({ createdAt: -1 }).limit(10).select('name email createdAt accountStatus'),
      Recipe.find().sort({ createdAt: -1 }).limit(10).populate('owner', 'name email').select('title owner createdAt visibility')
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          deleted: totalUsers - activeUsers - suspendedUsers
        },
        recipes: {
          total: totalRecipes,
          public: publicRecipes,
          private: privateRecipes,
          shared: totalRecipes - publicRecipes - privateRecipes
        }
      },
      recent: {
        users: recentUsers,
        recipes: recentRecipes
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin stats'
    });
  }
});

// Get All Users
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== 'all') {
      query.accountStatus = status;
    }

    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('recipes', 'title')
      .lean();

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Get All Recipes
router.get('/recipes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const visibility = req.query.visibility || 'all';
    const category = req.query.category || 'all';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (visibility !== 'all') {
      query.visibility = visibility;
    }
    if (category !== 'all') {
      query.category = category;
    }

    const recipes = await Recipe.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('owner', 'name email accountStatus')
      .lean();

    const total = await Recipe.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      recipes,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecipes: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes'
    });
  }
});

// Update User Status (Block/Unblock)
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;

    if (!['active', 'suspended', 'deleted'].includes(accountStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account status'
      });
    }

    // Prevent admin from suspending themselves
    if (id === req.user._id.toString() && accountStatus !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend your own admin account'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { accountStatus },
      { new: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${accountStatus === 'active' ? 'activated' : accountStatus}`,
      user
    });
  } catch (error) {
    console.error('Admin update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

// Delete Recipe (Admin)
router.delete('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Log admin action
    console.log(`Admin ${req.user.email} deleted recipe "${recipe.title}" (ID: ${id}) - Reason: ${reason || 'No reason provided'}`);

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting recipe'
    });
  }
});

// Update Recipe Visibility (Admin override)
router.patch('/recipes/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility, reason } = req.body;

    if (!['public', 'private', 'shared'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visibility setting'
      });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { visibility },
      { new: true }
    ).populate('owner', 'name email');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Log admin action
    console.log(`Admin ${req.user.email} changed recipe "${recipe.title}" visibility to ${visibility} - Reason: ${reason || 'No reason provided'}`);

    res.json({
      success: true,
      message: 'Recipe visibility updated',
      recipe
    });
  } catch (error) {
    console.error('Admin update recipe visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating recipe visibility'
    });
  }
});

// Get User Details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -emailVerificationToken -passwordResetToken')
      .populate('recipes', 'title visibility createdAt')
      .populate('favoriteRecipes', 'title author')
      .lean();

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
    console.error('Admin get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
});

// Promote User to Admin
router.patch('/users/:id/promote', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { role: 'admin' },
      { new: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log admin action
    console.log(`Admin ${req.user.email} promoted user ${user.email} to admin`);

    res.json({
      success: true,
      message: 'User promoted to admin',
      user
    });
  } catch (error) {
    console.error('Admin promote user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error promoting user'
    });
  }
});

// Demote Admin to User
router.patch('/users/:id/demote', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-demotion
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote yourself'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: 'user' },
      { new: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log admin action
    console.log(`Admin ${req.user.email} demoted admin ${user.email} to user`);

    res.json({
      success: true,
      message: 'Admin demoted to user',
      user
    });
  } catch (error) {
    console.error('Admin demote user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error demoting user'
    });
  }
});

module.exports = router;

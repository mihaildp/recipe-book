const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-book');
    console.log('Connected to database');
    
    // Update existing Google users
    const result = await User.updateMany(
      { googleId: { $exists: true }, authMethod: { $exists: false } },
      { 
        $set: { 
          authMethod: 'google',
          isEmailVerified: true,
          isOnboardingComplete: true, // Set to true for existing users
          cookingLevel: 'intermediate',
          favoritesCuisines: [],
          dietaryPreferences: {},
          collections: [],
          following: [],
          followers: [],
          bio: '',
          location: '',
          website: '',
          accountStatus: 'active'
        }
      }
    );
    
    console.log(`Migration completed successfully. Updated ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateUsers();

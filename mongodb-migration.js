// MongoDB Migration Script - Make All Recipes Public
// Run this in MongoDB Atlas or your MongoDB shell

// Option 1: Make ALL existing recipes public
db.recipes.updateMany(
  {},
  { $set: { visibility: 'public' } }
);

// Option 2: Make only private recipes public (keep shared as is)
db.recipes.updateMany(
  { visibility: 'private' },
  { $set: { visibility: 'public' } }
);

// Option 3: Make recipes public for specific users
db.recipes.updateMany(
  { owner: ObjectId('YOUR_USER_ID_HERE') },
  { $set: { visibility: 'public' } }
);

// Verify the changes
db.recipes.countDocuments({ visibility: 'public' });
db.recipes.countDocuments({ visibility: 'private' });
db.recipes.countDocuments({ visibility: 'shared' });
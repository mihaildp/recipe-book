const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const makeUserAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-book');
    console.log('Connected to MongoDB');

    // Your email address
    const adminEmail = 'mihaildp@gmail.com';

    // Find user by email
    let user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log(`User with email ${adminEmail} not found. Creating admin user...`);
      
      // Create admin user if doesn't exist
      user = new User({
        email: adminEmail,
        name: 'Mihail Petrov',
        password: 'Admin123!', // You can change this later
        authMethod: 'local',
        role: 'admin',
        isEmailVerified: true,
        isOnboardingComplete: true,
        accountStatus: 'active'
      });
      
      await user.save();
      console.log('✅ Admin user created successfully!');
    } else {
      // Update existing user to admin
      user.role = 'admin';
      user.accountStatus = 'active';
      await user.save();
      console.log('✅ User promoted to admin successfully!');
    }

    console.log(`\n🎉 Admin Details:`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Status: ${user.accountStatus}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    process.exit(1);
  }
};

makeUserAdmin();

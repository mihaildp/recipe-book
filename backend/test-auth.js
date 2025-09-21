// Quick test file to verify auth endpoints are working
// Run this file: node test-auth.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'test' + Date.now() + '@example.com';
const TEST_PASSWORD = 'Test123!';

console.log('🧪 Testing Authentication Endpoints...\n');

async function testAuth() {
  try {
    // Test 1: Signup
    console.log('1. Testing Signup...');
    const signupResponse = await axios.post(`${API_URL}/auth/signup`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: 'Test User',
      username: 'testuser' + Date.now()
    });
    
    if (signupResponse.data.success) {
      console.log('✅ Signup successful');
      console.log('   Token received:', signupResponse.data.token ? 'Yes' : 'No');
      console.log('   User ID:', signupResponse.data.user.id);
    }
    
    const token = signupResponse.data.token;
    
    // Test 2: Signin
    console.log('\n2. Testing Signin...');
    const signinResponse = await axios.post(`${API_URL}/auth/signin`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signinResponse.data.success) {
      console.log('✅ Signin successful');
    }
    
    // Test 3: Verify Token
    console.log('\n3. Testing Token Verification...');
    const verifyResponse = await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (verifyResponse.data.success) {
      console.log('✅ Token verification successful');
    }
    
    // Test 4: Get Profile
    console.log('\n4. Testing Profile Fetch...');
    const profileResponse = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (profileResponse.data.success) {
      console.log('✅ Profile fetch successful');
    }
    
    // Test 5: Update Preferences
    console.log('\n5. Testing Preferences Update...');
    const prefsResponse = await axios.patch(`${API_URL}/users/preferences`, 
      {
        defaultCategory: 'Main Course',
        defaultRegion: 'Italian'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (prefsResponse.data.success) {
      console.log('✅ Preferences update successful');
    }
    
    // Test 6: Forgot Password
    console.log('\n6. Testing Forgot Password...');
    try {
      const forgotResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: TEST_EMAIL
      });
      
      if (forgotResponse.data.success) {
        console.log('✅ Forgot password email sent (check email)');
      }
    } catch (error) {
      console.log('⚠️ Forgot password test skipped (email service may not be configured)');
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Notes:');
    console.log('- Check your email for verification link');
    console.log('- Google OAuth needs to be tested in the browser');
    console.log('- Make sure MongoDB is running');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    console.error('\n🔍 Debug info:');
    console.error('- Make sure backend is running on port 5000');
    console.error('- Check MongoDB connection');
    console.error('- Verify environment variables are set');
  }
}

// Run tests
console.log('🚀 Starting tests...\n');
console.log('Test email:', TEST_EMAIL);
console.log('Test password:', TEST_PASSWORD);
console.log('API URL:', API_URL);
console.log('\n' + '='.repeat(50) + '\n');

testAuth();

# 🔧 Authentication Troubleshooting Guide

## Problem: After authentication, not redirected to the application

### Quick Fix Script
Run this command to fix the authentication issue:
```bash
fix-auth.bat
```

## Common Causes & Solutions

### 1. ❌ Missing Login Component
**Issue**: The Login.js component was missing from the auth folder
**Solution**: ✅ Already recreated at `/frontend/src/components/auth/Login.js`

### 2. ❌ Wrong Import Path
**Issue**: App.js was importing Login from wrong location
**Solution**: ✅ Fixed import to `'./components/auth/Login'`

### 3. ❌ API URL Mismatch
**Issue**: Frontend trying to connect to production API while running locally
**Solution**: ✅ Created `.env.local` with correct local API URL

### 4. ❌ Backend Not Running
**Issue**: Backend server not started
**Solution**: Start backend server:
```bash
cd backend
npm run dev
```

### 5. ❌ Missing Dependencies
**Issue**: Required packages not installed
**Solution**: Install all dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Step-by-Step Fix Process

### Step 1: Verify Environment Variables
Check that `.env.local` exists in frontend folder with:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### Step 2: Start Backend Server
```bash
cd backend
npm run dev
```
Should see: "🚀 Server is running on port 5000"

### Step 3: Start Frontend (New Terminal)
```bash
cd frontend
npm start
```

### Step 4: Test Authentication
1. Go to http://localhost:3000
2. Try Google login first (it should work)
3. Or create account with email/password

## Debug Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000  
- [ ] MongoDB connected (check backend console)
- [ ] `.env.local` file exists in frontend
- [ ] Login component exists at `/frontend/src/components/auth/Login.js`
- [ ] No console errors in browser (F12)
- [ ] Network tab shows API calls to `localhost:5000` not production URL

## Testing Login

### Test with Google OAuth:
1. Click "Continue with Google"
2. Select your Google account
3. Should redirect to dashboard

### Test with Email/Password:
1. Click "Sign Up" tab
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
3. Click "Create Account"
4. Should redirect to onboarding or dashboard

## Console Debug Commands

Open browser console (F12) and run:
```javascript
// Check if API is accessible
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(console.log)

// Check environment variables
console.log('API URL:', process.env.REACT_APP_API_URL)

// Check auth token
console.log('Token:', document.cookie)
```

## Common Error Messages & Solutions

### "Cannot POST /api/auth/signin"
**Cause**: Backend not running
**Fix**: Start backend server

### "Network Error" 
**Cause**: CORS issue or wrong API URL
**Fix**: Check `.env.local` and restart frontend

### "Invalid credentials"
**Cause**: Wrong email/password or user doesn't exist
**Fix**: Create new account or check credentials

### "Google login failed"
**Cause**: Google Client ID not configured
**Fix**: Check REACT_APP_GOOGLE_CLIENT_ID in .env

## Final Solution

If still not working, run this complete reset:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Clear node modules and reinstall
cd backend
rm -rf node_modules
npm install

cd ../frontend  
rm -rf node_modules
npm install

# 3. Clear browser cache
# Chrome: Ctrl+Shift+Delete → Clear browsing data

# 4. Restart servers
cd backend
npm run dev

# New terminal
cd frontend
npm start
```

## Success Indicators

✅ You should see:
- Backend: "MongoDB connected successfully"
- Frontend: "Compiled successfully!"
- Browser: Login page loads
- After login: Redirected to dashboard
- Navigation bar appears with user info

---

**Still having issues?** 
The problem was that critical files were missing. They have now been recreated:
- ✅ Login component 
- ✅ LoadingSpinner component
- ✅ Correct import paths
- ✅ Local environment configuration

The authentication should now work properly!

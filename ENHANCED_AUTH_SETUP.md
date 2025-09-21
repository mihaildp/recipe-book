# Enhanced Authentication System - Setup Guide

## 🚀 Quick Setup

### Prerequisites
- Node.js and npm installed
- MongoDB running locally or MongoDB Atlas account
- Gmail account with 2FA enabled (for email sending)
- Google Cloud Console account (for OAuth)

## Step 1: Install Dependencies

Run the setup script:
```bash
./setup-auth.bat
```

Or manually install:

### Backend
```bash
cd backend
npm install bcryptjs nodemailer cloudinary multer express-rate-limit
```

### Frontend
```bash
cd frontend
npm install js-cookie @react-oauth/google
```

## Step 2: Configure Environment Variables

### Backend Configuration
1. Copy `backend/.env.example` to `backend/.env`
2. Update with your values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/recipe-book

# JWT (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth (from Google Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# Gmail for emails
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### Frontend Configuration
1. Copy `frontend/.env.example` to `frontend/.env`
2. Update with your values:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Step 3: Set Up Gmail App Password

1. Go to https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification (enable if needed)
3. Click on "App passwords"
4. Select "Mail" and your device
5. Copy the 16-character password
6. Add to `EMAIL_APP_PASSWORD` in backend `.env`

## Step 4: Set Up Google OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Create credentials → OAuth 2.0 Client ID
5. Add authorized origins:
   - http://localhost:3000 (development)
   - Your production URL
6. Add the Client ID to both `.env` files

## Step 5: Run Database Migration

Update existing users to new schema:

```bash
cd backend
node src/scripts/migrateUsers.js
```

## Step 6: Start the Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## Step 7: Test the Features

### Test Email Registration:
1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Fill in the form
4. Check email for verification
5. Complete onboarding

### Test Google OAuth:
1. Click "Continue with Google"
2. Should work as before

### Test Password Reset:
1. Click "Forgot Password"
2. Enter email
3. Check email for reset link

## 🎉 Features Now Available

- ✅ Email/Password authentication
- ✅ Google OAuth (existing)
- ✅ Email verification
- ✅ Password reset
- ✅ 4-step onboarding
- ✅ Enhanced user profiles
- ✅ Recipe collections
- ✅ Social features (follow/unfollow)
- ✅ User statistics
- ✅ Dietary preferences
- ✅ Cooking level tracking

## 📝 Important Files Created/Modified

### Backend:
- `/src/utils/sendEmail.js` - Email service
- `/src/utils/cloudinary.js` - Image uploads
- `/src/scripts/migrateUsers.js` - Database migration
- `.env.example` - Environment variables template

### Frontend:
- `/src/services/authService.js` - Auth API calls
- `/src/services/userService.js` - User API calls
- `.env.example` - Environment variables template

## ⚠️ Troubleshooting

### Emails not sending:
- Check Gmail 2FA is enabled
- Verify app password is correct
- Check EMAIL_USER matches your Gmail

### Google OAuth not working:
- Verify Client ID in both .env files
- Check authorized origins in Google Console
- Clear browser cookies

### MongoDB connection issues:
- Ensure MongoDB is running
- Check MONGODB_URI is correct
- Run migration script

### CORS errors:
- Verify CLIENT_URL matches frontend URL
- Check both servers are running
- Clear browser cache

## 📧 Test Accounts

For testing, you can create accounts with these features:
- Regular user: test@example.com / Test123!
- Google OAuth: Use your Google account
- Different cooking levels: beginner, intermediate, advanced

## 🔒 Security Notes

Before production:
1. Change JWT_SECRET to a strong random string
2. Use SendGrid or AWS SES instead of Gmail
3. Enable HTTPS with SSL certificate
4. Add rate limiting to auth endpoints
5. Set secure cookie options
6. Implement CSRF protection

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check backend terminal for server errors
3. Verify all environment variables
4. Ensure MongoDB is running
5. Try restarting both servers

The enhanced authentication system is now ready to use! 🚀

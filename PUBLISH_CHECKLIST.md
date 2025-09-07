# ✅ PUBLISH CHECKLIST - Recipe Book App

## Before Publishing

### 1️⃣ MongoDB Atlas Setup
- [ ] Created free MongoDB Atlas account
- [ ] Created free cluster
- [ ] Added database user with password
- [ ] Whitelisted IP addresses (0.0.0.0/0 for any IP)
- [ ] Copied connection string
- [ ] Connection string saved: ________________________

### 2️⃣ Google OAuth Setup  
- [ ] Created project in Google Cloud Console
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Client ID
- [ ] Client ID saved: ________________________
- [ ] Will add production URLs after deployment

### 3️⃣ Code Preparation
- [ ] Run `prepare-production.bat`
- [ ] Frontend builds successfully
- [ ] Updated backend/.env.production with:
  - [ ] MongoDB URI
  - [ ] JWT Secret (random string)
  - [ ] Google Client ID
  - [ ] Production CLIENT_URL
- [ ] Updated frontend/.env.production with:
  - [ ] Google Client ID
  - [ ] Production API_URL

### 4️⃣ GitHub Setup
- [ ] Created GitHub account
- [ ] Created new repository named "recipe-book"
- [ ] Pushed code to GitHub

## Publishing Steps

### Option A: Render (Recommended - FREE)

#### Backend Deployment
- [ ] Logged into render.com
- [ ] Created new Web Service
- [ ] Connected GitHub repo
- [ ] Set root directory to "backend"
- [ ] Added environment variables:
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET  
  - [ ] GOOGLE_CLIENT_ID
  - [ ] CLIENT_URL
  - [ ] NODE_ENV = production
- [ ] Deployed successfully
- [ ] Backend URL: ________________________

#### Frontend Deployment  
- [ ] Created new Static Site
- [ ] Connected same GitHub repo
- [ ] Set root directory to "frontend"
- [ ] Set build command: `npm install && npm run build`
- [ ] Set publish directory: `build`
- [ ] Added environment variables:
  - [ ] REACT_APP_GOOGLE_CLIENT_ID
  - [ ] REACT_APP_API_URL (backend URL + /api)
- [ ] Deployed successfully
- [ ] Frontend URL: ________________________

### Option B: Vercel + Railway

#### Backend (Railway)
- [ ] Logged into railway.app
- [ ] Created new project from GitHub
- [ ] Added environment variables
- [ ] Deployed successfully
- [ ] Backend URL: ________________________

#### Frontend (Vercel)
- [ ] Logged into vercel.com
- [ ] Imported GitHub repository
- [ ] Added environment variables
- [ ] Deployed successfully
- [ ] Frontend URL: ________________________

## After Publishing

### Final Configuration
- [ ] Updated Google OAuth with production URLs:
  - [ ] Added frontend URL to Authorized JavaScript origins
  - [ ] Added frontend URL to Authorized redirect URIs
- [ ] Tested Google login
- [ ] Created test recipe
- [ ] Tested image upload
- [ ] Tested sharing features

### Testing Checklist
- [ ] ✅ Can login with Google
- [ ] ✅ Can create new recipe
- [ ] ✅ Can upload images
- [ ] ✅ Can edit recipe
- [ ] ✅ Can delete recipe
- [ ] ✅ Can share recipe (public/private)
- [ ] ✅ Can view shared recipes
- [ ] ✅ Can discover public recipes
- [ ] ✅ Can add comments
- [ ] ✅ Mobile responsive works

### Production URLs
- **Live App**: ________________________
- **API Endpoint**: ________________________
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Google Console**: https://console.cloud.google.com
- **Deployment Dashboard**: ________________________

## Monitoring

### Week 1 Tasks
- [ ] Check error logs daily
- [ ] Monitor database usage
- [ ] Test all features
- [ ] Get feedback from 5 users
- [ ] Fix any reported bugs

### Optional Enhancements
- [ ] Set up custom domain
- [ ] Add Google Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure email notifications
- [ ] Set up image CDN (Cloudinary)

## Troubleshooting Contacts

### If you need help:
1. **Render Support**: https://render.com/docs
2. **MongoDB Forums**: https://www.mongodb.com/community/forums
3. **Stack Overflow**: Tag with `node.js`, `react`, `mongodb`
4. **GitHub Issues**: Create issue in your repo

## Success Metrics

### First Month Goals
- [ ] 10+ registered users
- [ ] 50+ recipes created
- [ ] 5+ shared recipes
- [ ] Zero critical bugs
- [ ] <3 second load time

## Notes Section

_Write any important notes, URLs, or reminders here:_

________________________________________________
________________________________________________
________________________________________________
________________________________________________

---

**Congratulations! Your Recipe Book is LIVE! 🎉**

Share your app: `https://your-app-url.com`

Last Updated: _______________
Published By: _______________

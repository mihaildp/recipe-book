# 🍳 Recipe Book - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 14+ installed
- MongoDB (local or Atlas account)
- Google Cloud account (for OAuth)

### Step 1: Clone & Setup
```bash
# Clone the repository (or use the files in this folder)
cd "C:\Users\mihai\OneDrive\Desktop\Work Projects\Recipe"

# Run the setup script
setup.bat
```

### Step 2: Configure Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:3000`
6. Copy the Client ID

### Step 3: Configure Environment Variables

**Backend (.env)**
```
MONGODB_URI=mongodb://localhost:27017/recipe-book
JWT_SECRET=your-secret-key-here-make-it-long-and-random
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
CLIENT_URL=http://localhost:3000
PORT=5000
```

**Frontend (.env)**
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Start the Application

**Option 1: Using the monorepo package.json (Recommended)**
```bash
# Install concurrently
npm install

# Run both frontend and backend
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 5: Access the Application
Open your browser and navigate to: `http://localhost:3000`

## 📱 Features Available
- ✅ Google OAuth login
- ✅ Create recipes manually
- ✅ Import from URL (simulated)
- ✅ Import from photos (simulated)
- ✅ Multiple photo support
- ✅ Categories & regions
- ✅ 5-star rating system
- ✅ Search & filter
- ✅ Edit/Delete recipes
- ✅ Responsive design

## 🐳 Docker Deployment (Alternative)
```bash
# Make sure Docker is installed
docker-compose up -d

# Access at http://localhost
```

## 📚 Documentation
- [Full README](README.md) - Complete project documentation
- [Deployment Guide](DEPLOYMENT.md) - Production deployment options

## 🆘 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running locally
- Or use MongoDB Atlas (free tier): 
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-book
  ```

### Google OAuth Not Working
- Check that Client ID is correctly set in both frontend and backend
- Verify authorized origins include `http://localhost:3000`

### Port Already in Use
- Backend default: 5000
- Frontend default: 3000
- Change in .env files if needed

## 📧 Support
For issues, check the logs:
- Backend logs: Check terminal running backend
- Frontend logs: Check browser console (F12)
- MongoDB logs: Check MongoDB log file

## 🎉 You're Ready!
Sign in with your Google account and start adding your favorite recipes!

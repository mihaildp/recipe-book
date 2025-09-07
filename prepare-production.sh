#!/bin/bash

# Recipe Book - Production Deployment Script
# This script prepares your app for production deployment

echo "🚀 Recipe Book - Production Deployment Preparation"
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed"
    exit 1
fi

if ! command_exists git; then
    echo "❌ Git is not installed"
    exit 1
fi

echo "✅ All prerequisites installed"
echo ""

# Build frontend for production
echo "🔨 Building frontend for production..."
cd frontend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

# Create production environment files
echo "📝 Creating production environment templates..."

# Backend production env
cat > backend/.env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production

# MongoDB Atlas (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-book?retryWrites=true&w=majority

# Security (Required - Generate strong secrets)
JWT_SECRET=generate-a-very-long-random-string-here-min-32-chars

# Google OAuth (Required)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Server Configuration
PORT=5000
CLIENT_URL=https://your-domain.com

# Optional: Cloudinary for Image Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com

# Optional: Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
EOF

# Frontend production env
cat > frontend/.env.production << 'EOF'
# Production Environment Variables
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=https://api.your-domain.com/api
REACT_APP_ENV=production
EOF

echo "✅ Production environment templates created"
echo ""

# Initialize git repository if not exists
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Recipe Book App"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "🎉 Production preparation complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env.production with your production values"
echo "2. Edit frontend/.env.production with your production values"
echo "3. Choose a deployment platform (see DEPLOYMENT_GUIDE.md)"
echo "4. Follow the platform-specific deployment instructions"

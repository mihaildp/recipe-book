# 🚀 Recipe Book - Complete Deployment Guide

This guide will help you deploy your Recipe Book app to production using various platforms.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Deployment (Easiest)](#quick-deployment-easiest)
3. [Professional Deployment Options](#professional-deployment-options)
4. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

### 1. MongoDB Atlas Setup (Free Tier Available)
```bash
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (choose free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace <password> with your database password
7. Add your IP address to Network Access (or allow all: 0.0.0.0/0)
```

### 2. Google OAuth Production Setup
```bash
1. Go to https://console.cloud.google.com/
2. Select your project
3. APIs & Services → Credentials
4. Edit your OAuth 2.0 Client ID
5. Add production URLs:
   - Authorized JavaScript origins:
     • https://your-domain.com
     • https://www.your-domain.com
   - Authorized redirect URIs:
     • https://your-domain.com
     • https://www.your-domain.com
```

### 3. Get a Domain Name (Optional but Recommended)
- **Namecheap**: https://www.namecheap.com (~$8/year)
- **Google Domains**: https://domains.google (~$12/year)
- **Cloudflare**: https://www.cloudflare.com/products/registrar/

---

## 🎯 Quick Deployment (Easiest)

### Option 1: Deploy to Render (Recommended - Free Tier)

#### Step 1: Prepare Your Code
```bash
# Create a new GitHub repository
1. Go to https://github.com/new
2. Name it "recipe-book"
3. Make it public or private
4. Don't initialize with README

# Push your code
cd "C:\Users\mihai\OneDrive\Desktop\Work Projects\Recipe"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/recipe-book.git
git push -u origin main
```

#### Step 2: Deploy Backend on Render
```bash
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: recipe-book-api
   - Environment: Node
   - Build Command: cd backend && npm install
   - Start Command: cd backend && npm start
   - Add Environment Variables:
     • MONGODB_URI = your_mongodb_atlas_uri
     • JWT_SECRET = your_secret_key
     • GOOGLE_CLIENT_ID = your_google_client_id
     • CLIENT_URL = https://recipe-book-frontend.onrender.com
6. Click "Create Web Service"
```

#### Step 3: Deploy Frontend on Render
```bash
1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:
   - Name: recipe-book-frontend
   - Build Command: cd frontend && npm install && npm run build
   - Publish Directory: frontend/build
   - Add Environment Variables:
     • REACT_APP_GOOGLE_CLIENT_ID = your_google_client_id
     • REACT_APP_API_URL = https://recipe-book-api.onrender.com/api
4. Click "Create Static Site"
```

#### Step 4: Update Google OAuth
```bash
Add Render URLs to Google OAuth:
- https://recipe-book-frontend.onrender.com
```

### Option 2: Deploy to Vercel + Railway

#### Backend on Railway
```bash
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Railway will auto-detect Node.js and deploy
7. Get your production URL
```

#### Frontend on Vercel
```bash
1. Install Vercel CLI
npm i -g vercel

2. Deploy frontend
cd frontend
vercel

3. Follow prompts:
   - Link to existing project? No
   - What's your project name? recipe-book
   - In which directory? ./
   - Override settings? No

4. Set environment variables in Vercel dashboard
```

---

## 🏢 Professional Deployment Options

### Option A: AWS Deployment (Scalable)

#### 1. Backend on AWS Elastic Beanstalk
```bash
# Install AWS CLI and EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
cd backend
eb init -p node.js-14 recipe-book-api
eb create production
eb setenv MONGODB_URI=your_uri JWT_SECRET=your_secret
eb open
```

#### 2. Frontend on AWS S3 + CloudFront
```bash
# Build frontend
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://recipe-book-frontend

# Upload files
aws s3 sync build/ s3://recipe-book-frontend --acl public-read

# Enable static website hosting
aws s3 website s3://recipe-book-frontend --index-document index.html

# Create CloudFront distribution for HTTPS
```

### Option B: DigitalOcean App Platform

```bash
1. Connect GitHub repository
2. Create new app
3. Add components:
   - Backend: Web Service
   - Frontend: Static Site
   - Database: MongoDB (or use Atlas)
4. Configure environment variables
5. Deploy
```

### Option C: Google Cloud Platform

#### Backend on Cloud Run
```bash
# Build container
cd backend
gcloud builds submit --tag gcr.io/PROJECT_ID/recipe-book-api

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT_ID/recipe-book-api --platform managed
```

#### Frontend on Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize and deploy
cd frontend
firebase init hosting
npm run build
firebase deploy
```

---

## 🐳 Docker Deployment (VPS)

### For VPS (DigitalOcean, Linode, AWS EC2)

#### 1. Create docker-compose.prod.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - CLIENT_URL=${CLIENT_URL}
    ports:
      - "5000:5000"
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
```

#### 2. Deploy to VPS
```bash
# SSH into your VPS
ssh root@your-server-ip

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose

# Clone your repository
git clone https://github.com/YOUR_USERNAME/recipe-book.git
cd recipe-book

# Create .env file
nano .env

# Run Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔒 SSL Certificate Setup

### Using Let's Encrypt (Free SSL)
```bash
# For Nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Using Cloudflare (Free SSL + CDN)
```bash
1. Add your domain to Cloudflare
2. Update nameservers at your registrar
3. Enable "Full SSL/TLS encryption"
4. Enable "Always Use HTTPS"
```

---

## 📝 Environment Variables Setup

### Backend Production Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/recipe-book
JWT_SECRET=generate-very-long-random-string-here
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
CLIENT_URL=https://your-frontend-domain.com
PORT=5000

# Optional but recommended
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Frontend Production Variables
```env
REACT_APP_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENV=production
```

---

## ✅ Post-Deployment Checklist

### 1. Test Core Features
- [ ] Google OAuth login works
- [ ] Create a new recipe
- [ ] Upload images
- [ ] Share recipe (public/private)
- [ ] Search and filter recipes
- [ ] Mobile responsive design

### 2. Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] MongoDB connection secured

### 3. Performance
- [ ] Images loading quickly
- [ ] Page load time < 3 seconds
- [ ] Database queries optimized
- [ ] Caching implemented

### 4. Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up Google Analytics
- [ ] Configure backup strategy

### 5. SEO & Marketing
- [ ] Add meta tags
- [ ] Submit sitemap to Google
- [ ] Configure Open Graph tags
- [ ] Set up Google Search Console

---

## 🆘 Troubleshooting

### Common Issues and Solutions

#### 1. Google OAuth Not Working
```bash
Error: "redirect_uri_mismatch"
Solution: Add exact production URL to Google Console
```

#### 2. MongoDB Connection Failed
```bash
Error: "MongoNetworkError"
Solution: 
- Whitelist your server IP in MongoDB Atlas
- Check connection string format
- Ensure password is URL encoded
```

#### 3. CORS Errors
```bash
Error: "Access-Control-Allow-Origin"
Solution:
- Update CLIENT_URL in backend .env
- Ensure frontend URL matches exactly
```

#### 4. Images Not Uploading
```bash
Solution:
- Implement Cloudinary for production
- Increase upload size limit
- Check file permissions
```

---

## 💰 Cost Estimates

### Free Tier Options
- **Render**: Free (with spin-down)
- **Vercel**: Free for frontend
- **Railway**: $5 credit/month
- **MongoDB Atlas**: 512MB free
- **Cloudinary**: 25GB bandwidth free

### Professional Setup (~$20-50/month)
- **VPS**: $5-20/month (DigitalOcean/Linode)
- **Domain**: $12/year
- **MongoDB Atlas**: $0-25/month
- **CDN/Images**: $0-10/month

---

## 📞 Support Resources

- **MongoDB Atlas Support**: https://www.mongodb.com/community/forums
- **Google Cloud Support**: https://cloud.google.com/support
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Stack Overflow**: Tag with `node.js`, `react`, `mongodb`

---

## 🎉 Congratulations!

Your Recipe Book app is now live! Share your deployment URL with friends and family to start sharing recipes.

**Next Steps:**
1. Share your app URL
2. Get user feedback
3. Add more features
4. Consider monetization options

---

*Built with ❤️ for the cooking community*

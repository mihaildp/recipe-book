# Recipe Book - Deployment Guide

This guide covers various deployment options for the Recipe Book application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment Options](#cloud-deployment-options)
5. [Production Checklist](#production-checklist)

## Prerequisites

### Required Services
1. **MongoDB Database** - Choose one:
   - MongoDB Atlas (Free tier available)
   - Self-hosted MongoDB
   - Docker MongoDB container

2. **Google OAuth Credentials**
   - Create at [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google+ API
   - Create OAuth 2.0 Client ID

3. **Image Storage** (Optional but recommended):
   - Cloudinary (Free tier available)
   - AWS S3
   - Google Cloud Storage

## Local Development

### Quick Start
```bash
# Windows
setup.bat

# Mac/Linux
chmod +x setup.sh
./setup.sh
```

### Manual Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

## Docker Deployment

### 1. Using Docker Compose (Recommended)

```bash
# Copy and configure environment variables
cp .env.production .env
# Edit .env with your production values

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Building Individual Containers

```bash
# Build backend
cd backend
docker build -t recipe-backend .
docker run -p 5000:5000 --env-file ../.env recipe-backend

# Build frontend
cd frontend
docker build -t recipe-frontend .
docker run -p 80:80 recipe-frontend
```

## Cloud Deployment Options

### Option 1: Heroku (Simple & Free Tier Available)

#### Backend Deployment
```bash
# Install Heroku CLI
# Create new Heroku app
heroku create recipe-book-api

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set GOOGLE_CLIENT_ID="your_google_client_id"
heroku config:set CLIENT_URL="https://your-frontend-url.com"

# Deploy
cd backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a recipe-book-api
git push heroku main
```

#### Frontend Deployment (Heroku)
```bash
# Create static buildpack
cd frontend
npm run build

# Create new Heroku app
heroku create recipe-book-frontend

# Use static buildpack
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static

# Create static.json
echo '{"root": "build/", "routes": {"/**": "index.html"}}' > static.json

# Deploy
git add .
git commit -m "Frontend build"
git push heroku main
```

### Option 2: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend on Vercel
1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Configure environment variables:
   - `REACT_APP_GOOGLE_CLIENT_ID`
   - `REACT_APP_API_URL`
4. Deploy

#### Backend on Railway
1. Push code to GitHub
2. Create new project on [Railway](https://railway.app)
3. Add MongoDB database
4. Configure environment variables
5. Deploy from GitHub

### Option 3: AWS Deployment

#### Using AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
cd backend
eb init -p node.js recipe-book-api

# Create environment
eb create production

# Set environment variables
eb setenv MONGODB_URI=your_uri JWT_SECRET=your_secret

# Deploy
eb deploy
```

#### Frontend on S3 + CloudFront
```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name your-bucket.s3.amazonaws.com
```

### Option 4: DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings:
   - Backend: Node.js
   - Frontend: Static Site
3. Set environment variables
4. Deploy

### Option 5: Google Cloud Platform

#### Using App Engine
```yaml
# app.yaml for backend
runtime: nodejs18
env: standard

env_variables:
  MONGODB_URI: "your_mongodb_uri"
  JWT_SECRET: "your_jwt_secret"
  GOOGLE_CLIENT_ID: "your_google_client_id"
```

```bash
# Deploy
gcloud app deploy
```

#### Frontend on Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

## Production Checklist

### Security
- [ ] Use HTTPS everywhere
- [ ] Strong JWT secret (min 32 characters)
- [ ] Environment variables properly configured
- [ ] CORS settings restricted to your domain
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] MongoDB connection uses authentication
- [ ] Secure headers (Helmet.js) configured

### Performance
- [ ] Database indexes created
- [ ] Image optimization/CDN configured
- [ ] Gzip compression enabled
- [ ] Browser caching configured
- [ ] Lazy loading for images
- [ ] Code splitting in React

### Monitoring
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Database backup strategy

### Environment Variables

#### Backend (.env)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-book
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
CLIENT_URL=https://your-frontend-domain.com
PORT=5000

# Optional
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env)
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=https://your-api-domain.com/api
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Update nginx.conf for HTTPS
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # ... rest of configuration
}
```

## Database Backup Strategy

### MongoDB Atlas
- Automated backups included
- Point-in-time recovery available

### Self-hosted MongoDB
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://username:password@localhost:27017/recipe-book" --out=/backups/$DATE

# Cron job for daily backups
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CLIENT_URL in backend matches frontend URL
   - Check CORS middleware configuration

2. **Google OAuth Not Working**
   - Verify authorized JavaScript origins
   - Check redirect URIs in Google Console

3. **Images Not Uploading**
   - Check file size limits in multer
   - Verify Cloudinary credentials

4. **MongoDB Connection Issues**
   - Check network access in MongoDB Atlas
   - Verify connection string format

5. **Environment Variables Not Loading**
   - Ensure .env file is in root directory
   - Check for typos in variable names

## Support

For deployment issues:
1. Check logs: `docker-compose logs` or `heroku logs --tail`
2. Verify all environment variables are set
3. Test API endpoints with Postman
4. Check browser console for frontend errors

## Scaling Considerations

As your application grows:

1. **Database**: Consider MongoDB replica sets
2. **Backend**: Implement load balancing
3. **Frontend**: Use CDN for static assets
4. **Images**: Implement image optimization pipeline
5. **Caching**: Add Redis for session/data caching
6. **Search**: Implement Elasticsearch for recipe search

## Cost Optimization

### Free Tier Options
- MongoDB Atlas: 512MB storage
- Heroku: 550 dyno hours/month
- Vercel: Unlimited deployments
- Cloudinary: 25GB bandwidth/month
- Firebase: 10GB hosting storage

### Estimated Monthly Costs (Small-Medium Scale)
- MongoDB Atlas (M10): $60-100
- Hosting (VPS): $20-50
- CDN/Images: $10-30
- Domain + SSL: $15-20
- **Total**: ~$105-200/month

## Conclusion

Choose the deployment option that best fits your needs:
- **Development/Testing**: Docker Compose locally
- **Small Projects**: Heroku or Vercel + Railway
- **Production**: AWS/GCP/Azure with proper scaling
- **Budget-Friendly**: Mix of free tiers from different providers

Remember to always test your deployment in a staging environment before going to production!

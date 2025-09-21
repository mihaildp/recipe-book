# Update Environment Files Script
# Run this after updating with your actual values

Write-Host "Updating Recipe Book Environment Files..." -ForegroundColor Green

# Get user input
$frontendUrl = Read-Host "Enter your frontend Render URL (e.g., https://recipe-book-frontend.onrender.com)"
$backendUrl = Read-Host "Enter your backend Render URL (e.g., https://recipe-book-backend.onrender.com)"
$googleClientId = Read-Host "Enter your Google Client ID (format: XXXXX-XXXXX.apps.googleusercontent.com)"
$mongoPassword = Read-Host "Enter your MongoDB password" -AsSecureString
$mongoPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mongoPassword))

# Update backend .env
$backendEnvPath = "backend\.env"
$backendContent = @"
# Backend Environment Variables for Production
NODE_ENV=production

# MongoDB Connection String
MONGODB_URI=mongodb+srv://recipiebook:${mongoPasswordPlain}@cluster0.gyorrov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret (Generated secure key)
JWT_SECRET=tLf+ZcfjLFq7Jyv+clCyzUKFb9rSxhAOcjhI5I7jCr6xoMAsGhgpGrE0Y4am0xb+

# Google OAuth
GOOGLE_CLIENT_ID=$googleClientId

# Server Configuration
PORT=5000

# Frontend URL (for CORS)
CLIENT_URL=$frontendUrl

# Optional: Cloudinary for Image Storage (add later if needed)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
"@

$backendContent | Out-File -FilePath $backendEnvPath -Encoding utf8

# Update frontend .env
$frontendEnvPath = "frontend\.env"
$frontendContent = @"
# Frontend Environment Variables for Production
REACT_APP_GOOGLE_CLIENT_ID=$googleClientId

# API URL
REACT_APP_API_URL=$backendUrl/api

# Environment
REACT_APP_ENV=production
"@

$frontendContent | Out-File -FilePath $frontendEnvPath -Encoding utf8

Write-Host "Environment files updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit and push these changes to your repository"
Write-Host "2. Redeploy both frontend and backend on Render"
Write-Host "3. Make sure Google OAuth has these URLs in authorized origins:"
Write-Host "   - $frontendUrl"
Write-Host "   - http://localhost:3000 (for development)"

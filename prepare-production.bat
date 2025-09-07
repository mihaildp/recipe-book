@echo off
echo ========================================
echo Recipe Book - Production Deployment Prep
echo ========================================
echo.

REM Check prerequisites
echo Checking prerequisites...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo All prerequisites installed!
echo.

REM Build frontend for production
echo Building frontend for production...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)
echo Frontend build successful!
cd ..
echo.

REM Create production environment files
echo Creating production environment templates...

REM Backend production env
(
echo # Production Environment Variables
echo NODE_ENV=production
echo.
echo # MongoDB Atlas ^(Required^)
echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-book?retryWrites=true^&w=majority
echo.
echo # Security ^(Required - Generate strong secrets^)
echo JWT_SECRET=generate-a-very-long-random-string-here-min-32-chars
echo.
echo # Google OAuth ^(Required^)
echo GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
echo.
echo # Server Configuration
echo PORT=5000
echo CLIENT_URL=https://your-domain.com
echo.
echo # Optional: Cloudinary for Image Storage
echo CLOUDINARY_CLOUD_NAME=your-cloud-name
echo CLOUDINARY_API_KEY=your-api-key
echo CLOUDINARY_API_SECRET=your-api-secret
) > backend\.env.production

REM Frontend production env
(
echo # Production Environment Variables
echo REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
echo REACT_APP_API_URL=https://api.your-domain.com/api
echo REACT_APP_ENV=production
) > frontend\.env.production

echo Production environment templates created!
echo.

REM Initialize git repository if not exists
if not exist .git (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - Recipe Book App"
    echo Git repository initialized!
) else (
    echo Git repository already exists
)

echo.
echo ========================================
echo Production preparation complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend\.env.production with your production values
echo 2. Edit frontend\.env.production with your production values
echo 3. Create a GitHub repository
echo 4. Push your code to GitHub
echo 5. Choose a deployment platform from DEPLOYMENT_GUIDE.md
echo.
pause

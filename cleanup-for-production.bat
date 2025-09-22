@echo off
cls
echo ========================================================
echo    Recipe App - Production Cleanup Script
echo    Preparing for MongoDB Atlas + Render Deployment
echo ========================================================
echo.
echo This script will remove all development files and 
echo prepare your app for production deployment.
echo.
echo Files to be REMOVED:
echo - Development documentation (.md files except README)
echo - Setup and fix scripts (.bat and .sh files)
echo - Test and debug files
echo.
echo Files to be KEPT:
echo - Source code (backend, frontend)
echo - Configuration files (.env, render.yaml)
echo - Package files (package.json)
echo - Version control (.git, .gitignore)
echo - README.md and LICENSE
echo.
echo ========================================================
echo.
echo Press CTRL+C to cancel, or
pause

echo.
echo Starting cleanup...
echo.

REM Remove development documentation
echo [1/5] Removing development documentation...
del /q "AUTHENTICATION_FIXED.md" 2>nul
del /q "AUTH_TROUBLESHOOTING.md" 2>nul
del /q "CLEANUP_SUMMARY.md" 2>nul
del /q "DEPLOYMENT.md" 2>nul
del /q "DEPLOYMENT_GUIDE.md" 2>nul
del /q "ENHANCED_AUTH_SETUP.md" 2>nul
del /q "FINAL_STEPS.md" 2>nul
del /q "IMPLEMENTATION_COMPLETE.md" 2>nul
del /q "PROJECT_REVIEW.md" 2>nul
del /q "QUICKSTART.md" 2>nul
del /q "SHARING_FEATURES.md" 2>nul
del /q "SOLUTION_AUTH_FIXED.md" 2>nul
echo [OK] Documentation files removed

REM Remove all batch scripts except this one
echo [2/5] Removing development scripts...
del /q "cleanup-project.bat" 2>nul
del /q "cleanup.bat" 2>nul
del /q "complete-cleanup-and-push.bat" 2>nul
del /q "fix-auth-complete.bat" 2>nul
del /q "fix-auth.bat" 2>nul
del /q "prepare-production.bat" 2>nul
del /q "push-to-github.bat" 2>nul
del /q "setup-auth.bat" 2>nul
del /q "setup.bat" 2>nul
del /q "start-app.bat" 2>nul
del /q "switch-env.bat" 2>nul
echo [OK] Batch scripts removed

REM Remove shell scripts (Linux/Mac)
echo [3/5] Removing shell scripts...
del /q "complete-cleanup-and-push.sh" 2>nul
del /q "prepare-production.sh" 2>nul
del /q "setup.sh" 2>nul
echo [OK] Shell scripts removed

REM Remove misc files
echo [4/5] Removing miscellaneous files...
del /q "Clear" 2>nul
echo [OK] Misc files removed

REM Clean up backend
echo [5/5] Cleaning up backend...
if exist "backend\.env.example" del /q "backend\.env.example" 2>nul
if exist "backend\.env.local" del /q "backend\.env.local" 2>nul
if exist "backend\Dockerfile" (
    echo [INFO] Keeping Dockerfile for potential container deployment
)
echo [OK] Backend cleaned

REM Clean up frontend
echo [6/6] Cleaning up frontend...
if exist "frontend\.env.local" (
    echo [INFO] Keeping .env.local for local testing
)
if exist "frontend\.env" (
    echo [INFO] Keeping .env for production variables
)
echo [OK] Frontend cleaned

echo.
echo ========================================================
echo    CLEANUP COMPLETE!
echo ========================================================
echo.
echo Remaining files for production:
echo - /backend (API source code)
echo - /frontend (React app)
echo - render.yaml (Render deployment config)
echo - README.md (Documentation)
echo - LICENSE (License file)
echo - .gitignore (Git ignore rules)
echo - package.json (Root package file)
echo.
echo ========================================================
echo    DEPLOYMENT CHECKLIST FOR RENDER
echo ========================================================
echo.
echo Backend (render.yaml configured):
echo [✓] MongoDB Atlas connection string in Render env vars
echo [✓] JWT_SECRET in Render env vars
echo [✓] GOOGLE_CLIENT_ID in Render env vars
echo [✓] Build command: cd backend && npm install
echo [✓] Start command: cd backend && npm start
echo.
echo Frontend (render.yaml configured):
echo [✓] REACT_APP_API_URL pointing to backend URL
echo [✓] REACT_APP_GOOGLE_CLIENT_ID in env vars
echo [✓] Build command: cd frontend && npm install && npm run build
echo [✓] Publish directory: frontend/build
echo.
echo ========================================================
echo    NEXT STEPS
echo ========================================================
echo.
echo 1. Commit and push to GitHub:
echo    git add .
echo    git commit -m "Clean up project for production deployment"
echo    git push origin main
echo.
echo 2. Deploy on Render:
echo    - Go to https://dashboard.render.com
echo    - Create New ^> Blueprint
echo    - Connect your GitHub repository
echo    - Render will use render.yaml automatically
echo.
echo 3. Set Environment Variables in Render:
echo    Backend Service:
echo    - MONGODB_URI (your MongoDB Atlas connection)
echo    - JWT_SECRET (generate a secure key)
echo    - GOOGLE_CLIENT_ID
echo    - CLIENT_URL (your frontend URL on Render)
echo.
echo    Frontend Service:
echo    - REACT_APP_API_URL (your backend URL on Render)
echo    - REACT_APP_GOOGLE_CLIENT_ID
echo.
echo ========================================================
echo.
echo This cleanup script will now self-destruct...
echo.
pause
del "%~f0"
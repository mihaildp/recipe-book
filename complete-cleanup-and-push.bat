@echo off
cls
echo ============================================
echo    Recipe Book - Complete Cleanup and Push
echo ============================================
echo.
echo Repository: https://github.com/mihaildp/recipe-book.git
echo.

REM Step 1: Remove old and unnecessary files
echo [1/5] Cleaning up old files...
echo ----------------------------------------

REM Remove old frontend files
if exist "frontend\src\components\Login_old.js" (
    del /q "frontend\src\components\Login_old.js"
    echo - Removed old Login component
)

REM Remove old backend files
if exist "backend\.env.example.fixed" (
    del /q "backend\.env.example.fixed"
    echo - Removed duplicate env example
)
if exist "backend\test-auth.js" (
    del /q "backend\test-auth.js"
    echo - Removed test file
)

REM Remove redundant documentation
if exist "AUTH_UPDATE_STATUS.md" del /q "AUTH_UPDATE_STATUS.md"
if exist "AUTH_IMPLEMENTATION_COMPLETE.md" del /q "AUTH_IMPLEMENTATION_COMPLETE.md"
if exist "PASSWORD_UPDATE_CHECKLIST.md" del /q "PASSWORD_UPDATE_CHECKLIST.md"
if exist "PUBLISH_CHECKLIST.md" del /q "PUBLISH_CHECKLIST.md"
if exist "QUICK_PUBLISH.md" del /q "QUICK_PUBLISH.md"
if exist "RENDER_DEPLOYMENT_MIHAILDP.md" del /q "RENDER_DEPLOYMENT_MIHAILDP.md"
if exist "UPDATE_PASSWORD_INSTRUCTIONS.bat" del /q "UPDATE_PASSWORD_INSTRUCTIONS.bat"
if exist "push_fix.bat" del /q "push_fix.bat"
if exist "update_env.ps1" del /q "update_env.ps1"
echo - Cleaned up redundant documentation
echo.

REM Step 2: Check git status
echo [2/5] Checking git status...
echo ----------------------------------------
git status --short
echo.

REM Step 3: Add all changes
echo [3/5] Adding all changes to git...
echo ----------------------------------------
git add -A
echo - All files added to staging
echo.

REM Step 4: Create commit
echo [4/5] Creating commit...
echo ----------------------------------------
git commit -m "feat: Complete enhanced authentication system with cleanup

🚀 Major Features Added:
- Dual authentication (Email/Password + Google OAuth)
- Email verification and password reset flow
- 4-step onboarding wizard for new users
- Enhanced user profiles with cooking preferences
- Recipe collections and organization
- Follow/unfollow social system
- User statistics dashboard
- Responsive modern UI design

🔧 Technical Improvements:
- JWT authentication with bcrypt password hashing
- Email service with Nodemailer
- Protected routes and middleware
- Comprehensive error handling
- Form validation and feedback

🧹 Cleanup:
- Removed old/redundant files
- Consolidated documentation
- Organized project structure
- Updated .gitignore

📚 Documentation:
- Complete README with setup instructions
- API endpoint documentation
- Deployment guides"

if %errorlevel% neq 0 (
    echo.
    echo No changes to commit or commit failed.
)
echo.

REM Step 5: Push to GitHub
echo [5/5] Pushing to GitHub...
echo ----------------------------------------
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo Push to main failed, trying master branch...
    git push origin master
    
    if %errorlevel% neq 0 (
        echo.
        echo Push failed. Trying to pull first...
        git pull origin main --rebase
        git push origin main
    )
)

echo.
echo ============================================
echo    ✅ Complete! Your project is now:
echo ============================================
echo.
echo 1. Cleaned of unnecessary files
echo 2. Fully documented with README
echo 3. Pushed to GitHub repository
echo.
echo Repository: https://github.com/mihaildp/recipe-book.git
echo.
echo Next steps:
echo - Configure environment variables
echo - Set up MongoDB database
echo - Deploy to production
echo.
pause

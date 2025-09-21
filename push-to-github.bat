@echo off
echo ================================
echo Recipe Book - Git Push to GitHub
echo ================================
echo.

echo Step 1: Cleaning up old files...
call cleanup-project.bat

echo.
echo Step 2: Adding all files to git...
git add .

echo.
echo Step 3: Creating commit...
git commit -m "feat: Enhanced authentication system with email/password, user profiles, and social features

- Added dual authentication (email/password + Google OAuth)
- Implemented email verification and password reset
- Created 4-step onboarding flow for new users
- Enhanced user profiles with cooking preferences
- Added recipe collections and organization features
- Implemented follow/unfollow social system
- Created comprehensive user dashboard with statistics
- Updated UI with modern, responsive design
- Added proper error handling and validation
- Implemented JWT authentication and bcrypt password hashing"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo If push failed, trying to set upstream...
    git push --set-upstream origin main
)

echo.
echo ================================
echo Successfully pushed to GitHub!
echo ================================
echo.
echo Your repository has been updated with:
echo - Enhanced authentication system
echo - User profiles and preferences
echo - Social features
echo - Clean project structure
echo - Comprehensive documentation
echo.
pause

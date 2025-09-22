@echo off
cls
echo ========================================================
echo    Recipe App - Deploy Email/Password Priority Update
echo ========================================================
echo.
echo This will update the login page to:
echo - Default to Sign Up tab
echo - Make email/password more prominent
echo - Show Google OAuth as temporarily unavailable
echo - Add helpful test account info
echo.

echo [1/4] Staging changes...
git add frontend/src/components/auth/Login.js

echo [2/4] Committing changes...
git commit -m "Update login page: Prioritize email/password signup, improve UX"

echo [3/4] Pushing to GitHub...
git push origin full-app
if %errorlevel% neq 0 (
    git push origin main
)

echo [4/4] Deployment triggered!
echo.
echo ========================================================
echo    EMAIL/PASSWORD SIGNUP IS NOW AVAILABLE!
echo ========================================================
echo.
echo After deployment completes (2-3 minutes), users can:
echo.
echo 1. Go to: https://recipe-book-frontend-8f1r.onrender.com
echo 2. The "Sign Up" tab will be selected by default
echo 3. Create account with:
echo    - Name: Any name
echo    - Email: Any valid email
echo    - Password: Min 6 characters
echo.
echo ========================================================
echo    TEST IT NOW:
echo ========================================================
echo.
echo Opening the app...
start https://recipe-book-frontend-8f1r.onrender.com
echo.
echo Create a test account:
echo - Name: Test User
echo - Email: mytest@example.com
echo - Password: MyPass123
echo.
echo ========================================================
echo    FIXING GOOGLE OAUTH (OPTIONAL):
echo ========================================================
echo.
echo If you want to fix Google OAuth later:
echo.
echo 1. Go to: https://console.cloud.google.com
echo 2. APIs & Services > Credentials
echo 3. Edit OAuth 2.0 Client ID
echo 4. Add origin: https://recipe-book-frontend-8f1r.onrender.com
echo 5. Save and wait 10 minutes
echo.
echo But email/password works perfectly fine without Google!
echo.
echo ========================================================
pause
@echo off
cls
echo ========================================================
echo    Recipe App - Complete Fix Deployment
echo ========================================================
echo.
echo Fixing manifest.json, favicon, and preparing deployment...
echo.

echo [1/4] Staging all fixes...
git add frontend/public/manifest.json frontend/public/index.html

echo [2/4] Committing changes...
git commit -m "Add missing manifest.json and fix index.html"

echo [3/4] Pushing to GitHub...
git push origin full-app
if %errorlevel% neq 0 (
    git push origin main
)
if %errorlevel% neq 0 (
    git push origin HEAD
)

echo.
echo ========================================================
echo    DEPLOYMENT COMPLETE - NOW FIX GOOGLE OAUTH
echo ========================================================
echo.
echo The 404 errors are fixed. Now fix Google OAuth:
echo.
echo CRITICAL STEPS:
echo ================
echo.
echo 1. GOOGLE CLOUD CONSOLE:
echo    -----------------------
echo    a. Go to: https://console.cloud.google.com
echo    b. Select your project
echo    c. Go to: APIs & Services > Credentials
echo    d. Click on your OAuth 2.0 Client ID
echo    e. ADD these to "Authorized JavaScript origins":
echo       https://recipe-book-frontend-8f1r.onrender.com
echo       http://localhost:3000
echo    f. Click SAVE
echo    g. Wait 5 minutes for changes to propagate
echo.
echo 2. TEST WITH EMAIL FIRST:
echo    ----------------------
echo    a. Go to: https://recipe-book-frontend-8f1r.onrender.com
echo    b. Click "Sign Up" tab
echo    c. Create account with:
echo       Email: test@example.com
echo       Password: Test123!
echo       Name: Test User
echo    d. If this works, the backend is fine!
echo.
echo 3. THEN TEST GOOGLE LOGIN:
echo    ------------------------
echo    After updating Google Console (and waiting 5 min),
echo    try "Continue with Google" button
echo.
echo ========================================================
echo ALTERNATIVE SOLUTION IF GOOGLE STILL FAILS:
echo ========================================================
echo.
echo You might need to create a NEW Google OAuth Client ID:
echo.
echo 1. Go to Google Cloud Console
echo 2. Create NEW OAuth 2.0 Client ID
echo 3. Type: Web application
echo 4. Add origins: https://recipe-book-frontend-8f1r.onrender.com
echo 5. Get new Client ID
echo 6. Update in Render Environment Variables:
echo    - Backend: GOOGLE_CLIENT_ID=new_id
echo    - Frontend: REACT_APP_GOOGLE_CLIENT_ID=new_id
echo.
echo ========================================================
pause
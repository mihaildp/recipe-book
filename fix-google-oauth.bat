@echo off
cls
echo ========================================================
echo    Recipe App - Google OAuth Fix Guide
echo ========================================================
echo.
echo The CORS issue is fixed! Now fixing Google OAuth...
echo.
echo ========================================================
echo STEP 1: UPDATE GOOGLE CLOUD CONSOLE
echo ========================================================
echo.
echo 1. Open this link in your browser:
start https://console.cloud.google.com/apis/credentials
echo.
echo 2. Find your OAuth 2.0 Client ID 
echo    (should be: 487352950609-2188rnt17bhke07htkr3egebt6lpdk5s...)
echo.
echo 3. Click on it to edit
echo.
echo 4. Add to "Authorized JavaScript origins":
echo    https://recipe-book-frontend-8f1r.onrender.com
echo    http://localhost:3000
echo.
echo 5. Add to "Authorized redirect URIs":
echo    https://recipe-book-frontend-8f1r.onrender.com
echo    http://localhost:3000
echo.
echo 6. Click "SAVE"
echo.
pause
echo.
echo ========================================================
echo STEP 2: VERIFY BACKEND ENVIRONMENT VARIABLES
echo ========================================================
echo.
echo Opening Render Dashboard...
start https://dashboard.render.com
echo.
echo 1. Click on backend service (recipe-book-api-syqv)
echo 2. Go to Environment tab
echo 3. Verify these are set:
echo.
echo    GOOGLE_CLIENT_ID=487352950609-2188rnt17bhke07htkr3egebt6lpdk5s.apps.googleusercontent.com
echo    CLIENT_URL=https://recipe-book-frontend-8f1r.onrender.com
echo    JWT_SECRET=[should have a value]
echo.
pause
echo.
echo ========================================================
echo STEP 3: TEST AUTHENTICATION
echo ========================================================
echo.
echo For debugging, let's also test email/password signup:
echo.
echo 1. Go to: https://recipe-book-frontend-8f1r.onrender.com
echo 2. Click "Sign Up" tab
echo 3. Create a test account:
echo    Email: test@example.com
echo    Password: Test123!
echo    Name: Test User
echo.
echo 4. If email/password works but Google doesn't,
echo    it's definitely a Google OAuth configuration issue.
echo.
echo ========================================================
echo DEBUGGING INFO:
echo ========================================================
echo.
echo Check these URLs in your browser:
echo.
echo 1. API Health Check (should return JSON):
start https://recipe-book-api-syqv.onrender.com/api/health
echo.
echo 2. Debug Config (shows current settings):
start https://recipe-book-api-syqv.onrender.com/api/debug/config
echo.
pause
del "%~f0"
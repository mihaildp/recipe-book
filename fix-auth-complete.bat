@echo off
cls
echo ================================================
echo   Recipe App - Complete Authentication Fix
echo ================================================
echo.

REM Check if backend is running
echo [1/6] Checking backend status...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Backend is running
) else (
    echo [WARNING] Backend is not running!
    echo Please start it in another terminal:
    echo   cd backend
    echo   npm run dev
    echo.
    pause
)

REM Create/Update frontend .env.local
echo [2/6] Configuring frontend for local development...
(
echo # Local Development Environment Variables
echo.
echo # API URL - Use local backend
echo REACT_APP_API_URL=http://localhost:5000/api
echo.
echo # Google OAuth Client ID  
echo REACT_APP_GOOGLE_CLIENT_ID=487352950609-2188rnt17bhke07htkr3egebt6lpdk5s.apps.googleusercontent.com
echo.
echo # Environment
echo REACT_APP_ENV=development
) > frontend\.env.local
echo [OK] Created/Updated .env.local

REM Check backend .env
echo [3/6] Verifying backend configuration...
if exist backend\.env (
    echo [OK] Backend .env exists
) else (
    echo [ERROR] Backend .env missing!
    if exist backend\.env.example (
        copy backend\.env.example backend\.env
        echo [FIXED] Created backend\.env from example
        echo Please edit backend\.env with your MongoDB credentials!
        pause
    )
)

REM Install missing dependencies
echo [4/6] Checking dependencies...
if not exist backend\node_modules (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)
if not exist frontend\node_modules (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)
echo [OK] Dependencies installed

REM Check for required auth packages
echo [5/6] Verifying authentication packages...
cd backend
call npm list jsonwebtoken bcryptjs google-auth-library >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing missing auth packages...
    call npm install jsonwebtoken bcryptjs google-auth-library
)
cd ..

cd frontend
call npm list @react-oauth/google js-cookie react-hot-toast >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing missing frontend auth packages...
    call npm install @react-oauth/google js-cookie react-hot-toast
)
cd ..

echo [6/6] Creating test credentials...
echo.
echo ================================================
echo   AUTHENTICATION FIX COMPLETE!
echo ================================================
echo.
echo TO TEST YOUR APP:
echo -----------------
echo 1. Start Backend (if not running):
echo    cd backend
echo    npm run dev
echo.
echo 2. Start Frontend (new terminal):
echo    cd frontend
echo    npm start
echo.
echo 3. Clear Browser Data:
echo    - Open Chrome DevTools (F12)
echo    - Go to Application tab
echo    - Clear Storage > Clear site data
echo.
echo 4. Test Login Methods:
echo.
echo    METHOD 1 - Google OAuth:
echo    - Click "Continue with Google"
echo    - Select your Google account
echo.
echo    METHOD 2 - Create New Account:
echo    - Click "Sign Up" tab
echo    - Use test credentials:
echo      Email: test@example.com
echo      Password: Test123!
echo      Name: Test User
echo.
echo 5. Check Console for Errors:
echo    - Open DevTools Console (F12)
echo    - Look for any red error messages
echo    - Check Network tab for failed requests
echo.
echo ================================================
echo COMMON ISSUES AND FIXES:
echo ================================================
echo.
echo Issue: "Network Error" or "Cannot connect"
echo Fix: Make sure backend is running on port 5000
echo.
echo Issue: "Invalid credentials" 
echo Fix: Create a new account or reset password
echo.
echo Issue: "Token expired"
echo Fix: Clear browser cookies and try again
echo.
echo Issue: Page refreshes but doesn't redirect
echo Fix: Check if '/dashboard' route exists in App.js
echo.
echo ================================================
echo.
echo Press any key to open the troubleshooting guide...
pause >nul
start "" "AUTH_TROUBLESHOOTING.md"
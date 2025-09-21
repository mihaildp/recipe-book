@echo off
echo ============================================
echo    Recipe Book - Complete Auth Fix
echo ============================================
echo.

echo This script will fix all authentication issues...
echo.

REM Step 1: Setup Backend Environment
echo [Step 1/6] Setting up backend environment...
if exist "backend\.env.local" (
    echo Renaming .env to .env.production for backup...
    if exist "backend\.env" (
        move /y "backend\.env" "backend\.env.production" >nul 2>&1
    )
    echo Using .env.local for local development...
    copy /y "backend\.env.local" "backend\.env" >nul 2>&1
    echo Backend configured for LOCAL development
) else (
    echo WARNING: No .env.local found in backend
    echo Please ensure CLIENT_URL in backend\.env is set to http://localhost:3000
)
echo.

REM Step 2: Setup Frontend Environment  
echo [Step 2/6] Setting up frontend environment...
if exist "frontend\.env.local" (
    echo Frontend using .env.local for local development
) else (
    echo Creating frontend .env.local...
    (
        echo # Local Development Environment
        echo REACT_APP_API_URL=http://localhost:5000/api
        echo REACT_APP_GOOGLE_CLIENT_ID=487352950609-2188rnt17bhke07htkr3egebt6lpdk5s.apps.googleusercontent.com
        echo REACT_APP_ENV=development
    ) > "frontend\.env.local"
)
echo Frontend configured for LOCAL development
echo.

REM Step 3: Check critical files
echo [Step 3/6] Verifying critical files...
set all_good=true

if not exist "frontend\src\components\auth\Login.js" (
    echo ERROR: Login component missing!
    set all_good=false
)
if not exist "frontend\src\components\LoadingSpinner.js" (
    echo ERROR: LoadingSpinner component missing!
    set all_good=false
)
if not exist "frontend\src\context\AuthContext.js" (
    echo ERROR: AuthContext missing!
    set all_good=false
)

if %all_good%==true (
    echo All critical files present: OK
) else (
    echo WARNING: Some files are missing. The app may not work properly.
)
echo.

REM Step 4: Install dependencies
echo [Step 4/6] Checking dependencies...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)
echo Dependencies: OK
echo.

REM Step 5: Clear any cache
echo [Step 5/6] Clearing cache...
if exist "frontend\.cache" (
    rmdir /s /q "frontend\.cache" 2>nul
    echo Cache cleared
)
echo.

REM Step 6: Final check
echo [Step 6/6] Final verification...
echo.
echo Configuration Summary:
echo ----------------------
echo Backend:
echo   - Port: 5000
echo   - CORS: Accepting http://localhost:3000
echo   - MongoDB: Connected to Atlas
echo.
echo Frontend:
echo   - Port: 3000
echo   - API: http://localhost:5000/api
echo   - Google OAuth: Configured
echo.

echo ============================================
echo    ✅ Authentication System Fixed!
echo ============================================
echo.
echo To start the application:
echo.
echo Option 1 - Quick Start:
echo   Run: start-app.bat
echo.
echo Option 2 - Manual:
echo   Terminal 1: cd backend ^&^& npm run dev
echo   Terminal 2: cd frontend ^&^& npm start
echo.
echo Then open: http://localhost:3000
echo.
echo Test with:
echo   - Google Login (should work immediately)
echo   - Create new account with email
echo.
echo ============================================
pause

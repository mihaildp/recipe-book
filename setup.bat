@echo off
echo =====================================
echo Recipe Book App Setup Script (Windows)
echo =====================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version
echo.

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo npm is installed: 
npm --version
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

REM Create backend .env file if it doesn't exist
if not exist .env (
    echo Creating backend .env file...
    copy .env.example .env
    echo Backend .env file created. Please edit it with your credentials.
) else (
    echo Backend .env file already exists.
)

cd ..

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Create frontend .env file if it doesn't exist
if not exist .env (
    echo Creating frontend .env file...
    copy .env.example .env
    echo Frontend .env file created. Please edit it with your credentials.
) else (
    echo Frontend .env file already exists.
)

cd ..

echo.
echo =====================================
echo Setup completed successfully!
echo =====================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your MongoDB URI and Google Client ID
echo 2. Edit frontend\.env with your Google Client ID
echo 3. Open a new terminal and run: cd backend ^&^& npm run dev
echo 4. Open another terminal and run: cd frontend ^&^& npm start
echo.
echo For detailed instructions, see README.md
echo.
pause

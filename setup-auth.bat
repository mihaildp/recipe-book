@echo off
echo ================================
echo Recipe Book - Enhanced Auth Setup
echo ================================
echo.

echo Installing backend dependencies...
cd backend
call npm install bcryptjs nodemailer cloudinary multer express-rate-limit
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo Installing frontend dependencies...
cd ../frontend
call npm install js-cookie @react-oauth/google
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next Steps:
echo 1. Copy .env.example to .env in both backend and frontend folders
echo 2. Fill in your environment variables:
echo    - Gmail App Password for emails
echo    - Google OAuth Client ID
echo    - MongoDB URI
echo    - JWT Secret
echo.
echo 3. Run the migration script:
echo    cd backend
echo    node src/scripts/migrateUsers.js
echo.
echo 4. Start the servers:
echo    Backend: cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm start
echo.
echo ================================
pause

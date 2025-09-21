@echo off
echo =====================================
echo Recipe Book - Project Cleanup Script
echo =====================================
echo.

echo Cleaning up project files...
echo.

REM Remove empty "New folder" if it exists
if exist "backend\New folder" (
    rmdir "backend\New folder" 2>nul
    echo - Removed empty "New folder" from backend
) else (
    echo - No empty folders found
)

REM Create .env files from examples if they don't exist
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo - Created backend\.env from example
        echo   IMPORTANT: Edit backend\.env with your credentials!
    )
) else (
    echo - backend\.env already exists
)

if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env" >nul
        echo - Created frontend\.env from example  
        echo   IMPORTANT: Edit frontend\.env with your credentials!
    )
) else (
    echo - frontend\.env already exists
)

REM Check if node_modules exist
if not exist "backend\node_modules" (
    echo.
    echo WARNING: backend\node_modules not found
    echo Run "cd backend && npm install" to install dependencies
)

if not exist "frontend\node_modules" (
    echo.
    echo WARNING: frontend\node_modules not found
    echo Run "cd frontend && npm install" to install dependencies
)

echo.
echo =====================================
echo Cleanup Complete!
echo =====================================
echo.
echo Next Steps:
echo 1. Edit backend\.env with your MongoDB URI and Google Client ID
echo 2. Edit frontend\.env with your Google Client ID
echo 3. Install dependencies if needed:
echo    - cd backend ^&^& npm install
echo    - cd frontend ^&^& npm install
echo 4. Test locally:
echo    - cd backend ^&^& npm run dev
echo    - cd frontend ^&^& npm start
echo.
pause

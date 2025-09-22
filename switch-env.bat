@echo off
echo ============================================
echo    Recipe Book - Quick Environment Switch
echo ============================================
echo.
echo Select environment:
echo 1. Local Development
echo 2. Production
echo.
set /p choice=Enter your choice (1 or 2): 

if %choice%==1 (
    echo.
    echo Switching to LOCAL development...
    
    REM Backend
    if exist "backend\.env.local" (
        if exist "backend\.env" (
            copy /y "backend\.env" "backend\.env.backup" >nul 2>&1
        )
        copy /y "backend\.env.local" "backend\.env" >nul 2>&1
        echo Backend: Using local configuration
    )
    
    REM Frontend - .env.local is automatically used by React
    echo Frontend: Will use .env.local automatically
    echo.
    echo ✅ Switched to LOCAL environment
    echo.
    echo Backend API: http://localhost:5000
    echo Frontend: http://localhost:3000
    
) else if %choice%==2 (
    echo.
    echo Switching to PRODUCTION...
    
    REM Backend
    if exist "backend\.env.production" (
        copy /y "backend\.env.production" "backend\.env" >nul 2>&1
        echo Backend: Using production configuration
    )
    
    echo.
    echo ✅ Switched to PRODUCTION environment
    echo.
    echo Make sure to deploy with proper production settings!
    
) else (
    echo Invalid choice!
)

echo.
pause

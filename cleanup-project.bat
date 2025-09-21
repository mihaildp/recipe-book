@echo off
echo ================================
echo Recipe Book - Project Cleanup
echo ================================
echo.

echo Removing old and unnecessary files...

REM Remove old files
del /q "frontend\src\components\Login_old.js" 2>nul
del /q "backend\.env.example.fixed" 2>nul
del /q "backend\test-auth.js" 2>nul

REM Remove duplicate documentation files (keeping the most important ones)
del /q "AUTH_UPDATE_STATUS.md" 2>nul
del /q "AUTH_IMPLEMENTATION_COMPLETE.md" 2>nul
del /q "PASSWORD_UPDATE_CHECKLIST.md" 2>nul
del /q "PUBLISH_CHECKLIST.md" 2>nul
del /q "QUICK_PUBLISH.md" 2>nul
del /q "RENDER_DEPLOYMENT_MIHAILDP.md" 2>nul
del /q "UPDATE_PASSWORD_INSTRUCTIONS.bat" 2>nul
del /q "push_fix.bat" 2>nul
del /q "update_env.ps1" 2>nul

echo Files cleaned up successfully!
echo.

echo ================================
echo Project structure is now clean!
echo ================================
pause

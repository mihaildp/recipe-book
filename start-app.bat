@echo off
echo ============================================
echo    Recipe Book - Quick Start
echo ============================================
echo.
echo Starting Recipe Book Application...
echo.

REM Check if MongoDB is running (optional, only for local MongoDB)
echo Checking services...
echo.

REM Start Backend
echo Starting Backend Server...
start cmd /k "cd backend && npm run dev"
echo Backend starting on http://localhost:5000
echo.

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend
echo Starting Frontend Application...
start cmd /k "cd frontend && npm start"
echo Frontend starting on http://localhost:3000
echo.

echo ============================================
echo    ✅ Application Starting!
echo ============================================
echo.
echo Two new terminal windows have been opened:
echo - Backend Server (Port 5000)
echo - Frontend App (Port 3000)
echo.
echo The browser should open automatically.
echo If not, navigate to: http://localhost:3000
echo.
echo To stop the servers:
echo - Press Ctrl+C in each terminal window
echo.
echo ============================================
pause

@echo off
echo ========================================
echo MongoDB Password Update Instructions
echo ========================================
echo.
echo Your files have been updated with the new password: Clb3w4aiNEeQ0nq8
echo.
echo NOW YOU MUST DO THE FOLLOWING:
echo.
echo 1. UPDATE MONGODB ATLAS:
echo    - Go to https://cloud.mongodb.com/
echo    - Navigate to "Database Access"
echo    - Find user "recipiebook"
echo    - Click "Edit" 
echo    - Update password to: Clb3w4aiNEeQ0nq8
echo    - Click "Update User"
echo.
echo 2. UPDATE RENDER BACKEND:
echo    - Go to https://dashboard.render.com/
echo    - Open your backend service (recipe-book-api-syqv)
echo    - Go to "Environment" tab
echo    - Update MONGODB_URI to:
echo      mongodb+srv://recipiebook:Clb3w4aiNEeQ0nq8@cluster0.gyorrov.mongodb.net/?retryWrites=true^&w=majority^&appName=Cluster0
echo    - Click "Save Changes"
echo    - Service will auto-redeploy
echo.
echo 3. VERIFY NETWORK ACCESS:
echo    - In MongoDB Atlas, go to "Network Access"
echo    - Make sure 0.0.0.0/0 is whitelisted
echo    - If not, click "Add IP Address" then "Allow Access from Anywhere"
echo.
echo 4. PUSH TO GITHUB (Optional):
echo    Run these commands:
echo    git add backend/.env .env.production
echo    git commit -m "Update MongoDB password"
echo    git push origin full-app
echo.
echo IMPORTANT SECURITY NOTES:
echo - You've shared passwords publicly - consider changing them again later
echo - Never commit .env files to public repositories
echo - Use Render's environment variables instead of .env files in production
echo.
pause

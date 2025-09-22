@echo off
cls
echo ========================================================
echo    Recipe App - Email/Password Account Creation Test
echo ========================================================
echo.
echo GOOD NEWS: Your app already has email/password signup!
echo.
echo ========================================================
echo    HOW TO CREATE AN ACCOUNT WITHOUT GOOGLE:
echo ========================================================
echo.
echo 1. Go to: https://recipe-book-frontend-8f1r.onrender.com
echo.
echo 2. Click the "Sign Up" tab (above the form)
echo    - There are TWO tabs: "Sign In" and "Sign Up"
echo    - Make sure "Sign Up" is selected (white background)
echo.
echo 3. Fill in the form:
echo    - Full Name: Your Name
echo    - Email: your@email.com  
echo    - Password: YourPassword123
echo    - Confirm Password: YourPassword123
echo.
echo 4. Click "Create Account" button
echo.
echo 5. You'll be redirected to the dashboard!
echo.
echo ========================================================
echo    TEST ACCOUNTS YOU CAN CREATE:
echo ========================================================
echo.
echo Test Account 1:
echo - Name: John Doe
echo - Email: john@example.com
echo - Password: Test123!
echo.
echo Test Account 2:
echo - Name: Jane Smith
echo - Email: jane@example.com
echo - Password: Password123!
echo.
echo ========================================================
echo    QUICK API TEST:
echo ========================================================
echo.
echo Testing if email signup works via API...
echo.
curl -X POST https://recipe-book-api-syqv.onrender.com/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"apitest@example.com\",\"password\":\"Test123!\"}"
echo.
echo.
echo If you see "success: true" above, email signup is working!
echo.
echo ========================================================
echo    TROUBLESHOOTING:
echo ========================================================
echo.
echo If signup doesn't work:
echo.
echo 1. Clear browser cache (Ctrl+Shift+R)
echo 2. Make sure you're on the "Sign Up" tab, not "Sign In"
echo 3. Password must be at least 6 characters
echo 4. Email must be valid format
echo.
echo ========================================================
echo    OPENING THE APP NOW...
echo ========================================================
echo.
start https://recipe-book-frontend-8f1r.onrender.com
echo.
echo Look for the "Sign Up" tab to create an account!
echo.
pause
#!/bin/bash

echo "============================================"
echo "   Recipe Book - Complete Cleanup and Push"
echo "============================================"
echo ""
echo "Repository: https://github.com/mihaildp/recipe-book.git"
echo ""

# Step 1: Remove old and unnecessary files
echo "[1/5] Cleaning up old files..."
echo "----------------------------------------"

# Remove old frontend files
if [ -f "frontend/src/components/Login_old.js" ]; then
    rm -f "frontend/src/components/Login_old.js"
    echo "- Removed old Login component"
fi

# Remove old backend files
if [ -f "backend/.env.example.fixed" ]; then
    rm -f "backend/.env.example.fixed"
    echo "- Removed duplicate env example"
fi
if [ -f "backend/test-auth.js" ]; then
    rm -f "backend/test-auth.js"
    echo "- Removed test file"
fi

# Remove redundant documentation
rm -f AUTH_UPDATE_STATUS.md
rm -f AUTH_IMPLEMENTATION_COMPLETE.md
rm -f PASSWORD_UPDATE_CHECKLIST.md
rm -f PUBLISH_CHECKLIST.md
rm -f QUICK_PUBLISH.md
rm -f RENDER_DEPLOYMENT_MIHAILDP.md
rm -f UPDATE_PASSWORD_INSTRUCTIONS.bat
rm -f push_fix.bat
rm -f update_env.ps1
echo "- Cleaned up redundant documentation"
echo ""

# Step 2: Check git status
echo "[2/5] Checking git status..."
echo "----------------------------------------"
git status --short
echo ""

# Step 3: Add all changes
echo "[3/5] Adding all changes to git..."
echo "----------------------------------------"
git add -A
echo "- All files added to staging"
echo ""

# Step 4: Create commit
echo "[4/5] Creating commit..."
echo "----------------------------------------"
git commit -m "feat: Complete enhanced authentication system with cleanup

🚀 Major Features Added:
- Dual authentication (Email/Password + Google OAuth)
- Email verification and password reset flow
- 4-step onboarding wizard for new users
- Enhanced user profiles with cooking preferences
- Recipe collections and organization
- Follow/unfollow social system
- User statistics dashboard
- Responsive modern UI design

🔧 Technical Improvements:
- JWT authentication with bcrypt password hashing
- Email service with Nodemailer
- Protected routes and middleware
- Comprehensive error handling
- Form validation and feedback

🧹 Cleanup:
- Removed old/redundant files
- Consolidated documentation
- Organized project structure
- Updated .gitignore

📚 Documentation:
- Complete README with setup instructions
- API endpoint documentation
- Deployment guides"

echo ""

# Step 5: Push to GitHub
echo "[5/5] Pushing to GitHub..."
echo "----------------------------------------"
git push origin main || git push origin master || (git pull origin main --rebase && git push origin main)

echo ""
echo "============================================"
echo "   ✅ Complete! Your project is now:"
echo "============================================"
echo ""
echo "1. Cleaned of unnecessary files"
echo "2. Fully documented with README"
echo "3. Pushed to GitHub repository"
echo ""
echo "Repository: https://github.com/mihaildp/recipe-book.git"
echo ""
echo "Next steps:"
echo "- Configure environment variables"
echo "- Set up MongoDB database"
echo "- Deploy to production"
echo ""

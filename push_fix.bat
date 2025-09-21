@echo off
echo Fixing Print to Printer issue and pushing to GitHub...
echo.

echo Current branch:
git branch --show-current
echo.

echo Fetching remote branches...
git fetch origin
echo.

echo Checking out full-app branch...
git checkout full-app || git checkout -b full-app origin/full-app
echo.

echo Current status:
git status
echo.

echo Adding the fixed file...
git add frontend/src/components/RecipeDetail.js
echo.

echo Committing changes...
git commit -m "Fix: Change Print to Printer icon from lucide-react in RecipeDetail.js"
echo.

echo Pushing to full-app branch...
git push origin full-app --force
echo.

echo Done! Check Render dashboard for rebuild.
pause

# ✅ MongoDB Password Update Checklist

## Password Changed To: `Clb3w4aiNEeQ0nq8`

## Files Updated ✅
- [x] backend/.env
- [x] .env.production

## Required Actions 🔴

### 1. MongoDB Atlas (CRITICAL)
- [ ] Go to https://cloud.mongodb.com/
- [ ] Navigate to "Database Access"
- [ ] Edit user "recipiebook"
- [ ] Change password to: `Clb3w4aiNEeQ0nq8`
- [ ] Click "Update User"

### 2. MongoDB Network Access (CRITICAL)
- [ ] In MongoDB Atlas, go to "Network Access"
- [ ] Ensure `0.0.0.0/0` is in the whitelist
- [ ] If not, click "Add IP Address" → "Allow Access from Anywhere"

### 3. Render Environment Variables (CRITICAL)
- [ ] Go to https://dashboard.render.com/
- [ ] Open backend service: `recipe-book-api-syqv`
- [ ] Go to "Environment" tab
- [ ] Update `MONGODB_URI` to:
```
mongodb+srv://recipiebook:Clb3w4aiNEeQ0nq8@cluster0.gyorrov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```
- [ ] Save changes (will auto-redeploy)

### 4. Test Your App
- [ ] Wait for backend to redeploy (2-3 minutes)
- [ ] Check backend health: https://recipe-book-api-syqv.onrender.com/api/health
- [ ] Try logging in: https://recipe-book-frontend-8f1r.onrender.com

## Git Commands (Optional)
```bash
cd "C:\Users\mihai\OneDrive\Desktop\Work Projects\Recipe"
git add backend/.env .env.production
git commit -m "Update MongoDB password"
git push origin full-app
```

## 🔒 Security Reminders
- Consider changing passwords again since they were shared publicly
- Add `.env` files to `.gitignore` (already done)
- Use environment variables on hosting platforms, not .env files
- Enable 2FA on MongoDB Atlas for extra security

## Success Indicators ✨
- Backend logs show: "✅ MongoDB connected successfully"
- Health check returns: {"status": "OK"}
- Google login works and redirects to dashboard
- You can create and view recipes

# 🚀 RENDER DEPLOYMENT GUIDE - Recipe Book
**For GitHub User: mihaildp**

## ⚠️ IMPORTANT: MongoDB Password Setup

Your MongoDB connection string needs the password:
```
mongodb+srv://recipiebook:<db_password>@cluster0.gyorrov.mongodb.net/recipe-book
```

**To get/reset your MongoDB password:**
1. Go to https://cloud.mongodb.com
2. Login to your account
3. Go to Database Access (left sidebar)
4. Find user "recipiebook"
5. Click "Edit" → "Update Password"
6. Set a new password (avoid special characters like @, #, $)
7. Click "Update User"

**Your password should be something like:** mySecurePass123 (no special chars)

---

## 📝 Pre-Deployment Checklist

✅ **Your Credentials:**
- Google Client ID: `487352950609-2188rnt17bhke07htkr3egebt6lpdk5s.apps.googleusercontent.com`
- MongoDB User: `recipiebook`
- MongoDB Cluster: `cluster0.gyorrov.mongodb.net`
- JWT Secret: `sk_prod_7x9mN3pQ8vR2wT5yB6kL4jH1fG0sE9uC` (generated for you)
- GitHub Username: `mihaildp`

---

## 🔨 Step 1: Push to GitHub

```bash
# Navigate to your project
cd "C:\Users\mihai\OneDrive\Desktop\Work Projects\Recipe"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Recipe Book - Ready for Render deployment"

# Add GitHub remote
git remote add origin https://github.com/mihaildp/recipe-book.git

# Push to GitHub
git push -u origin main
```

**Note:** If the repository doesn't exist yet:
1. Go to https://github.com/new
2. Create repository named: `recipe-book`
3. Make it public
4. Don't initialize with README
5. Then run the commands above

---

## 🌐 Step 2: Deploy Backend on Render

1. **Go to:** https://render.com
2. **Sign up/Login** with GitHub
3. **Click:** "New +" → "Web Service"
4. **Connect:** Your GitHub account (if not connected)
5. **Select:** `mihaildp/recipe-book` repository
6. **Configure:**
   - **Name:** `recipe-book-api`
   - **Region:** Oregon (US West) or closest to you
   - **Branch:** main
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

7. **Click:** "Advanced" to add Environment Variables

8. **Add these Environment Variables:**

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| MONGODB_URI | mongodb+srv://recipiebook:YOUR_PASSWORD@cluster0.gyorrov.mongodb.net/recipe-book?retryWrites=true&w=majority |
| JWT_SECRET | sk_prod_7x9mN3pQ8vR2wT5yB6kL4jH1fG0sE9uC |
| GOOGLE_CLIENT_ID | 487352950609-2188rnt17bhke07htkr3egebt6lpdk5s.apps.googleusercontent.com |
| CLIENT_URL | https://recipe-book-app.onrender.com |
| PORT | 5000 |

**⚠️ IMPORTANT:** Replace `YOUR_PASSWORD` in MONGODB_URI with your actual MongoDB password!

9. **Select:** Free instance type ($0/month)
10. **Click:** "Create Web Service"
11. **Wait:** 2-5 minutes for deployment
12. **Copy your backend URL** (will be like: `https://recipe-book-api.onrender.com`)

---

## 🎨 Step 3: Deploy Frontend on Render

1. **Click:** "New +" → "Static Site"
2. **Select:** `mihaildp/recipe-book` repository again
3. **Configure:**
   - **Name:** `recipe-book-app`
   - **Branch:** main
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

4. **Add Environment Variables:**

| Key | Value |
|-----|-------|
| REACT_APP_GOOGLE_CLIENT_ID | 487352950609-2188rnt17bhke07htkr3egebt6lpdk5s.apps.googleusercontent.com |
| REACT_APP_API_URL | https://recipe-book-api.onrender.com/api |

**Note:** Update the API_URL if your backend URL is different!

5. **Click:** "Create Static Site"
6. **Wait:** 3-5 minutes for deployment
7. **Your app URL will be:** `https://recipe-book-app.onrender.com`

---

## 🔐 Step 4: Update Google OAuth

1. **Go to:** https://console.cloud.google.com/
2. **Select:** Your project
3. **Navigate:** APIs & Services → Credentials
4. **Click:** Your OAuth 2.0 Client ID
5. **Add to Authorized JavaScript origins:**
   - `https://recipe-book-app.onrender.com`
   - `https://recipe-book-api.onrender.com` (optional)

6. **Click:** "SAVE"

---

## ✅ Step 5: Test Your App

1. **Visit:** https://recipe-book-app.onrender.com
2. **Test:**
   - ✅ Google Sign In
   - ✅ Create a recipe
   - ✅ Upload image
   - ✅ Share recipe
   - ✅ View shared recipes
   - ✅ Discover public recipes

---

## 🔧 Troubleshooting

### "Cannot connect to database"
- Check MongoDB password is correct
- Verify IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)
- Check connection string format

### "Google Sign-In not working"
- Verify you added Render URLs to Google OAuth
- Check CLIENT_ID matches everywhere
- Clear browser cache and cookies

### "Application Error"
- Check Render dashboard → Logs
- Verify all environment variables are set
- Make sure MongoDB URI includes database name: `/recipe-book`

### "Backend not responding"
- Free tier goes to sleep after 15 mins
- First request takes 30-50 seconds to wake up
- Consider upgrading to paid tier ($7/month) to prevent sleep

---

## 📊 Your Live URLs

Once deployed, your app will be available at:

- **Frontend:** https://recipe-book-app.onrender.com
- **Backend API:** https://recipe-book-api.onrender.com
- **Health Check:** https://recipe-book-api.onrender.com/api/health

---

## 🎉 Deployment Complete!

Your Recipe Book is now LIVE! Share it with friends:

```
🍳 Check out my Recipe Book App!
https://recipe-book-app.onrender.com

Create an account and start sharing recipes!
```

---

## 💡 Next Steps

1. **Test all features** with a friend
2. **Monitor logs** in Render dashboard
3. **Consider upgrading** to prevent sleep ($7/month)
4. **Add Cloudinary** for better image storage
5. **Get a custom domain** (optional)

---

## 📞 Support

- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Google Console:** https://console.cloud.google.com

---

**Questions?** Check the logs in Render Dashboard first!

Last Updated: November 2024
GitHub: mihaildp/recipe-book

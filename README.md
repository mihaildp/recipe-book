# 🍳 Recipe Book

A modern recipe management application where users can create, organize, and share their favorite recipes.

![Recipe Book](https://img.shields.io/badge/Recipe-Book-orange)
![Status](https://img.shields.io/badge/Status-Live-success)
![Auth](https://img.shields.io/badge/Auth-Email%2FPassword-blue)

## 🚀 Live Application

**Visit:** https://recipe-book-frontend-8f1r.onrender.com

## ✨ Features

- **User Authentication**: Secure signup and login with email/password
- **Recipe Management**: Create, edit, delete, and organize your recipes
- **Rich Recipe Details**: Add ingredients, instructions, photos, and cooking times
- **Smart Categories**: Organize by cuisine, meal type, dietary preferences
- **Recipe Sharing**: Share your favorite recipes with friends
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **User Profiles**: Customize your cooking profile and preferences

## 🛠 Technology Stack

### Frontend
- React 18 with React Router
- Tailwind CSS for styling
- Axios for API communication
- JWT authentication

### Backend  
- Node.js & Express
- MongoDB Atlas (cloud database)
- JWT for secure authentication
- bcrypt for password security

### Deployment
- Frontend & Backend hosted on Render
- Automatic deployments from GitHub
- MongoDB Atlas for database

## 📱 Getting Started

1. **Sign Up**: Create an account with your email and password
2. **Log In**: Access your personalized recipe collection
3. **Add Recipes**: Start building your cookbook
4. **Organize**: Use categories and tags to organize recipes
5. **Share**: Share recipes with friends and family

## 🔒 Security

- Passwords are encrypted with bcrypt
- JWT tokens for secure sessions
- HTTPS encryption for all data
- Environment variables for sensitive data

## 📊 API Endpoints

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login
- `GET /api/recipes` - Get user's recipes
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

## 🌍 Environment Variables

### Backend
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS

### Frontend
- `REACT_APP_API_URL` - Backend API URL

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 👤 Author

Created by Mihai

---

**Live at:** https://recipe-book-frontend-8f1r.onrender.com
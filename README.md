# 🍳 Recipe Book - Full Stack Recipe Management Application

A modern, full-featured recipe management application with enhanced authentication, user profiles, and social features.

## ✨ Features

### Authentication & User Management
- **Dual Authentication**: Email/Password and Google OAuth
- **Email Verification**: Secure account verification
- **Password Reset**: Email-based password recovery
- **User Profiles**: Extended profiles with cooking preferences
- **Onboarding Flow**: 4-step wizard for new users

### Recipe Management
- **CRUD Operations**: Create, read, update, delete recipes
- **Rich Recipe Details**: Ingredients, instructions, prep/cook time, servings
- **Categories & Regions**: Organize by cuisine type and region
- **Ratings & Notes**: Rate recipes and add personal notes
- **Photo Uploads**: Add images to recipes
- **Nutritional Information**: Track calories and nutrients

### Social & Sharing Features
- **Recipe Sharing**: Share recipes with specific users or make public
- **Collections**: Organize recipes into custom collections
- **Follow System**: Follow other users and discover their recipes
- **Favorites**: Save favorite recipes for quick access
- **User Discovery**: Find and connect with other cooks

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Search & Filter**: Find recipes by ingredients, category, or region
- **Dashboard Statistics**: View cooking stats and recent activity
- **Dark Mode Support**: Easy on the eyes (coming soon)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Gmail account with 2FA for emails
- Google Cloud Console account for OAuth

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mihaildp/recipe-book.git
cd recipe-book
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**

Backend `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipe-book
JWT_SECRET=your-super-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
CLIENT_URL=http://localhost:3000
```

Frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

4. **Set up Gmail App Password**
   - Enable 2FA on your Gmail account
   - Generate an app password
   - Add to EMAIL_APP_PASSWORD

5. **Run database migration** (for existing users)
```bash
cd backend
node src/scripts/migrateUsers.js
```

6. **Start the application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
recipe-book/
├── backend/
│   ├── src/
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   ├── utils/         # Email, cloudinary
│   │   └── server.js      # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   └── auth/      # Auth components
│   │   ├── context/       # Auth context
│   │   ├── services/      # API services
│   │   └── App.js         # Main app
│   └── package.json
└── README.md
```

## 🔧 Tech Stack

### Frontend
- React.js
- React Router v6
- Tailwind CSS
- Axios
- React Hot Toast
- Lucide React Icons
- Google OAuth

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt.js
- Nodemailer
- Google Auth Library

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### User Management
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics
- `POST /api/users/collections` - Create collection
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/account` - Delete account

### Recipes
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/:id` - Get recipe details
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

## 🚢 Deployment

### Deploy to Render
1. Create accounts on Render and MongoDB Atlas
2. Set up environment variables in Render
3. Deploy backend and frontend separately
4. Update URLs in environment variables

### Deploy to Vercel/Netlify
- Frontend can be deployed to Vercel or Netlify
- Backend can be deployed to Railway or Render
- Use MongoDB Atlas for database

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure authentication
- **Email Verification**: Confirm user emails
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize user input
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Secure configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Mihail DP**
- GitHub: [@mihaildp](https://github.com/mihaildp)

## 🙏 Acknowledgments

- React.js community
- MongoDB documentation
- Tailwind CSS
- Google OAuth guides

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

---

**Built with ❤️ for home cooks everywhere**

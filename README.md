# Recipe Book - Production App with Sharing Features

A full-stack recipe management application with Google authentication, recipe sharing capabilities, and MongoDB data persistence.

## ✨ Features

### Core Features
- 🔐 **Google OAuth Authentication** - Secure login with Google accounts
- 📸 **Multiple Photo Upload** - Add multiple photos to each recipe
- 🔍 **Smart Recipe Import** - Extract recipes from URLs or photos (OCR)
- ✏️ **Manual Recipe Entry** - Full control over recipe creation
- 🏷️ **Categorization** - Organize by cuisine type and meal category
- ⭐ **Rating System** - Rate your recipes and track favorites
- 💾 **Cloud Storage** - All data persisted in MongoDB
- 📱 **Responsive Design** - Works on desktop and mobile devices

### 🆕 Sharing & Collaboration Features
- 🌍 **Public Recipes** - Share recipes with the entire community
- 👥 **Private Sharing** - Share recipes with specific users via email
- 🔒 **Permission Levels**:
  - **View Only** - Users can view but not copy or edit
  - **Can Copy** - Users can copy the recipe to their collection
  - **Can Edit** - Users can edit the shared recipe
- 💬 **Comments & Reviews** - Leave feedback and ratings on shared recipes
- 📊 **Discover Page** - Browse and search public recipes from the community
- 📈 **Engagement Metrics** - Track views, likes, and copies of your recipes
- 🔄 **Recipe Forking** - Copy and customize shared recipes
- 📧 **Email-based Sharing** - Share with users even if they haven't signed up yet

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Google OAuth 2.0
- Express Validator for input validation
- Helmet for security headers
- Multer for file uploads

### Frontend
- React 18
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Google OAuth React library
- React Hot Toast for notifications
- Lucide React for icons

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local installation - [Download](https://www.mongodb.com/try/download/community)
   - MongoDB Atlas account (free tier) - [Sign up](https://www.mongodb.com/cloud/atlas)
3. **Google Cloud Console Account** - For OAuth setup

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain
7. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production domain
8. Copy the Client ID

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` file with your credentials:
```
MONGODB_URI=mongodb://localhost:27017/recipe-book
JWT_SECRET=your-super-secret-jwt-key-change-this
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` file:
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Running the Application

#### Development Mode

**Option 1: Using the monorepo package.json (Recommended)**
```bash
# From the root directory
npm install
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## 📖 Using the Sharing Features

### Making a Recipe Public
1. Open any of your recipes
2. Click the Share button (share icon)
3. Select "Public" visibility
4. Your recipe is now discoverable by all users

### Sharing with Specific Users
1. Open any of your recipes
2. Click the Share button
3. Select "Shared with specific people"
4. Enter email addresses of people you want to share with
5. Choose permission level (View, Copy, or Edit)
6. Click "Share Recipe"

### Discovering Public Recipes
1. Navigate to the "Discover" page from the navigation menu
2. Browse public recipes from the community
3. Use filters to find specific categories or regions
4. Click the copy button to add a recipe to your collection
5. Leave comments and ratings on recipes you've tried

### Managing Shared Recipes
- **Shared with Me**: View all recipes others have shared with you
- **Permission Badges**: See what level of access you have for each recipe
- **Copy to Collection**: Make your own editable copy of shared recipes
- **Comments**: Leave feedback and see what others are saying

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### Recipes
- `GET /api/recipes/my-recipes` - Get user's recipes
- `GET /api/recipes/:id` - Get single recipe (with access control)
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe (with permission check)
- `DELETE /api/recipes/:id` - Delete recipe (owner only)
- `POST /api/recipes/:id/images` - Upload recipe images
- `POST /api/recipes/:id/favorite` - Toggle favorite
- `GET /api/recipes/favorites/list` - Get favorite recipes

### Sharing
- `POST /api/sharing/:id/share` - Share recipe with users
- `PATCH /api/sharing/:id/visibility` - Update recipe visibility
- `DELETE /api/sharing/:id/share` - Remove sharing
- `GET /api/sharing/shared-with-me` - Get recipes shared with me
- `GET /api/sharing/public` - Get public recipes
- `POST /api/sharing/:id/copy` - Copy a shared recipe
- `POST /api/sharing/:id/comments` - Add comment to recipe
- `DELETE /api/sharing/:id/comments/:commentId` - Delete comment
- `GET /api/sharing/:id/sharing` - Get sharing details

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/preferences` - Update preferences
- `GET /api/users/stats` - Get user statistics
- `DELETE /api/users/account` - Delete account

## Project Structure

```
Recipe/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Recipe.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── recipes.js
│   │   │   ├── sharing.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── RecipeForm.js
│   │   │   ├── RecipeDetail.js
│   │   │   ├── SharedRecipes.js
│   │   │   ├── Discover.js
│   │   │   ├── ShareRecipeModal.js
│   │   │   └── Navigation.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── recipeService.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
└── README.md
```

## Security Considerations

### Access Control
- **Owner Rights**: Full control over their recipes
- **Shared Access**: Granular permissions (view/copy/edit)
- **Public Recipes**: Read-only access for all authenticated users
- **Private by Default**: New recipes are private unless explicitly shared

### Data Protection
1. **JWT Authentication**: Secure token-based auth
2. **Input Validation**: All inputs sanitized and validated
3. **CORS Protection**: Restricted to allowed origins
4. **Permission Checks**: Server-side validation of all actions
5. **Email Privacy**: Users can only see emails of people they've shared with

## Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Heroku Deployment
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set GOOGLE_CLIENT_ID=your-client-id
git push heroku main
```

### Environment Variables

#### Backend (.env)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-book
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
CLIENT_URL=https://your-frontend-domain.com
PORT=5000
```

#### Frontend (.env)
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Troubleshooting

### Sharing Issues
- **Can't share recipe**: Ensure you're the owner of the recipe
- **User not receiving shared recipe**: Check if email is correct
- **Can't edit shared recipe**: Verify you have edit permissions

### Permission Errors
- **403 Forbidden**: You don't have access to this recipe
- **Can't copy recipe**: Check if you have copy or edit permissions
- **Can't delete comment**: You can only delete your own comments

## Future Enhancements

- [ ] Real-time notifications for new shares
- [ ] Recipe collections/cookbooks
- [ ] Advanced search with filters
- [ ] Recipe version history
- [ ] Collaborative meal planning
- [ ] Shopping list generation
- [ ] Nutritional information
- [ ] Recipe scaling calculator
- [ ] Export recipes to PDF
- [ ] Social features (follow users, activity feed)
- [ ] Recipe challenges and contests
- [ ] Integration with grocery delivery services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License

## Support

For issues or questions, please create an issue in the GitHub repository.

---

Built with ❤️ for home cooks who love to share

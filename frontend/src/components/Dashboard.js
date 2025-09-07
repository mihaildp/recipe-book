import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Book, Plus, Search, Filter, LogOut, User, ChefHat, Clock, Star, 
  Share2, Globe, Lock, Users as UsersIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import recipeService from '../services/recipeService';
import LoadingSpinner from './LoadingSpinner';
import ShareRecipeModal from './ShareRecipeModal';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    shared: 0,
    private: 0
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedRecipeForShare, setSelectedRecipeForShare] = useState(null);

  const categories = ['all', 'Appetizer', 'Main Course', 'Dessert', 'Soup', 'Salad', 'Breakfast', 'Snack', 'Beverage'];
  const regions = ['all', 'Italian', 'Asian', 'Mexican', 'American', 'French', 'Mediterranean', 'Indian', 'Thai', 'Japanese', 'Greek'];

  useEffect(() => {
    fetchRecipes();
  }, [filterCategory, filterRegion, searchTerm]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterCategory !== 'all') filters.category = filterCategory;
      if (filterRegion !== 'all') filters.region = filterRegion;
      if (searchTerm) filters.search = searchTerm;

      const response = await recipeService.getMyRecipes(filters);
      if (response.success) {
        setRecipes(response.recipes);
        calculateStats(response.recipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (recipeList) => {
    const total = recipeList.length;
    const publicRecipes = recipeList.filter(r => r.visibility === 'public').length;
    const sharedRecipes = recipeList.filter(r => r.visibility === 'shared').length;
    const privateRecipes = recipeList.filter(r => r.visibility === 'private').length;

    setStats({ 
      total, 
      public: publicRecipes,
      shared: sharedRecipes,
      private: privateRecipes
    });
  };

  const handleDeleteRecipe = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        const response = await recipeService.deleteRecipe(id);
        if (response.success) {
          toast.success('Recipe deleted successfully');
          fetchRecipes();
        }
      } catch (error) {
        toast.error('Failed to delete recipe');
      }
    }
  };

  const handleShareRecipe = (recipe, e) => {
    e.stopPropagation();
    setSelectedRecipeForShare(recipe);
    setShareModalOpen(true);
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'shared':
        return <UsersIcon className="w-4 h-4 text-blue-600" />;
      default:
        return <Lock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVisibilityBadge = (visibility) => {
    const config = {
      public: { bg: 'bg-green-100', text: 'text-green-700', label: 'Public' },
      shared: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Shared' },
      private: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Private' }
    };
    
    const style = config[visibility] || config.private;
    
    return (
      <span className={`px-2 py-1 ${style.bg} ${style.text} rounded-lg text-xs font-semibold flex items-center gap-1`}>
        {getVisibilityIcon(visibility)}
        {style.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Recipes</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <ChefHat className="w-10 h-10 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Public</p>
                <p className="text-3xl font-bold text-green-600">{stats.public}</p>
              </div>
              <Globe className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Shared</p>
                <p className="text-3xl font-bold text-blue-600">{stats.shared}</p>
              </div>
              <UsersIcon className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Private</p>
                <p className="text-3xl font-bold text-gray-600">{stats.private}</p>
              </div>
              <Lock className="w-10 h-10 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
            >
              {regions.map(reg => (
                <option key={reg} value={reg}>
                  {reg === 'all' ? 'All Regions' : reg}
                </option>
              ))}
            </select>
            
            <Link
              to="/recipes/new"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Recipe
            </Link>
          </div>
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" message="Loading your recipes..." />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterCategory !== 'all' || filterRegion !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first recipe!'}
            </p>
            <Link
              to="/recipes/new"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <div
                key={recipe._id}
                onClick={() => navigate(`/recipes/${recipe._id}`)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 relative">
                  {recipe.photos && recipe.photos.length > 0 ? (
                    <img 
                      src={recipe.photos[0].url} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ChefHat className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  
                  {/* Visibility badge */}
                  <div className="absolute top-2 left-2">
                    {getVisibilityBadge(recipe.visibility)}
                  </div>
                  
                  {/* Rating */}
                  {recipe.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < recipe.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Share button */}
                  <button
                    onClick={(e) => handleShareRecipe(recipe, e)}
                    className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                    title="Share recipe"
                  >
                    <Share2 className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{recipe.title}</h3>
                  
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {recipe.servings} servings
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {recipe.category && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                        {recipe.category}
                      </span>
                    )}
                    {recipe.region && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                        {recipe.region}
                      </span>
                    )}
                    {recipe.sharedWith && recipe.sharedWith.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                        Shared with {recipe.sharedWith.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Recipe Modal */}
      <ShareRecipeModal
        recipe={selectedRecipeForShare}
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setSelectedRecipeForShare(null);
        }}
        onUpdate={fetchRecipes}
      />
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Star, Copy, MessageSquare, Search, Filter, ChefHat } from 'lucide-react';
import recipeService from '../services/recipeService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const SharedRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');

  const categories = ['all', 'Appetizer', 'Main Course', 'Dessert', 'Soup', 'Salad', 'Breakfast', 'Snack', 'Beverage'];
  const regions = ['all', 'Italian', 'Asian', 'Mexican', 'American', 'French', 'Mediterranean', 'Indian', 'Thai', 'Japanese', 'Greek'];

  useEffect(() => {
    fetchSharedRecipes();
  }, [filterCategory, filterRegion, searchTerm]);

  const fetchSharedRecipes = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterCategory !== 'all') filters.category = filterCategory;
      if (filterRegion !== 'all') filters.region = filterRegion;
      if (searchTerm) filters.search = searchTerm;

      const response = await recipeService.getSharedWithMe(filters);
      if (response.success) {
        setRecipes(response.recipes);
      }
    } catch (error) {
      console.error('Error fetching shared recipes:', error);
      toast.error('Failed to load shared recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRecipe = async (recipeId, e) => {
    e.stopPropagation();
    
    try {
      const response = await recipeService.copyRecipe(recipeId);
      if (response.success) {
        toast.success('Recipe copied to your collection!');
        navigate(`/recipes/${response.recipe._id}/edit`);
      }
    } catch (error) {
      toast.error('Failed to copy recipe');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPermissionBadge = (recipe) => {
    const share = recipe.sharedWith?.find(s => 
      s.user === recipe.owner._id || s.email === recipe.owner.email
    );
    
    if (!share) return null;
    
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
        share.permission === 'edit' ? 'bg-purple-100 text-purple-700' :
        share.permission === 'copy' ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {share.permission === 'edit' ? 'Can Edit' :
         share.permission === 'copy' ? 'Can Copy' :
         'View Only'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Shared with Me</h1>
                <p className="text-gray-600">Recipes others have shared with you</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search shared recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
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
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              {regions.map(reg => (
                <option key={reg} value={reg}>
                  {reg === 'all' ? 'All Regions' : reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" message="Loading shared recipes..." />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No shared recipes yet</h3>
            <p className="text-gray-500">
              When others share recipes with you, they'll appear here
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <div
                key={recipe._id}
                onClick={() => navigate(`/recipes/${recipe._id}`)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-blue-200 to-purple-200 relative">
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
                  
                  {/* Shared by badge */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-2">
                    {recipe.owner.picture ? (
                      <img 
                        src={recipe.owner.picture} 
                        alt={recipe.owner.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">
                          {recipe.owner.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-xs font-semibold">{recipe.owner.name}</span>
                  </div>
                  
                  {/* Rating */}
                  {recipe.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold">{recipe.rating}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{recipe.title}</h3>
                  
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {recipe.servings} servings
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {recipe.category && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                          {recipe.category}
                        </span>
                      )}
                      {getPermissionBadge(recipe)}
                    </div>
                    
                    <button
                      onClick={(e) => handleCopyRecipe(recipe._id, e)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Copy to my recipes"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Comments indicator */}
                {recipe.comments && recipe.comments.length > 0 && (
                  <div className="px-4 pb-3 flex items-center gap-2 text-gray-500">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{recipe.comments.length} comments</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedRecipes;

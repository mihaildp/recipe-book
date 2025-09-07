import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, TrendingUp, Clock, Star, Copy, Heart, Users, Search, ChefHat } from 'lucide-react';
import recipeService from '../services/recipeService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const Discover = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['all', 'Appetizer', 'Main Course', 'Dessert', 'Soup', 'Salad', 'Breakfast', 'Snack', 'Beverage'];
  const regions = ['all', 'Italian', 'Asian', 'Mexican', 'American', 'French', 'Mediterranean', 'Indian', 'Thai', 'Japanese', 'Greek'];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-rating', label: 'Highest Rated' },
    { value: '-views', label: 'Most Viewed' },
    { value: '-copies', label: 'Most Copied' }
  ];

  useEffect(() => {
    fetchPublicRecipes();
  }, [filterCategory, filterRegion, searchTerm, sortBy, page]);

  const fetchPublicRecipes = async () => {
    try {
      setLoading(true);
      const filters = {
        page,
        limit: 12,
        sort: sortBy
      };
      
      if (filterCategory !== 'all') filters.category = filterCategory;
      if (filterRegion !== 'all') filters.region = filterRegion;
      if (searchTerm) filters.search = searchTerm;

      const response = await recipeService.getPublicRecipes(filters);
      if (response.success) {
        setRecipes(response.recipes);
        setTotalPages(response.pages);
      }
    } catch (error) {
      console.error('Error fetching public recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRecipe = async (recipeId, e) => {
    e.stopPropagation();
    
    try {
      const response = await recipeService.copyRecipe(recipeId);
      if (response.success) {
        toast.success('Recipe added to your collection!');
        navigate(`/recipes/${response.recipe._id}/edit`);
      }
    } catch (error) {
      toast.error('Failed to copy recipe');
    }
  };

  const handleLikeRecipe = async (recipeId, e) => {
    e.stopPropagation();
    
    try {
      const response = await recipeService.toggleFavorite(recipeId);
      if (response.success) {
        toast.success(response.message);
        fetchPublicRecipes();
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num?.toString() || '0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-purple-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Discover Recipes</h1>
                <p className="text-gray-600">Explore recipes shared by the community</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-700">
                {recipes.length} Public Recipes
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search public recipes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            
            <select
              value={filterRegion}
              onChange={(e) => {
                setFilterRegion(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              {regions.map(reg => (
                <option key={reg} value={reg}>
                  {reg === 'all' ? 'All Regions' : reg}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" message="Discovering amazing recipes..." />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No public recipes found</h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later for new recipes
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map(recipe => (
                <div
                  key={recipe._id}
                  onClick={() => navigate(`/recipes/${recipe._id}`)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="h-48 bg-gradient-to-br from-purple-200 to-pink-200 relative">
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
                    
                    {/* Creator badge */}
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                      {recipe.owner.picture ? (
                        <img 
                          src={recipe.owner.picture} 
                          alt={recipe.owner.name}
                          className="w-5 h-5 rounded-full"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {recipe.owner.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-white text-xs font-medium">
                        {recipe.owner.name}
                      </span>
                    </div>
                    
                    {/* Stats overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="flex justify-between items-center text-white text-sm">
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {formatNumber(recipe.likes?.length || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Copy className="w-4 h-4" />
                            {formatNumber(recipe.copies || 0)}
                          </span>
                        </div>
                        {recipe.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            {recipe.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
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
                        {recipe.servings}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {recipe.category && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                            {recipe.category}
                          </span>
                        )}
                        {recipe.region && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-semibold">
                            {recipe.region}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleLikeRecipe(recipe._id, e)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Like recipe"
                        >
                          <Heart className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                          onClick={(e) => handleCopyRecipe(recipe._id, e)}
                          className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Add to my recipes"
                        >
                          <Copy className="w-4 h-4 text-purple-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1 items-center">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          page === pageNum
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-white hover:bg-gray-100 shadow'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          page === totalPages
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-white hover:bg-gray-100 shadow'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;

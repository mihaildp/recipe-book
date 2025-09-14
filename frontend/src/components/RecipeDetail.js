import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Trash2, Star, Clock, Users, 
  ChevronLeft, ChevronRight, Heart, Share2, Printer,
  ChefHat, Copy, MessageSquare, Send, Lock, Globe, Users as UsersIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import recipeService from '../services/recipeService';
import LoadingSpinner from './LoadingSpinner';
import ShareRecipeModal from './ShareRecipeModal';
import toast from 'react-hot-toast';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await recipeService.getRecipe(id);
      if (response.success) {
        setRecipe(response.recipe);
        setIsOwner(response.recipe.owner._id === user?.id || response.recipe.owner === user?.id);
        
        // Check permission level if not owner
        if (!isOwner && response.recipe.sharedWith) {
          const share = response.recipe.sharedWith.find(s => 
            s.user === user?.id || s.email === user?.email
          );
          setPermission(share?.permission || null);
        }
        
        // Check if recipe is in favorites
        const favResponse = await recipeService.getFavorites();
        if (favResponse.success) {
          setIsFavorite(favResponse.favorites.some(fav => fav._id === id));
        }
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      try {
        const response = await recipeService.deleteRecipe(id);
        if (response.success) {
          toast.success('Recipe deleted successfully');
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('Failed to delete recipe');
      }
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await recipeService.toggleFavorite(id);
      if (response.success) {
        setIsFavorite(response.isFavorite);
        toast.success(response.message);
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleUpdateRating = async (newRating) => {
    if (!isOwner) {
      toast.info('Only the recipe owner can change the main rating');
      return;
    }
    
    try {
      const response = await recipeService.updateRecipe(id, { rating: newRating });
      if (response.success) {
        setRecipe(prev => ({ ...prev, rating: newRating }));
        toast.success('Rating updated');
      }
    } catch (error) {
      toast.error('Failed to update rating');
    }
  };

  const handleCopyRecipe = async () => {
    try {
      const response = await recipeService.copyRecipe(id);
      if (response.success) {
        toast.success('Recipe copied to your collection!');
        navigate(`/recipes/${response.recipe._id}/edit`);
      }
    } catch (error) {
      toast.error('Failed to copy recipe');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    try {
      setSubmittingComment(true);
      const response = await recipeService.addComment(id, commentText, commentRating || null);
      if (response.success) {
        toast.success('Comment added');
        setCommentText('');
        setCommentRating(0);
        setRecipe(prev => ({ ...prev, comments: response.comments }));
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        const response = await recipeService.deleteComment(id, commentId);
        if (response.success) {
          toast.success('Comment deleted');
          setRecipe(prev => ({
            ...prev,
            comments: prev.comments.filter(c => c._id !== commentId)
          }));
        }
      } catch (error) {
        toast.error('Failed to delete comment');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && recipe.visibility === 'public') {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const nextPhoto = () => {
    if (recipe?.photos && recipe.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === recipe.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (recipe?.photos && recipe.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? recipe.photos.length - 1 : prev - 1
      );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getVisibilityBadge = () => {
    if (!recipe) return null;
    
    const config = {
      public: { icon: Globe, color: 'text-green-600', bg: 'bg-green-100', label: 'Public Recipe' },
      shared: { icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Shared Recipe' },
      private: { icon: Lock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Private Recipe' }
    };
    
    const style = config[recipe.visibility] || config.private;
    const Icon = style.icon;
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 ${style.bg} rounded-lg`}>
        <Icon className={`w-4 h-4 ${style.color}`} />
        <span className={`text-sm font-semibold ${style.color}`}>{style.label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading recipe..." />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Recipe not found</p>
          <Link 
            to="/dashboard"
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Image */}
          <div className="relative">
            {recipe.photos && recipe.photos.length > 0 ? (
              <div className="relative h-96 bg-gray-100">
                <img 
                  src={recipe.photos[currentPhotoIndex].url} 
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                {recipe.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {recipe.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentPhotoIndex 
                              ? 'bg-white w-8' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-96 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                <ChefHat className="w-24 h-24 text-white/50" />
              </div>
            )}

            {/* Floating Action Buttons */}
            <div className="absolute top-4 left-4">
              <Link
                to="/dashboard"
                className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors inline-block"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/90 backdrop-blur-sm hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              {!isOwner && permission !== 'view' && (
                <button
                  onClick={handleCopyRecipe}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors"
                  title="Copy to my recipes"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
              
              {isOwner && (
                <>
                  <button
                    onClick={handleShare}
                    className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors hidden md:block"
                  >
                    <Print className="w-5 h-5" />
                  </button>
                  <Link
                    to={`/recipes/${id}/edit`}
                    className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Recipe Content */}
          <div className="p-8">
            {/* Title and Meta */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold">{recipe.title}</h1>
                {getVisibilityBadge()}
              </div>
              
              {/* Owner info for shared recipes */}
              {!isOwner && recipe.owner && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  {recipe.owner.picture ? (
                    <img 
                      src={recipe.owner.picture} 
                      alt={recipe.owner.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {recipe.owner.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Recipe by</p>
                    <p className="font-semibold">{recipe.owner.name}</p>
                  </div>
                  {permission && (
                    <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                      You have {permission} access
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {recipe.category && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-semibold">
                    {recipe.category}
                  </span>
                )}
                {recipe.region && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-semibold">
                    {recipe.region}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => isOwner && handleUpdateRating(i + 1)}
                      className={`p-0.5 ${isOwner ? 'cursor-pointer' : 'cursor-default'}`}
                      disabled={!isOwner}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          i < recipe.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        } ${isOwner ? 'hover:text-yellow-300' : ''}`}
                      />
                    </button>
                  ))}
                </div>
                {recipe.copies > 0 && (
                  <span className="text-sm text-gray-600">
                    Copied {recipe.copies} time{recipe.copies !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Prep: {recipe.prepTime || 0} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Cook: {recipe.cookTime || 0} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold">
                    Total: {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {recipe.notes && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                <p className="text-blue-700">
                  <strong>Notes:</strong> {recipe.notes}
                </p>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Ingredients</h2>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-3 mt-1">•</span>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="bg-orange-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Instructions</h2>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 pt-1">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Comments Section */}
            {(recipe.visibility !== 'private' || !isOwner) && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({recipe.comments?.length || 0})
                </h3>
                
                {/* Add Comment Form */}
                {!isOwner && (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-3">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Your Rating (optional)
                        </label>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setCommentRating(i + 1)}
                              className="p-1"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  i < commentRating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 hover:text-yellow-300'
                                }`}
                              />
                            </button>
                          ))}
                          {commentRating > 0 && (
                            <button
                              type="button"
                              onClick={() => setCommentRating(0)}
                              className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts about this recipe..."
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none resize-none"
                          rows="3"
                        />
                        <button
                          type="submit"
                          disabled={submittingComment || !commentText.trim()}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </form>
                )}
                
                {/* Comments List */}
                <div className="space-y-4">
                  {recipe.comments?.map((comment) => (
                    <div key={comment._id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {comment.user?.picture ? (
                            <img 
                              src={comment.user.picture} 
                              alt={comment.user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {comment.user?.name?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{comment.user?.name || 'Anonymous'}</p>
                              {comment.rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < comment.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-700">{comment.text}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        {(isOwner || comment.user?._id === user?.id) && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!recipe.comments || recipe.comments.length === 0) && (
                    <p className="text-gray-500 text-center py-4">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 pt-8 border-t text-sm text-gray-500">
              <p>Created: {formatDate(recipe.createdAt)}</p>
              {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
                <p>Last updated: {formatDate(recipe.updatedAt)}</p>
              )}
              {recipe.originalRecipe && (
                <p className="mt-2">
                  This recipe was copied from another user's collection
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isOwner && (
        <ShareRecipeModal
          recipe={recipe}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          onUpdate={fetchRecipe}
        />
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RecipeDetail;

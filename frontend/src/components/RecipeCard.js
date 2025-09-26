import React, { useState } from 'react';
import { 
  Globe, Lock, Users, Edit3, Trash2, Share2, MoreVertical, X, Check 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import recipeService from '../services/recipeService';
import { Star, Clock, User, ChefHat } from 'lucide-react';

import toast from 'react-hot-toast';

const RecipeCard = ({ recipe, onUpdate, onDelete, onShare }) => {
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState(recipe.visibility);

  const visibilityOptions = [
    { value: 'public', icon: Globe, color: 'green', label: 'Public' },
    { value: 'shared', icon: Users, color: 'blue', label: 'Shared' },
    { value: 'private', icon: Lock, color: 'gray', label: 'Private' }
  ];

  const handleVisibilityChange = async (newVisibility) => {
    if (newVisibility === recipe.visibility) {
      setShowQuickEdit(false);
      return;
    }

    setUpdatingVisibility(true);
    try {
      const response = await recipeService.updateRecipe(recipe._id, { 
        visibility: newVisibility 
      });
      
      if (response.success) {
        toast.success(`Recipe is now ${newVisibility}`);
        setSelectedVisibility(newVisibility);
        onUpdate(); // Refresh the recipe list
        setShowQuickEdit(false);
      }
    } catch (error) {
      toast.error('Failed to update visibility');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const getVisibilityIcon = () => {
    const option = visibilityOptions.find(opt => opt.value === recipe.visibility);
    const Icon = option.icon;
    const colorClasses = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      gray: 'text-gray-600'
    };
    return <Icon className={`w-4 h-4 ${colorClasses[option.color]}`} />;
  };

  const getVisibilityBadge = () => {
    const option = visibilityOptions.find(opt => opt.value === recipe.visibility);
    const bgClasses = {
      green: 'bg-green-100',
      blue: 'bg-blue-100',
      gray: 'bg-gray-100'
    };
    const textClasses = {
      green: 'text-green-700',
      blue: 'text-blue-700',
      gray: 'text-gray-700'
    };
    
    return (
      <span className={`px-2 py-1 ${bgClasses[option.color]} ${textClasses[option.color]} rounded-lg text-xs font-semibold flex items-center gap-1`}>
        {getVisibilityIcon()}
        {option.label}
      </span>
    );
  };

  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
      {/* Quick Actions Menu */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowQuickEdit(!showQuickEdit);
          }}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showQuickEdit && (
          <div className="absolute right-0 top-10 bg-white rounded-lg shadow-xl border p-2 min-w-[200px]">
            {/* Visibility Options */}
            <div className="mb-2 pb-2 border-b">
              <p className="text-xs text-gray-500 px-2 py-1">Change Visibility</p>
              {visibilityOptions.map(option => {
                const Icon = option.icon;
                const isSelected = selectedVisibility === option.value;
                const colorClasses = {
                  green: 'hover:bg-green-50 text-green-700',
                  blue: 'hover:bg-blue-50 text-blue-700',
                  gray: 'hover:bg-gray-50 text-gray-700'
                };
                
                return (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisibilityChange(option.value);
                    }}
                    disabled={updatingVisibility}
                    className={`w-full px-3 py-2 text-left flex items-center gap-3 rounded-md transition-colors ${
                      colorClasses[option.color]
                    } ${isSelected ? 'bg-gray-100' : ''} disabled:opacity-50`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-sm font-medium">{option.label}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <Link
              to={`/recipes/${recipe._id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 text-left flex items-center gap-3 rounded-md hover:bg-gray-50 text-gray-700"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-medium">Edit Recipe</span>
            </Link>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(recipe, e);
                setShowQuickEdit(false);
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-3 rounded-md hover:bg-gray-50 text-gray-700"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share Recipe</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this recipe?')) {
                  onDelete(recipe._id, e);
                }
                setShowQuickEdit(false);
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-3 rounded-md hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete Recipe</span>
            </button>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickEdit(false);
              }}
              className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-50"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <Link to={`/recipes/${recipe._id}`}>
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
            {getVisibilityBadge()}
          </div>
          
          {/* Rating */}
          {recipe.rating > 0 && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
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
      </Link>
    </div>
  );
};

// Add missing imports for icons used in recipe content

export default RecipeCard;
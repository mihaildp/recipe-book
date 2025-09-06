import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, Camera, Link as LinkIcon, 
  PenTool, X, Upload, Star, Clock, Users 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import recipeService from '../services/recipeService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const RecipeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inputMethod, setInputMethod] = useState('manual');
  const [urlInput, setUrlInput] = useState('');
  const [extracting, setExtracting] = useState(false);
  
  const [recipe, setRecipe] = useState({
    title: '',
    ingredients: [''],
    instructions: [''],
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    category: '',
    region: '',
    rating: 0,
    notes: '',
    photos: [],
    tags: []
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);

  const categories = ['Appetizer', 'Main Course', 'Dessert', 'Soup', 'Salad', 'Breakfast', 'Snack', 'Beverage'];
  const regions = ['Italian', 'Asian', 'Mexican', 'American', 'French', 'Mediterranean', 'Indian', 'Thai', 'Japanese', 'Greek'];

  useEffect(() => {
    if (isEditMode) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await recipeService.getRecipe(id);
      if (response.success) {
        setRecipe(response.recipe);
        if (response.recipe.photos) {
          setPhotoPreview(response.recipe.photos.map(p => p.url));
        }
      }
    } catch (error) {
      toast.error('Failed to load recipe');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExtractFromUrl = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setExtracting(true);
      const response = await recipeService.extractFromUrl(urlInput);
      if (response.success) {
        setRecipe(prev => ({
          ...prev,
          ...response.recipe
        }));
        toast.success('Recipe extracted successfully!');
        setInputMethod('manual');
      }
    } catch (error) {
      toast.error('Failed to extract recipe from URL');
    } finally {
      setExtracting(false);
    }
  };

  const handleExtractFromPhoto = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    try {
      setExtracting(true);
      // In production, send the actual image for OCR processing
      const response = await recipeService.processImage(photoPreview[0]);
      if (response.success) {
        setRecipe(prev => ({
          ...prev,
          ...response.recipe
        }));
        toast.success('Recipe extracted from photo!');
        setInputMethod('manual');
      }
    } catch (error) {
      toast.error('Failed to extract recipe from photo');
    } finally {
      setExtracting(false);
    }
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = value;
    setRecipe(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index) => {
    if (recipe.ingredients.length > 1) {
      setRecipe(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...recipe.instructions];
    newInstructions[index] = value;
    setRecipe(prev => ({ ...prev, instructions: newInstructions }));
  };

  const removeInstruction = (index) => {
    if (recipe.instructions.length > 1) {
      setRecipe(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!recipe.title.trim()) {
      toast.error('Please enter a recipe title');
      return;
    }

    const validIngredients = recipe.ingredients.filter(i => i.trim());
    if (validIngredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    const validInstructions = recipe.instructions.filter(i => i.trim());
    if (validInstructions.length === 0) {
      toast.error('Please add at least one instruction');
      return;
    }

    try {
      setSaving(true);
      
      const recipeData = {
        ...recipe,
        ingredients: validIngredients,
        instructions: validInstructions
      };

      let response;
      if (isEditMode) {
        response = await recipeService.updateRecipe(id, recipeData);
      } else {
        response = await recipeService.createRecipe(recipeData);
      }

      if (response.success) {
        // Upload new photos if any
        if (uploadedFiles.length > 0 && response.recipe) {
          await recipeService.uploadImages(response.recipe._id || id, uploadedFiles);
        }

        toast.success(isEditMode ? 'Recipe updated successfully!' : 'Recipe created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading recipe..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold">
                {isEditMode ? 'Edit Recipe' : 'Add New Recipe'}
              </h1>
            </div>
          </div>

          {/* Import Methods (only for new recipes) */}
          {!isEditMode && inputMethod !== 'manual' && (
            <div className="mb-8">
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setInputMethod('manual')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    inputMethod === 'manual'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <PenTool className="w-5 h-5 inline mr-2" />
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setInputMethod('url')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    inputMethod === 'url'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <LinkIcon className="w-5 h-5 inline mr-2" />
                  From URL
                </button>
                <button
                  type="button"
                  onClick={() => setInputMethod('photo')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    inputMethod === 'photo'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Camera className="w-5 h-5 inline mr-2" />
                  From Photo
                </button>
              </div>

              {inputMethod === 'url' && (
                <div className="space-y-4">
                  <input
                    type="url"
                    placeholder="Paste recipe URL here..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleExtractFromUrl}
                    disabled={extracting}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:shadow-lg transition-all"
                  >
                    {extracting ? 'Extracting...' : 'Extract Recipe'}
                  </button>
                </div>
              )}

              {inputMethod === 'photo' && (
                <div className="space-y-4">
                  <div
                    onClick={() => document.getElementById('photo-extract-input').click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer"
                  >
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload photo</p>
                    <p className="text-sm text-gray-400">Upload a photo of a recipe to extract text</p>
                  </div>
                  <input
                    id="photo-extract-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {photoPreview.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {photoPreview.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Upload ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {photoPreview.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExtractFromPhoto}
                      disabled={extracting}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:shadow-lg transition-all"
                    >
                      {extracting ? 'Processing...' : 'Extract Recipe from Photo'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recipe Form */}
          {(inputMethod === 'manual' || isEditMode) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">Recipe Title *</label>
                <input
                  type="text"
                  value={recipe.title}
                  onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter recipe title..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-semibold mb-2">Recipe Photos</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {photoPreview.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Recipe ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-orange-400 transition-colors cursor-pointer">
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Category and Region */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={recipe.category}
                    onChange={(e) => setRecipe(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Region</label>
                  <select
                    value={recipe.region}
                    onChange={(e) => setRecipe(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  >
                    <option value="">Select Region</option>
                    {regions.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time and Servings */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Prep Time (min)</label>
                  <input
                    type="number"
                    value={recipe.prepTime}
                    onChange={(e) => setRecipe(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Cook Time (min)</label>
                  <input
                    type="number"
                    value={recipe.cookTime}
                    onChange={(e) => setRecipe(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Servings</label>
                  <input
                    type="number"
                    value={recipe.servings}
                    onChange={(e) => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-semibold mb-2">Ingredients *</label>
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder="Enter ingredient..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    />
                    {recipe.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="mt-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 font-semibold"
                >
                  + Add Ingredient
                </button>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold mb-2">Instructions *</label>
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-2">
                      {index + 1}
                    </span>
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder="Enter instruction step..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none min-h-[80px]"
                    />
                    {recipe.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 h-fit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addInstruction}
                  className="mt-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 font-semibold"
                >
                  + Add Step
                </button>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2">Notes</label>
                <textarea
                  value={recipe.notes}
                  onChange={(e) => setRecipe(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any personal notes or modifications..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none h-24"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold mb-2">Rating</label>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRecipe(prev => ({ ...prev, rating: i + 1 }))}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          i < recipe.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {isEditMode ? 'Update Recipe' : 'Save Recipe'}
                    </>
                  )}
                </button>
                <Link
                  to="/dashboard"
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeForm;

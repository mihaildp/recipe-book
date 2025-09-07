import axios from 'axios';

const recipeService = {
  // Get all user's recipes
  getMyRecipes: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`/recipes/my-recipes${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get a single recipe
  getRecipe: async (id) => {
    const response = await axios.get(`/recipes/${id}`);
    return response.data;
  },

  // Create a new recipe
  createRecipe: async (recipeData) => {
    const response = await axios.post('/recipes', recipeData);
    return response.data;
  },

  // Update a recipe
  updateRecipe: async (id, recipeData) => {
    const response = await axios.put(`/recipes/${id}`, recipeData);
    return response.data;
  },

  // Delete a recipe
  deleteRecipe: async (id) => {
    const response = await axios.delete(`/recipes/${id}`);
    return response.data;
  },

  // Upload images for a recipe
  uploadImages: async (id, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await axios.post(`/recipes/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async (id) => {
    const response = await axios.post(`/recipes/${id}/favorite`);
    return response.data;
  },

  // Get favorite recipes
  getFavorites: async () => {
    const response = await axios.get('/recipes/favorites/list');
    return response.data;
  },

  // SHARING FEATURES

  // Share recipe with users
  shareRecipe: async (id, emails, permission = 'view', message = '') => {
    const response = await axios.post(`/sharing/${id}/share`, {
      emails,
      permission,
      message
    });
    return response.data;
  },

  // Update recipe visibility
  updateVisibility: async (id, visibility) => {
    const response = await axios.patch(`/sharing/${id}/visibility`, {
      visibility
    });
    return response.data;
  },

  // Remove sharing for specific users
  removeSharing: async (id, emails) => {
    const response = await axios.delete(`/sharing/${id}/share`, {
      data: { emails }
    });
    return response.data;
  },

  // Get recipes shared with me
  getSharedWithMe: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`/sharing/shared-with-me${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get public recipes (discover)
  getPublicRecipes: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`/sharing/public${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Copy a shared/public recipe
  copyRecipe: async (id) => {
    const response = await axios.post(`/sharing/${id}/copy`);
    return response.data;
  },

  // Add comment to recipe
  addComment: async (id, text, rating = null) => {
    const response = await axios.post(`/sharing/${id}/comments`, {
      text,
      rating
    });
    return response.data;
  },

  // Delete comment
  deleteComment: async (recipeId, commentId) => {
    const response = await axios.delete(`/sharing/${recipeId}/comments/${commentId}`);
    return response.data;
  },

  // Get sharing details for a recipe
  getSharingDetails: async (id) => {
    const response = await axios.get(`/sharing/${id}/sharing`);
    return response.data;
  },

  // Extract recipe from URL (mock for now)
  extractFromUrl: async (url) => {
    // In production, this would call a real extraction service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          recipe: {
            title: "Extracted Recipe",
            ingredients: ["Ingredient 1", "Ingredient 2"],
            instructions: ["Step 1", "Step 2"],
            prepTime: 15,
            cookTime: 30,
            servings: 4
          }
        });
      }, 2000);
    });
  },

  // Process image for OCR (mock for now)
  processImage: async (imageData) => {
    // In production, this would call a real OCR service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          recipe: {
            title: "Recipe from Image",
            ingredients: ["Scanned ingredient 1", "Scanned ingredient 2"],
            instructions: ["Scanned step 1", "Scanned step 2"],
            prepTime: 20,
            cookTime: 40,
            servings: 6
          }
        });
      }, 2000);
    });
  }
};

export default recipeService;

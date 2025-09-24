import axios from 'axios';

const adminService = {
  // Get admin dashboard stats
  getStats: async () => {
    const response = await axios.get('/admin/stats');
    return response.data;
  },

  // User Management
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`/admin/users${params ? `?${params}` : ''}`);
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await axios.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId, accountStatus, reason = '') => {
    const response = await axios.patch(`/admin/users/${userId}/status`, {
      accountStatus,
      reason
    });
    return response.data;
  },

  promoteUser: async (userId) => {
    const response = await axios.patch(`/admin/users/${userId}/promote`);
    return response.data;
  },

  demoteUser: async (userId) => {
    const response = await axios.patch(`/admin/users/${userId}/demote`);
    return response.data;
  },

  // Recipe Management
  getRecipes: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`/admin/recipes${params ? `?${params}` : ''}`);
    return response.data;
  },

  deleteRecipe: async (recipeId, reason = '') => {
    const response = await axios.delete(`/admin/recipes/${recipeId}`, {
      data: { reason }
    });
    return response.data;
  },

  updateRecipeVisibility: async (recipeId, visibility, reason = '') => {
    const response = await axios.patch(`/admin/recipes/${recipeId}/visibility`, {
      visibility,
      reason
    });
    return response.data;
  }
};

export default adminService;

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const userService = {
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/users/profile`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await axios.patch(`${API_URL}/users/profile`, profileData);
    return response.data;
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('picture', file);
    const response = await axios.post(`${API_URL}/users/profile/picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  uploadCoverPhoto: async (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await axios.post(`${API_URL}/users/profile/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_URL}/users/stats`);
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await axios.patch(`${API_URL}/users/preferences`, preferences);
    return response.data;
  },

  // Collections
  createCollection: async (collectionData) => {
    const response = await axios.post(`${API_URL}/users/collections`, collectionData);
    return response.data;
  },

  updateCollection: async (collectionId, updates) => {
    const response = await axios.patch(`${API_URL}/users/collections/${collectionId}`, updates);
    return response.data;
  },

  addToCollection: async (collectionId, recipeId) => {
    const response = await axios.post(`${API_URL}/users/collections/${collectionId}/recipes`, { recipeId });
    return response.data;
  },

  deleteCollection: async (collectionId) => {
    const response = await axios.delete(`${API_URL}/users/collections/${collectionId}`);
    return response.data;
  },

  // Social features
  followUser: async (userId) => {
    const response = await axios.post(`${API_URL}/users/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await axios.post(`${API_URL}/users/${userId}/unfollow`);
    return response.data;
  },

  searchUsers: async (query, limit = 10) => {
    const response = await axios.get(`${API_URL}/users/search`, {
      params: { q: query, limit }
    });
    return response.data;
  },

  getUserPublicProfile: async (username) => {
    const response = await axios.get(`${API_URL}/users/${username}`);
    return response.data;
  },

  // Account management
  deleteAccount: async (password) => {
    const response = await axios.delete(`${API_URL}/users/account`, {
      data: { password }
    });
    return response.data;
  }
};

export default userService;

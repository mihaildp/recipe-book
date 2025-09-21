import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authService = {
  signup: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    return response.data;
  },

  signin: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/signin`, credentials);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axios.post(`${API_URL}/auth/verify-email/${token}`);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
    return response.data;
  },

  completeOnboarding: async (profileData) => {
    const response = await axios.post(`${API_URL}/auth/complete-onboarding`, profileData);
    return response.data;
  },

  googleAuth: async (credential) => {
    const response = await axios.post(`${API_URL}/auth/google`, { credential });
    return response.data;
  },

  verify: async () => {
    const response = await axios.get(`${API_URL}/auth/verify`);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(`${API_URL}/auth/logout`);
    return response.data;
  }
};

export default authService;

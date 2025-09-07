import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Add token to requests if it exists
axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        const response = await axios.get('/auth/verify');
        if (response.data.success) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credential) => {
    try {
      const response = await axios.post('/auth/google', { credential });
      if (response.data.success) {
        const { token, user } = response.data;
        Cookies.set('token', token, { expires: 30 }); // 30 days
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUserPreferences = async (preferences) => {
    try {
      const response = await axios.patch('/users/preferences', preferences);
      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          preferences: response.data.preferences
        }));
        toast.success('Preferences updated');
        return { success: true };
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      toast.error('Failed to update preferences');
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUserPreferences,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

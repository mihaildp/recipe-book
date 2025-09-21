import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import authService from '../services/authService';

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
        const response = await authService.verify();
        if (response.success) {
          setUser(response.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const login = async (credential) => {
    try {
      const response = await authService.googleAuth(credential);
      if (response.success) {
        const { token, user } = response;
        Cookies.set('token', token, { expires: 30 }); // 30 days
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        return { success: true, user };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Email/Password login and signup
  const loginWithEmail = async (formData, type = 'signin') => {
    try {
      const response = type === 'signup' 
        ? await authService.signup(formData)
        : await authService.signin(formData);
      
      if (response.success) {
        const { token, user, message } = response;
        Cookies.set('token', token, { expires: 30 });
        setUser(user);
        
        if (type === 'signup') {
          toast.success(message || 'Account created successfully!');
          if (!user.isEmailVerified) {
            toast.info('Please check your email to verify your account', {
              duration: 6000
            });
          }
        } else {
          toast.success(`Welcome back, ${user.name}!`);
        }
        
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (type === 'signup' ? 'Failed to create account' : 'Login failed');
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
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

  const verifyEmail = async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      if (response.success) {
        setUser(prev => prev ? { ...prev, isEmailVerified: true } : null);
        toast.success('Email verified successfully!');
        return { success: true };
      }
    } catch (error) {
      toast.error('Email verification failed. The link may have expired.');
      return { success: false };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        toast.success('Password reset link sent to your email');
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
      return { success: false };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await authService.resetPassword(token, password);
      if (response.success) {
        toast.success('Password reset successfully! Please login with your new password.');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      return { success: false };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const response = await axios.post('/auth/resend-verification');
      if (response.data.success) {
        toast.success('Verification email sent! Please check your inbox.');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      toast.error(errorMessage);
      return { success: false };
    }
  };

  const completeOnboarding = async (profileData) => {
    try {
      const response = await authService.completeOnboarding(profileData);
      if (response.success) {
        setUser(prev => ({ ...prev, ...response.user }));
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to complete onboarding');
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithEmail,
    logout,
    updateUser,
    updateUserPreferences,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    completeOnboarding,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

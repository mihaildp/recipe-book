import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Book, ChefHat, Star, Clock, Users, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await login(credentialResponse.credential);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Book className="w-12 h-12 text-orange-500" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Recipe Book
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your personal recipe collection in the cloud. Store, organize, and access your favorite recipes from anywhere.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto mb-12">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6">Welcome Back!</h2>
              <p className="text-gray-600 text-center mb-8">
                Sign in with your Google account to access your recipe collection
              </p>
              
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="300"
                />
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Import from Photos</h3>
              <p className="text-gray-600">
                Scan recipes from photos or extract from URLs automatically
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <ChefHat className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Organize by Category</h3>
              <p className="text-gray-600">
                Sort recipes by cuisine, meal type, or create custom categories
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Rate & Review</h3>
              <p className="text-gray-600">
                Keep track of your favorite recipes with ratings and notes
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Join thousands of home cooks</h3>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">10k+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">50k+</div>
                <div className="text-gray-600">Recipes Stored</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">4.9★</div>
                <div className="text-gray-600">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

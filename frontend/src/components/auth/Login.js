import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { 
  Book, ChefHat, Mail, Lock, Eye, EyeOff, 
  ArrowRight, Check, User, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithEmail } = useAuth();
  const [isSignup, setIsSignup] = useState(true); // DEFAULT TO SIGNUP
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: ''
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignup) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (formData.username && !/^[a-z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain lowercase letters, numbers, and underscores';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = isSignup 
        ? await loginWithEmail(formData, 'signup')
        : await loginWithEmail(formData, 'signin');
      
      if (result.success) {
        toast.success(isSignup ? 'Account created successfully!' : 'Welcome back!');
        if (!result.user.isOnboardingComplete && isSignup && result.user.authMethod === 'local') {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await login(credentialResponse.credential);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      setGoogleError(true);
      toast.error('Google login is temporarily unavailable. Please use email/password signup.');
    }
  };

  const handleGoogleError = () => {
    setGoogleError(true);
    toast.error('Google login is temporarily unavailable. Please use email/password signup.');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = (pwd) => {
      let strength = 0;
      if (pwd.length >= 8) strength++;
      if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
      if (pwd.match(/[0-9]/)) strength++;
      if (pwd.match(/[^a-zA-Z0-9]/)) strength++;
      return strength;
    };
    
    const strength = getStrength(password);
    const strengthTexts = ['Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    
    if (!password) return null;
    
    return (
      <div className="mt-2">
        <div className="flex gap-1 mb-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${
                i <= strength - 1 ? strengthColors[strength - 1] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className={`text-xs ${
          strength === 1 ? 'text-red-500' :
          strength === 2 ? 'text-orange-500' :
          strength === 3 ? 'text-yellow-500' :
          'text-green-500'
        }`}>
          Password strength: {strengthTexts[strength - 1] || 'Very weak'}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Book className="w-10 h-10 text-orange-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Recipe Book
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              {isSignup ? 'Create your culinary profile' : 'Welcome back to your kitchen'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Auth Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {isSignup ? 'Create Your Account' : 'Sign In'}
                </h2>
                <p className="text-gray-600">
                  {isSignup 
                    ? 'Sign up with email to start saving recipes' 
                    : 'Access your recipe collection'}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsSignup(false)}
                  className={`flex-1 py-2 rounded-lg transition-colors font-medium ${
                    !isSignup ? 'bg-white shadow text-orange-600' : 'text-gray-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignup(true)}
                  className={`flex-1 py-2 rounded-lg transition-colors font-medium ${
                    isSignup ? 'bg-white shadow text-orange-600' : 'text-gray-600'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Notice about Google OAuth */}
              {googleError && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-800 font-medium">Google login is being configured</p>
                    <p className="text-blue-600">Please create an account with email/password for now.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username (optional)
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange({
                          ...e,
                          target: {
                            ...e.target,
                            value: e.target.value.toLowerCase()
                          }
                        })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none ${
                          errors.username ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="johndoe (optional)"
                      />
                      {errors.username && (
                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password * {isSignup && '(min. 6 characters)'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                  {isSignup && <PasswordStrengthIndicator password={formData.password} />}
                </div>

                {isSignup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {!isSignup && (
                  <div className="flex justify-between items-center">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-orange-500 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      {isSignup ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Test Account Info */}
              {isSignup && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Quick Test:</strong> Use any email like test@example.com with password Test123!
                  </p>
                </div>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="text-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    width="300"
                  />
                  {googleError && (
                    <p className="text-xs text-gray-500 mt-2">
                      (Google login temporarily unavailable)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Features Panel */}
            <div className="lg:flex flex-col justify-center">
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                <h3 className="text-xl font-bold mb-4">
                  {isSignup ? 'Why Join Recipe Book?' : 'Your recipes await'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">No Google Required</p>
                      <p className="text-sm text-gray-600">Create an account with just your email</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Unlimited recipe storage</p>
                      <p className="text-sm text-gray-600">Save all your favorite recipes in one place</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Smart organization</p>
                      <p className="text-sm text-gray-600">Categories, tags, and collections</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Share with friends</p>
                      <p className="text-sm text-gray-600">Share recipes and create meal plans together</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Access anywhere</p>
                      <p className="text-sm text-gray-600">Desktop, tablet, or mobile</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-orange-500 font-medium hover:underline"
                  >
                    {isSignup ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
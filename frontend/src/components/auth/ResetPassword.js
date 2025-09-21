import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const result = await resetPassword(token, formData.password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-green-600">Password Reset Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your password has been reset. Redirecting to login...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
        <p className="text-gray-600 mb-6">
          Enter your new password below
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={formData.password} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

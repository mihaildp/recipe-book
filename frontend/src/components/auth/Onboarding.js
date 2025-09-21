import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChefHat, ArrowRight, ArrowLeft, Check, 
  Utensils, Globe, Leaf, Info, SkipForward
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    cookingLevel: '',
    favoritesCuisines: [],
    dietaryPreferences: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      keto: false,
      paleo: false
    },
    bio: '',
    location: ''
  });

  const totalSteps = 4;

  const cuisines = [
    'Italian', 'Asian', 'Mexican', 'American', 'French', 
    'Mediterranean', 'Indian', 'Thai', 'Japanese', 'Greek',
    'Chinese', 'Korean', 'Spanish', 'Middle Eastern', 'Vietnamese'
  ];

  const handleCuisineToggle = (cuisine) => {
    setProfile(prev => ({
      ...prev,
      favoritesCuisines: prev.favoritesCuisines.includes(cuisine)
        ? prev.favoritesCuisines.filter(c => c !== cuisine)
        : [...prev.favoritesCuisines, cuisine]
    }));
  };

  const handleDietaryToggle = (pref) => {
    setProfile(prev => ({
      ...prev,
      dietaryPreferences: {
        ...prev.dietaryPreferences,
        [pref]: !prev.dietaryPreferences[pref]
      }
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await authService.completeOnboarding(profile);
      if (response.success) {
        updateUser({ ...user, isOnboardingComplete: true });
        toast.success('Welcome to Recipe Book! Your profile is all set.');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
    toast.info('You can complete your profile later from settings');
  };

  const canProceed = () => {
    switch(currentStep) {
      case 1:
        return profile.cookingLevel !== '';
      case 2:
        return profile.favoritesCuisines.length > 0;
      case 3:
        return true; // Dietary preferences are optional
      case 4:
        return true; // Bio and location are optional
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ChefHat className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">What's your cooking level?</h2>
              <p className="text-gray-600">This helps us personalize your experience</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'beginner', label: 'Beginner', desc: 'Just starting my culinary journey', emoji: '🌱' },
                { value: 'intermediate', label: 'Home Cook', desc: 'Comfortable with most recipes', emoji: '👨‍🍳' },
                { value: 'advanced', label: 'Advanced', desc: 'Love complex techniques', emoji: '⭐' },
                { value: 'professional', label: 'Professional', desc: 'Cooking is my profession', emoji: '👨‍🍳' }
              ].map(level => (
                <button
                  key={level.value}
                  onClick={() => setProfile({...profile, cookingLevel: level.value})}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    profile.cookingLevel === level.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{level.emoji}</div>
                  <p className="font-semibold mb-1">{level.label}</p>
                  <p className="text-sm text-gray-600">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Globe className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Favorite Cuisines</h2>
              <p className="text-gray-600">Select all that you enjoy (choose at least one)</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {cuisines.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineToggle(cuisine)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    profile.favoritesCuisines.includes(cuisine)
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
            
            {profile.favoritesCuisines.length > 0 && (
              <p className="text-sm text-center text-gray-600">
                Selected: {profile.favoritesCuisines.length} cuisine{profile.favoritesCuisines.length !== 1 && 's'}
              </p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Dietary Preferences</h2>
              <p className="text-gray-600">Help us filter recipes based on your needs (optional)</p>
            </div>
            
            <div className="space-y-3 max-w-md mx-auto">
              {Object.entries({
                vegetarian: { label: 'Vegetarian', emoji: '🥬' },
                vegan: { label: 'Vegan', emoji: '🌱' },
                glutenFree: { label: 'Gluten-Free', emoji: '🌾' },
                dairyFree: { label: 'Dairy-Free', emoji: '🥛' },
                keto: { label: 'Keto', emoji: '🥑' },
                paleo: { label: 'Paleo', emoji: '🥩' }
              }).map(([key, { label, emoji }]) => (
                <label
                  key={key}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    profile.dietaryPreferences[key]
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={profile.dietaryPreferences[key]}
                    onChange={() => handleDietaryToggle(key)}
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                  <span className="ml-3 flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <span className="font-medium">{label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Info className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">Optional: Add a bio and location</p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (optional)
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  rows="4"
                  placeholder="Tell other cooks about yourself..."
                  maxLength="500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profile.bio.length}/500 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <SkipForward className="w-4 h-4" />
                Skip for now
              </button>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                  canProceed()
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

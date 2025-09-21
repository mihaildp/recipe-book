import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Edit2, Camera, MapPin, Globe, ChefHat, 
  Book, Heart, Users, Settings, Mail, Calendar,
  Award, TrendingUp, Save, X, Loader, Plus,
  Folder, User, LogOut, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    cookingLevel: '',
    favoritesCuisines: [],
    dietaryPreferences: {}
  });

  useEffect(() => {
    fetchUserData();
    fetchUserStats();
    fetchCollections();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setProfileData({
          name: response.user.name || '',
          username: response.user.username || '',
          bio: response.user.bio || '',
          location: response.user.location || '',
          website: response.user.website || '',
          cookingLevel: response.user.cookingLevel || 'beginner',
          favoritesCuisines: response.user.favoritesCuisines || [],
          dietaryPreferences: response.user.dietaryPreferences || {}
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await userService.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setCollections(response.user.collections || []);
      }
    } catch (error) {
      console.error('Failed to load collections');
    }
  };

  const handleSave = async () => {
    try {
      const response = await userService.updateProfile(profileData);
      if (response.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        updateUser(response.user);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const confirmation = prompt('Type "DELETE MY ACCOUNT" to confirm:');
      if (confirmation === 'DELETE MY ACCOUNT') {
        try {
          let password = null;
          if (user?.authMethod === 'local') {
            password = prompt('Enter your password to confirm:');
          }
          
          const response = await userService.deleteAccount(password);
          if (response.success) {
            toast.success('Account deleted successfully');
            logout();
          }
        } catch (error) {
          toast.error('Failed to delete account');
        }
      }
    }
  };

  const getCookingLevelBadge = (level) => {
    const badges = {
      beginner: { color: 'bg-green-100 text-green-700', icon: '🌱', label: 'Beginner' },
      intermediate: { color: 'bg-blue-100 text-blue-700', icon: '👨‍🍳', label: 'Home Cook' },
      advanced: { color: 'bg-purple-100 text-purple-700', icon: '⭐', label: 'Advanced' },
      professional: { color: 'bg-red-100 text-red-700', icon: '👨‍🍳', label: 'Professional' }
    };
    
    const badge = badges[level] || badges.beginner;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-orange-400 to-red-400 relative">
            {user?.coverPhoto && (
              <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            )}
            <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between -mt-16">
              <div className="relative mb-4 md:mb-0">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-32 h-32 rounded-full border-4 border-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="text-2xl font-bold mb-1 px-2 py-1 border rounded"
                />
              ) : (
                <h1 className="text-2xl font-bold mb-1">{profileData.name}</h1>
              )}
              
              <p className="text-gray-600 mb-2">@{profileData.username}</p>
              
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="w-full max-w-2xl px-3 py-2 border rounded-lg mb-4"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-700 mb-4 max-w-2xl">
                  {profileData.bio || 'No bio yet'}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {user?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </div>
                )}
                {profileData.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a href={profileData.website} className="text-orange-500 hover:underline">
                      {profileData.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-2">
                {getCookingLevelBadge(profileData.cookingLevel)}
                {user?.isEmailVerified && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex overflow-x-auto">
            {['overview', 'recipes', 'collections', 'preferences', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Recipes</p>
                    <p className="text-3xl font-bold">{stats?.totalRecipes || 0}</p>
                  </div>
                  <Book className="w-10 h-10 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Favorites</p>
                    <p className="text-3xl font-bold">{stats?.totalFavorites || 0}</p>
                  </div>
                  <Heart className="w-10 h-10 text-red-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Avg Rating</p>
                    <p className="text-3xl font-bold">{stats?.averageRating || 0}★</p>
                  </div>
                  <Award className="w-10 h-10 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Followers</p>
                    <p className="text-3xl font-bold">{stats?.totalFollowers || 0}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Recent Activity
              </h3>
              {stats?.recentRecipes && stats.recentRecipes.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentRecipes.map(recipe => (
                    <Link
                      key={recipe._id}
                      to={`/recipes/${recipe._id}`}
                      className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium">{recipe.title}</p>
                        <p className="text-sm text-gray-500">{recipe.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500">
                          {'★'.repeat(recipe.rating || 0)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(recipe.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent recipes</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'collections' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Folder className="w-5 h-5 text-orange-500" />
                My Collections
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                <Plus className="w-4 h-4" />
                New Collection
              </button>
            </div>
            {collections.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {collections.map(collection => (
                  <div key={collection._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold mb-1">{collection.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {collection.recipes?.length || 0} recipes
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        collection.isPublic 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {collection.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No collections yet</p>
            )}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-500" />
                Favorite Cuisines
              </h3>
              {isEditing ? (
                <div className="space-y-2">
                  {['Italian', 'Asian', 'Mexican', 'French', 'Indian'].map(cuisine => (
                    <label key={cuisine} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.favoritesCuisines.includes(cuisine)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileData({
                              ...profileData,
                              favoritesCuisines: [...profileData.favoritesCuisines, cuisine]
                            });
                          } else {
                            setProfileData({
                              ...profileData,
                              favoritesCuisines: profileData.favoritesCuisines.filter(c => c !== cuisine)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span>{cuisine}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.favoritesCuisines.map(cuisine => (
                    <span key={cuisine} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {cuisine}
                    </span>
                  ))}
                  {profileData.favoritesCuisines.length === 0 && (
                    <p className="text-gray-500">No cuisines selected</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                Dietary Preferences
              </h3>
              <div className="space-y-2">
                {Object.entries(profileData.dietaryPreferences || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          dietaryPreferences: {
                            ...profileData.dietaryPreferences,
                            [key]: e.target.checked
                          }
                        })}
                        className="w-5 h-5"
                      />
                    ) : (
                      <span className={value ? 'text-green-500' : 'text-gray-400'}>
                        {value ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-6">Account Settings</h3>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Email Notifications</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span>New follower notifications</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Recipe shared with you</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Weekly digest</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Account Type</h4>
                <p className="text-gray-600 mb-2">
                  {user?.authMethod === 'google' ? 'Google Account' : 'Email Account'}
                </p>
                {user?.authMethod === 'local' && !user?.isEmailVerified && (
                  <button className="text-orange-500 hover:underline">
                    Verify Email
                  </button>
                )}
              </div>
              
              <div className="pt-4">
                <h4 className="font-medium mb-4 text-red-600">Danger Zone</h4>
                <div className="space-y-2">
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;

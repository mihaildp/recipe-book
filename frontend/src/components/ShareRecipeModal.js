import React, { useState, useEffect } from 'react';
import { X, Share2, Globe, Lock, Users, Mail, Copy, Eye, Edit3, Plus, Trash2 } from 'lucide-react';
import recipeService from '../services/recipeService';
import toast from 'react-hot-toast';

const ShareRecipeModal = ({ recipe, isOpen, onClose, onUpdate }) => {
  const [visibility, setVisibility] = useState(recipe?.visibility || 'private');
  const [sharedWith, setSharedWith] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPermission, setNewPermission] = useState('view');
  const [loading, setLoading] = useState(false);
  const [emailsToAdd, setEmailsToAdd] = useState([]);

  useEffect(() => {
    if (recipe && isOpen) {
      setVisibility(recipe.visibility || 'private');
      fetchSharingDetails();
    }
  }, [recipe, isOpen]);

  const fetchSharingDetails = async () => {
    if (!recipe) return;
    
    try {
      const response = await recipeService.getSharingDetails(recipe._id);
      if (response.success) {
        setSharedWith(response.sharing.sharedWith || []);
      }
    } catch (error) {
      console.error('Error fetching sharing details:', error);
    }
  };

  const handleVisibilityChange = async (newVisibility) => {
    try {
      setLoading(true);
      const response = await recipeService.updateVisibility(recipe._id, newVisibility);
      if (response.success) {
        setVisibility(newVisibility);
        toast.success(response.message);
        if (onUpdate) onUpdate();
        
        // Clear shared list if changing to private
        if (newVisibility === 'private') {
          setSharedWith([]);
          setEmailsToAdd([]);
        }
      }
    } catch (error) {
      toast.error('Failed to update visibility');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (emailsToAdd.find(e => e.email === newEmail)) {
      toast.error('Email already added');
      return;
    }
    
    setEmailsToAdd([...emailsToAdd, { email: newEmail, permission: newPermission }]);
    setNewEmail('');
  };

  const handleRemoveEmail = (email) => {
    setEmailsToAdd(emailsToAdd.filter(e => e.email !== email));
  };

  const handleShare = async () => {
    if (emailsToAdd.length === 0) {
      toast.error('Please add at least one email');
      return;
    }
    
    try {
      setLoading(true);
      const emails = emailsToAdd.map(e => e.email);
      const permission = emailsToAdd[0].permission; // Use first permission for all
      
      const response = await recipeService.shareRecipe(recipe._id, emails, permission);
      if (response.success) {
        toast.success('Recipe shared successfully!');
        setEmailsToAdd([]);
        fetchSharingDetails();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error('Failed to share recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSharing = async (email) => {
    try {
      setLoading(true);
      const response = await recipeService.removeSharing(recipe._id, [email]);
      if (response.success) {
        toast.success('Sharing removed');
        fetchSharingDetails();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error('Failed to remove sharing');
    } finally {
      setLoading(false);
    }
  };

  const getShareLink = () => {
    const url = `${window.location.origin}/recipes/${recipe._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Share2 className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold">Share Recipe</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Recipe Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-1">{recipe?.title}</h3>
            <p className="text-sm text-gray-600">
              Choose who can see and interact with this recipe
            </p>
          </div>

          {/* Visibility Options */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Visibility Settings</h4>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => handleVisibilityChange('private')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold">Private</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Only you can see this recipe
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="shared"
                  checked={visibility === 'shared'}
                  onChange={() => handleVisibilityChange('shared')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">Shared with specific people</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Only people you choose can see this recipe
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => handleVisibilityChange('public')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">Public</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Anyone using Recipe Book can discover and copy this recipe
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Share with specific people */}
          {visibility === 'shared' && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Share with specific people</h4>
              
              {/* Add new email */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter email address..."
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <select
                  value={newPermission}
                  onChange={(e) => setNewPermission(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                >
                  <option value="view">View only</option>
                  <option value="copy">Can copy</option>
                  <option value="edit">Can edit</option>
                </select>
                <button
                  onClick={handleAddEmail}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Pending emails to add */}
              {emailsToAdd.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Ready to share with:</p>
                  <div className="space-y-2">
                    {emailsToAdd.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-600" />
                          <span className="text-sm">{item.email}</span>
                          <span className="text-xs bg-orange-200 px-2 py-1 rounded">
                            {item.permission}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveEmail(item.email)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleShare}
                    disabled={loading}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Share Recipe
                  </button>
                </div>
              )}

              {/* Currently shared with */}
              {sharedWith.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Currently shared with:</p>
                  <div className="space-y-2">
                    {sharedWith.map((share, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {share.user?.picture ? (
                            <img 
                              src={share.user.picture} 
                              alt={share.user.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <Mail className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {share.user?.name || share.email}
                            </p>
                            <p className="text-xs text-gray-500">{share.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {share.permission === 'view' && <Eye className="w-3 h-3 inline mr-1" />}
                            {share.permission === 'copy' && <Copy className="w-3 h-3 inline mr-1" />}
                            {share.permission === 'edit' && <Edit3 className="w-3 h-3 inline mr-1" />}
                            {share.permission}
                          </span>
                          <button
                            onClick={() => handleRemoveSharing(share.email)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share Link */}
          {visibility !== 'private' && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Share Link</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/recipes/${recipe._id}`}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                />
                <button
                  onClick={getShareLink}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareRecipeModal;

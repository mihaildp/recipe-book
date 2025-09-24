import React, { useState, useEffect } from 'react';
import { 
  Users, Book, BarChart3, Shield, Ban, CheckCircle, XCircle, 
  Search, Filter, Eye, Trash2, Settings, AlertTriangle,
  TrendingUp, Globe, Lock, Share2, Calendar, Mail, UserCheck, UserX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    limit: 20
  });

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'recipes') {
      fetchRecipes();
    }
  }, [activeTab, filters]);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(filters);
      if (response.success) {
        setUsers(response.users);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRecipes(filters);
      if (response.success) {
        setRecipes(response.recipes);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    const action = newStatus === 'active' ? 'activate' : newStatus === 'suspended' ? 'suspend' : 'delete';
    const reason = prompt(`Reason for ${action}ing this user:`);
    
    if (reason === null) return; // User cancelled

    try {
      const response = await adminService.updateUserStatus(userId, newStatus, reason);
      if (response.success) {
        toast.success(`User ${action}d successfully`);
        fetchUsers();
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    const reason = prompt(`Reason for deleting "${recipeTitle}":`);
    
    if (reason === null) return; // User cancelled

    if (window.confirm(`Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`)) {
      try {
        const response = await adminService.deleteRecipe(recipeId, reason);
        if (response.success) {
          toast.success('Recipe deleted successfully');
          fetchRecipes();
        }
      } catch (error) {
        toast.error('Failed to delete recipe');
      }
    }
  };

  const handleRecipeVisibilityChange = async (recipeId, newVisibility, recipeTitle) => {
    const reason = prompt(`Reason for changing "${recipeTitle}" visibility to ${newVisibility}:`);
    
    if (reason === null) return; // User cancelled

    try {
      const response = await adminService.updateRecipeVisibility(recipeId, newVisibility, reason);
      if (response.success) {
        toast.success('Recipe visibility updated');
        fetchRecipes();
      }
    } catch (error) {
      toast.error('Failed to update recipe visibility');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {description && <p className="text-gray-400 text-xs mt-1">{description}</p>}
        </div>
        <Icon className={`w-10 h-10 ${color}`} />
      </div>
    </div>
  );

  const UserRow = ({ user }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.role === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.accountStatus === 'active' 
            ? 'bg-green-100 text-green-800' 
            : user.accountStatus === 'suspended'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.accountStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.recipes?.length || 0} recipes
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          {user.accountStatus === 'active' ? (
            <button
              onClick={() => handleUserStatusChange(user._id, 'suspended')}
              className="text-red-600 hover:text-red-900"
              title="Suspend User"
            >
              <Ban className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleUserStatusChange(user._id, 'active')}
              className="text-green-600 hover:text-green-900"
              title="Activate User"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  const RecipeRow = ({ recipe }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {recipe.photos && recipe.photos.length > 0 ? (
              <img
                className="h-10 w-10 rounded-lg object-cover"
                src={recipe.photos[0].url}
                alt={recipe.title}
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gray-300 flex items-center justify-center">
                <Book className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{recipe.title}</div>
            <div className="text-sm text-gray-500">{recipe.owner?.name} ({recipe.owner?.email})</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          recipe.visibility === 'public' 
            ? 'bg-green-100 text-green-800' 
            : recipe.visibility === 'shared'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {recipe.visibility}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {recipe.category || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(recipe.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <select
            onChange={(e) => handleRecipeVisibilityChange(recipe._id, e.target.value, recipe.title)}
            className="text-xs border rounded px-2 py-1"
            defaultValue={recipe.visibility}
          >
            <option value={recipe.visibility} disabled>Change Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="shared">Shared</option>
          </select>
          <button
            onClick={() => handleDeleteRecipe(recipe._id, recipe.title)}
            className="text-red-600 hover:text-red-900"
            title="Delete Recipe"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading && !stats) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'recipes', label: 'Recipes', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-3 py-2 font-medium text-sm rounded-md ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.users.total}
                icon={Users}
                color="text-blue-600"
                description={`${stats.users.active} active`}
              />
              <StatCard
                title="Total Recipes"
                value={stats.recipes.total}
                icon={Book}
                color="text-green-600"
                description={`${stats.recipes.public} public`}
              />
              <StatCard
                title="Suspended Users"
                value={stats.users.suspended}
                icon={Ban}
                color="text-red-600"
                description="Require attention"
              />
              <StatCard
                title="Private Recipes"
                value={stats.recipes.private}
                icon={Lock}
                color="text-gray-600"
                description="User-only access"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Users</div>
                    <div className="text-sm text-gray-500">View and moderate users</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('recipes')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Book className="w-8 h-8 text-green-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Recipes</div>
                    <div className="text-sm text-gray-500">Review and moderate content</div>
                  </div>
                </button>
                <button
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => toast.info('Feature coming soon')}
                >
                  <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View Analytics</div>
                    <div className="text-sm text-gray-500">Platform insights</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <UserRow key={user._id} user={user} />
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search recipes..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
                <select
                  value={filters.visibility || 'all'}
                  onChange={(e) => setFilters({...filters, visibility: e.target.value, page: 1})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="all">All Visibility</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
            </div>

            {/* Recipes Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recipes.map(recipe => (
                    <RecipeRow key={recipe._id} recipe={recipe} />
                  ))}
                </tbody>
              </table>
              
              {recipes.length === 0 && (
                <div className="text-center py-12">
                  <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recipes found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setFilters({...filters, page: filters.page - 1})}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({...filters, page: filters.page + 1})}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

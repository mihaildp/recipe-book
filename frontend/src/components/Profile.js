import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4">User Profile</h1>
        <div className="mb-6">
          <p className="text-gray-600"><strong>Name:</strong> {user?.name}</p>
          <p className="text-gray-600"><strong>Email:</strong> {user?.email}</p>
        </div>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Profile;

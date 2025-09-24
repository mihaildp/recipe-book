import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';

// Authentication Components
import Login from './components/auth/Login';
import EmailVerification from './components/auth/EmailVerification';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Onboarding from './components/auth/Onboarding';

// Main App Components
import Dashboard from './components/Dashboard';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import RecipeDetail from './components/RecipeDetail';
import SharedRecipes from './components/SharedRecipes';
import Discover from './components/Discover';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';

// UI Components
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';

// Protected Route component
const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to onboarding if not completed (for new users)
  if (requireOnboarding && user && !user.isOnboardingComplete && user.authMethod === 'local') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

// Public Route component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
          loading: {
            style: {
              background: '#6366f1',
              color: '#fff',
            },
          },
        }}
      />
      
      <Router>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/verify-email/:token" element={
            <EmailVerification />
          } />
          
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          
          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />
          
          <Route path="/onboarding" element={
            <ProtectedRoute requireOnboarding={false}>
              <Onboarding />
            </ProtectedRoute>
          } />
          
          {/* Main App Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/recipes" element={
            <ProtectedRoute>
              <RecipeList />
            </ProtectedRoute>
          } />
          
          <Route path="/recipes/new" element={
            <ProtectedRoute>
              <RecipeForm />
            </ProtectedRoute>
          } />
          
          <Route path="/recipes/:id" element={
            <ProtectedRoute>
              <RecipeDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/recipes/:id/edit" element={
            <ProtectedRoute>
              <RecipeForm />
            </ProtectedRoute>
          } />
          
          <Route path="/shared" element={
            <ProtectedRoute>
              <SharedRecipes />
            </ProtectedRoute>
          } />
          
          <Route path="/discover" element={
            <ProtectedRoute>
              <Discover />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Root and fallback routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </>
  );
}

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.warn('Google Client ID is not configured. Google OAuth will not work.');
  }
  
  return (
    <GoogleOAuthProvider clientId={googleClientId || 'placeholder'}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

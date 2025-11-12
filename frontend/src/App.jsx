import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import NormalUserDashboard from './pages/NormalUserDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import './index.css';

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;

  if (user) {
    switch (user.role) {
      case 1: return <Navigate to="/admin" replace />;
      case 2: return <Navigate to="/user" replace />;
      case 3: return <Navigate to="/store-owner" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <Navigate to="/login" replace />;
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container pb-10">
        <Routes>
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/user" element={
            <ProtectedRoute allowedRoles={[2]}>
              <NormalUserDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/store-owner" element={
            <ProtectedRoute allowedRoles={[3]}>
              <StoreOwnerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;
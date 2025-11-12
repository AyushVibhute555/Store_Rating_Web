import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const getRoleName = (role) => {
    switch (role) {
      case 1: return 'Admin';
      case 2: return 'Normal User';
      case 3: return 'Store Owner';
      default: return 'Guest';
    }
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <div className="container flex justify-between items-center">
        <Link to={user ? (user.role === 1 ? '/admin' : user.role === 2 ? '/user' : '/store-owner') : '/'} className="text-white text-2xl font-bold">
          Store Rating Platform
        </Link>
        <nav>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">
                Logged in as: {user.name} ({getRoleName(user.role)})
              </span>
              <button onClick={logout} className="btn bg-red-600 hover:bg-red-700 text-white">
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
              <Link to="/register" className="text-gray-300 hover:text-white">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
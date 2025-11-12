import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 2,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      await authApi.register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Register as Normal User</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name (20-60 chars)</label>
            <input type="text" id="name" className="input-field" value={formData.name} onChange={handleChange} required minLength="20" maxLength="60" />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input type="email" id="email" className="input-field" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password (8-16 chars, Uppercase, Special Char)</label>
            <input type="password" id="password" className="input-field" value={formData.password} onChange={handleChange} required minLength="8" maxLength="16" />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Address (Max 400 chars)</label>
            <input type="text" id="address" className="input-field" value={formData.address} onChange={handleChange} required maxLength="400" />
          </div>

          {error && <p className="error-message mb-4">{error}</p>}
          {success && <p className="text-green-600 mb-4 font-semibold">Registration successful! Redirecting to login...</p>}
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-700 font-semibold">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
import React, { useState, useEffect, useCallback } from 'react';
import { userApi, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({ averageRating: 'N/A', userRatings: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });

  const fetchDashboardData = useCallback(async () => {
    if (!user || user.role !== 3) return;
    setLoading(true);
    try {
      const res = await userApi.getStoreDashboard();
      setDashboardData(res.data);
      setStatusMessage({ message: '', type: '' });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setStatusMessage({ message: err.response?.data?.message || 'Failed to load dashboard data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setStatusMessage({ message: '', type: '' });
    try {
      const res = await authApi.updatePassword(passwordForm);
      setStatusMessage({ message: res.data.message, type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setStatusMessage({ message: err.response?.data?.message || 'Error updating password.', type: 'error' });
    }
  };

  const renderDashboardView = () => (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Your Store's Performance</h3>
        <div className="p-6 bg-blue-100 rounded-lg shadow-md max-w-sm">
          <h4 className="text-xl font-semibold text-blue-800">Average Rating</h4>
          <p className="text-4xl mt-2 text-blue-900">{dashboardData.averageRating}</p>
        </div>
      </div>

      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Users Who Rated Your Store</h3>
      {loading ? (
        <p>Loading user ratings...</p>
      ) : dashboardData.userRatings.length === 0 ? (
        <p>No ratings submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                {['Name', 'Email', 'Address', 'Submitted Rating'].map(header => (
                  <th key={header} className="py-2 px-4 border-b text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dashboardData.userRatings.map((rating) => (
                <tr key={rating.email} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{rating.name}</td>
                  <td className="py-2 px-4 border-b">{rating.email}</td>
                  <td className="py-2 px-4 border-b">{rating.address}</td>
                  <td className="py-2 px-4 border-b">{rating.rating} / 5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderPasswordUpdate = () => (
    <form onSubmit={handlePasswordUpdate} className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Update Password</h3>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">Current Password</label>
        <input type="password" id="currentPassword" className="input-field" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">New Password (8-16 chars, Uppercase, Special Char)</label>
        <input type="password" id="newPassword" className="input-field" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength="8" maxLength="16" />
      </div>
      <button type="submit" className="btn btn-primary w-full">Update Password</button>
    </form>
  );

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Store Owner Dashboard</h1>
      <div className="flex space-x-4 mb-8 border-b">
        <button className={`py-2 px-4 font-semibold ${tab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={`py-2 px-4 font-semibold ${tab === 'password' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} onClick={() => setTab('password')}>Update Password</button>
      </div>

      {statusMessage.message && (
        <div className={`p-3 rounded-lg mb-4 font-semibold ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {statusMessage.message}
        </div>
      )}

      <div className="card">
        {tab === 'dashboard' && renderDashboardView()}
        {tab === 'password' && renderPasswordUpdate()}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
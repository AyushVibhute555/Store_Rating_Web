import React, { useState, useEffect, useCallback } from 'react';
import { userApi, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

const StarRating = ({ value, onRate, isEditable }) => {
  return (
    <div className="rating-stars inline-flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? 'text-yellow-400' : 'text-gray-300'} ${isEditable ? 'hover:text-yellow-500' : ''}`}
          onClick={() => isEditable && onRate(star)}
        >
          {star <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

const NormalUserDashboard = () => {
  const { updateUserInfo } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'name', order: 'ASC' });
  const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
  const [tab, setTab] = useState('stores');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchStores = useCallback(async () => {
    try {
      const params = {
        search,
        sortBy: sortBy.key,
        sortOrder: sortBy.order,
        page,
        limit: pageSize,
      };
      const res = await userApi.getStores(params);
      setStores(res.data.stores);
      setTotalPages(Math.ceil(res.data.total / pageSize));
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      setStatusMessage({ message: 'Failed to load stores.', type: 'error' });
    }
  }, [search, sortBy, page]);

  useEffect(() => {
    if (tab === 'stores') {
      fetchStores();
    }
  }, [tab, fetchStores]);

  const handleRatingSubmit = async (storeId, rating) => {
    setStatusMessage({ message: '', type: '' });
    try {
      const res = await userApi.submitRating({ storeId, rating });
      setStatusMessage({ message: res.data.message, type: 'success' });
      fetchStores();
    } catch (err) {
      setStatusMessage({ message: err.response?.data?.message || 'Failed to submit rating.', type: 'error' });
    }
  };

  const handleSort = (key) => {
    setSortBy((prev) => ({
      key,
      order: prev.key === key && prev.order === 'ASC' ? 'DESC' : 'ASC',
    }));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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

  const renderSortIndicator = (key) => {
    if (sortBy.key !== key) return null;
    return sortBy.order === 'ASC' ? ' ▲' : ' ▼';
  };

  const renderStoresView = () => (
    <>
      <div className="mb-4 flex justify-between items-center">
        <input className="input-field w-1/3" type="text" placeholder="Search by Name or Address" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              {['Store Name', 'Address', 'Overall Rating', 'Your Rating', 'Action'].map(header => (
                <th key={header} className="py-2 px-4 border-b cursor-pointer text-left" onClick={() => handleSort(header.toLowerCase().includes('name') ? 'name' : header.toLowerCase().includes('address') ? 'address' : 'name')}>
                  {header.replace('Store Name', 'Name').replace('Overall Rating', 'Rating')} {renderSortIndicator(header.toLowerCase().includes('name') ? 'name' : header.toLowerCase().includes('address') ? 'address' : 'name')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{store.name}</td>
                <td className="py-2 px-4 border-b">{store.address}</td>
                <td className="py-2 px-4 border-b">
                  <StarRating value={Math.round(store.overall_rating || 0)} isEditable={false} />
                  <span className="text-sm text-gray-500 ml-2">({store.overall_rating ? parseFloat(store.overall_rating).toFixed(2) : 'N/A'})</span>
                </td>
                <td className="py-2 px-4 border-b">
                  <StarRating value={store.user_submitted_rating || 0} isEditable={false} />
                </td>
                <td className="py-2 px-4 border-b">
                  <StarRating value={store.user_submitted_rating || 0} isEditable={true} onRate={(rating) => handleRatingSubmit(store.id, rating)} />
                  <span className="text-sm text-gray-500 ml-2"> (Click to {store.user_submitted_rating ? 'Modify' : 'Submit'})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4 space-x-2">
        <button className="btn bg-gray-200" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
        <button className="btn bg-gray-200" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
      </div>
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
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Normal User Dashboard</h1>
      <div className="flex space-x-4 mb-8 border-b">
        <button className={`py-2 px-4 font-semibold ${tab === 'stores' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} onClick={() => setTab('stores')}>View Stores & Rate</button>
        <button className={`py-2 px-4 font-semibold ${tab === 'password' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} onClick={() => setTab('password')}>Update Password</button>
      </div>

      {statusMessage.message && (
        <div className={`p-3 rounded-lg mb-4 font-semibold ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {statusMessage.message}
        </div>
      )}

      <div className="card">
        {tab === 'stores' && renderStoresView()}
        {tab === 'password' && renderPasswordUpdate()}
      </div>
    </div>
  );
};

export default NormalUserDashboard;
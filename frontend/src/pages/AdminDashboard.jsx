import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { updateUserInfo } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [tab, setTab] = useState('stats');
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', role: 2 });
  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'name', order: 'ASC' });
  const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 10;

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = {
        filter,
        sortBy: sortBy.key,
        sortOrder: sortBy.order,
        page,
        limit: pageSize,
      };
      const res = await adminApi.getUsers(params);
      setUsers(res.data.users);
      setTotalPages(Math.ceil(res.data.total / pageSize));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [filter, sortBy, page]);

  const fetchStores = useCallback(async () => {
    try {
      const params = {
        filter,
        sortBy: sortBy.key,
        sortOrder: sortBy.order,
        page,
        limit: pageSize,
      };
      const res = await adminApi.getStores(params);
      setStores(res.data.stores);
      setTotalPages(Math.ceil(res.data.total / pageSize));
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  }, [filter, sortBy, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (tab === 'users') {
      fetchUsers();
    } else if (tab === 'stores') {
      fetchStores();
    }
  }, [tab, fetchUsers, fetchStores]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setFilter('');
    setPage(1);
    setSortBy({ key: 'name', order: 'ASC' });
    setTotalPages(1);
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

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ message: '', type: '' });
    try {
      const res = await adminApi.addUser(userForm);
      setStatusMessage({ message: res.data.message, type: 'success' });
      setUserForm({ name: '', email: '', password: '', address: '', role: 2 });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setStatusMessage({ message: err.response?.data?.message || 'Error adding user.', type: 'error' });
    }
  };

  const handleStoreFormSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ message: '', type: '' });
    try {
      const res = await adminApi.addStore(storeForm);
      setStatusMessage({ message: res.data.message, type: 'success' });
      setStoreForm({ name: '', email: '', address: '' });
      fetchStores();
      fetchStats();
    } catch (err) {
      setStatusMessage({ message: err.response?.data?.message || 'Error adding store.', type: 'error' });
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

  const renderStats = () => (
    <div className="grid grid-cols-3 gap-6">
      <div className="p-6 bg-blue-100 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-blue-800">Total Users</h3>
        <p className="text-3xl mt-2 text-blue-900">{stats.totalUsers || 0}</p>
      </div>
      <div className="p-6 bg-green-100 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-green-800">Total Stores</h3>
        <p className="text-3xl mt-2 text-green-900">{stats.totalStores || 0}</p>
      </div>
      <div className="p-6 bg-purple-100 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-purple-800">Total Ratings</h3>
        <p className="text-3xl mt-2 text-purple-900">{stats.totalRatings || 0}</p>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Add New User</h3>
        <form onSubmit={handleUserFormSubmit} className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
          <input className="input-field" type="text" placeholder="Name (20-60 chars)" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required minLength="20" maxLength="60" />
          <input className="input-field" type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Password (8-16 chars, Uppercase, Special)" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required minLength="8" maxLength="16" />
          <input className="input-field" type="text" placeholder="Address (Max 400 chars)" value={userForm.address} onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} required maxLength="400" />
          <select className="input-field" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: parseInt(e.target.value) })} required>
            <option value={1}>System Administrator</option>
            <option value={2}>Normal User</option>
            <option value={3}>Store Owner</option>
          </select>
          <button type="submit" className="btn btn-primary col-span-2">Add User</button>
        </form>
      </div>

      <h3 className="text-2xl font-semibold mb-4 text-gray-800">All Users</h3>
      <div className="mb-4 flex justify-between items-center">
        <input className="input-field w-1/3" type="text" placeholder="Filter by Name, Email, Address, Role (1,2,3)" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} />
        <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              {['Name', 'Email', 'Address', 'Role', 'Store Name', 'Store Rating'].map(header => (
                <th key={header} className="py-2 px-4 border-b cursor-pointer text-left" onClick={() => handleSort(header.toLowerCase().replace(' ', '_'))}>
                  {header} {renderSortIndicator(header.toLowerCase().replace(' ', '_'))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.address}</td>
                <td className="py-2 px-4 border-b">
                  {user.role === 1 ? 'Admin' : user.role === 2 ? 'Normal' : 'Owner'}
                </td>
                <td className="py-2 px-4 border-b">{user.store_name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  {user.role === 3 ? (user.store_rating ? parseFloat(user.store_rating).toFixed(2) : 'N/A') : 'N/A'}
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

  const renderStoreManagement = () => (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Add New Store</h3>
        <form onSubmit={handleStoreFormSubmit} className="grid grid-cols-3 gap-4 bg-gray-50 p-6 rounded-lg">
          <input className="input-field" type="text" placeholder="Store Name" value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Store Email" value={storeForm.email} onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })} required />
          <input className="input-field" type="text" placeholder="Address (Max 400 chars)" value={storeForm.address} onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })} required maxLength="400" />
          <button type="submit" className="btn btn-primary col-span-3">Add Store</button>
        </form>
      </div>

      <h3 className="text-2xl font-semibold mb-4 text-gray-800">All Stores</h3>
      <div className="mb-4 flex justify-between items-center">
        <input className="input-field w-1/3" type="text" placeholder="Filter by Name, Email, Address" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} />
        <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              {['Name', 'Email', 'Address', 'Rating'].map(header => (
                <th key={header} className="py-2 px-4 border-b cursor-pointer text-left" onClick={() => handleSort(header.toLowerCase().replace(' ', '_'))}>
                  {header} {renderSortIndicator(header.toLowerCase().replace(' ', '_'))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{store.name}</td>
                <td className="py-2 px-4 border-b">{store.email}</td>
                <td className="py-2 px-4 border-b">{store.address}</td>
                <td className="py-2 px-4 border-b">{store.overall_rating ? parseFloat(store.overall_rating).toFixed(2) : 'N/A'}</td>
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
      <h1 className="text-4xl font-bold mb-6 text-gray-900">System Administrator Dashboard</h1>
      <div className="flex space-x-4 mb-8 border-b">
        <button className={`py-2 px-4 font-semibold ${tab === 'stats' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabChange('stats')}>Overview</button>
        <button className={`py-2 px-4 font-semibold ${tab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabChange('users')}>User Management</button>
        <button className={`py-2 px-4 font-semibold ${tab === 'stores' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabChange('stores')}>Store Management</button>
        <button className={`py-2 px-4 font-semibold ${tab === 'password' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabChange('password')}>Update Password</button>
      </div>

      {statusMessage.message && (
        <div className={`p-3 rounded-lg mb-4 font-semibold ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {statusMessage.message}
        </div>
      )}

      <div className="card">
        {tab === 'stats' && renderStats()}
        {tab === 'users' && renderUserManagement()}
        {tab === 'stores' && renderStoreManagement()}
        {tab === 'password' && renderPasswordUpdate()}
      </div>
    </div>
  );
};

export default AdminDashboard;
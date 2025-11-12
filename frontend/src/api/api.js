import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  updatePassword: (data) => api.put('/auth/password', data),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  addUser: (data) => api.post('/admin/users', data),
  addStore: (data) => api.post('/admin/stores', data),
  getUsers: (params) => api.get('/admin/users', { params }),
  getStores: (params) => api.get('/admin/stores', { params }),
};

export const userApi = {
  getStores: (params) => api.get('/user/stores', { params }),
  submitRating: (data) => api.post('/user/ratings', data),
  getStoreDashboard: () => api.get('/user/dashboard'),
};

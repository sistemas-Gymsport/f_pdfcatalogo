import { api } from './apiClient.js';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials, { auth: false }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/password', data),
};

export const userService = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  setStatus: (id, status) => api.patch(`/users/${id}`, { status }),
};

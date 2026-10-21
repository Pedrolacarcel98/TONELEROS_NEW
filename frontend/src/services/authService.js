import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  fetchMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  },

  setToken: (token) => {
    localStorage.setItem('access_token', token);
  },

  setUser: (user) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch {
      // Ignore serialization issues
    }
  },

  getToken: () => {
    return localStorage.getItem('access_token');
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem('access_token'));
  },
};

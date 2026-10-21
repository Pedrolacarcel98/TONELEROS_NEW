import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10s default timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de Petición: Añadir JWT Token si existe
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta: Manejo Global de Errores y Expiración de Sesión (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar credenciales almacenadas
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

      // Notificar a la aplicación para sincronizar AuthContext
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));

      // Si no estamos en la raíz / login, redirigir
      if (window.location.hash && window.location.hash !== '#/' && !window.location.hash.startsWith('#/login')) {
        window.location.hash = '#/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

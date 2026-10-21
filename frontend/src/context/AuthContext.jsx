import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Derivar isAuthenticated para evitar desincronización de estados
  const isAuthenticated = Boolean(user);

  // Validar sesión contra el backend al iniciar la aplicación
  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const token = authService.getToken();
      if (!token) {
        if (isMounted) setIsInitializing(false);
        return;
      }

      try {
        const currentUser = await authService.fetchMe();
        if (isMounted) {
          authService.setUser(currentUser);
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          authService.logout();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    bootstrapAuth();

    // Escuchar evento de 401 desde el interceptor de apiClient
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      authService.setToken(response.access_token);
      authService.setUser(response.user);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      isInitializing,
      login,
      logout,
    }),
    [user, isAuthenticated, loading, isInitializing, login, logout]
  );

  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-color, #0f172a)',
        color: 'var(--text-secondary, #94a3b8)',
        fontSize: '1rem',
        fontWeight: '500'
      }}>
        Cargando sesión...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

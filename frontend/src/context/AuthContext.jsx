import { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { authApi } from '../services/authApi';
import { setAccessToken, clearAccessToken } from '../services/apiClient';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  // Track whether this is the first resolution (used to show welcome toast only on OAuth return)
  const isFirstLoad = useCallback(() => !isAuthenticated, [isAuthenticated]);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    const wasAuthenticated = isAuthenticated;
    try {
      try {
        const refreshData = await authApi.refreshAccessToken();
        if (refreshData?.accessToken) {
          setAccessToken(refreshData.accessToken);
        }
      } catch {
        // Normal when no cookie exists — continue to getCurrentUser
      }

      const userData = await authApi.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);

      // Show welcome toast only on first login (coming from OAuth callback)
      if (!wasAuthenticated && userData?.username) {
        toast.success(`Welcome back, ${userData.username}.`, { id: 'login-success' });
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();

      if (error.response?.status !== 401) {
        setAuthError('Authentication service unavailable. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    if (!API_URL) {
      toast.error('API URL is not configured. Add VITE_API_URL to frontend/.env and restart Vite.');
      return;
    }
    window.location.assign(`${API_URL.replace(/\/$/, '')}/auth/github`);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout may fail if session already expired — continue clearing local state
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();
      toast('You have been signed out.', { id: 'logout' });
      window.location.href = '/';
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    authError,
    refreshSession,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

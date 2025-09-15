'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import authConfig from '../configs/auth'; // Assuming this path is correct

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRefreshing = useRef(false); // To prevent multiple refresh token requests

  // Memoize authConfig to prevent unnecessary re-renders of components consuming it
  const memoizedAuthConfig = useMemo(() => authConfig, []);

  // Axios instance for consistent headers and interceptors
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: memoizedAuthConfig.baseURL, // If you have a base URL for your API
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add access token
    instance.interceptors.request.use(
      (config) => {
        const token = window.localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling 401 Unauthorized errors
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and it's not a retry request and not already refreshing
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          !isRefreshing.current
        ) {
          originalRequest._retry = true; // Mark as retried
          isRefreshing.current = true;

          console.warn(
            '401 Unauthorized: Access token expired or invalid. Logging out.'
          );

          // Clear all authentication and application state
          clearAuthData();
          setUser(null);
          router.push('/login');

          isRefreshing.current = false;
          return Promise.reject(error); // Reject the original request
        }
        return Promise.reject(error);
      }
    );
    return instance;
  }, [router, memoizedAuthConfig]);

  // Helper function to clear local storage and reset user state
  const clearAuthData = useCallback(() => {
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('selectedSociete'); // Assuming these are application-specific
    window.localStorage.removeItem('selectedProjet'); // Assuming these are application-specific
    // Clear any other sensitive data from localStorage or sessionStorage
  }, []);

  // Initial authentication check on component mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true); // Ensure loading is true before starting auth init
      const token = window.localStorage.getItem('accessToken');
      if (token) {
        try {
          // Validate token by fetching user data from dashboard endpoint
          const response = await axiosInstance.get(
            memoizedAuthConfig.dashboardEndpoint
          );
          setUser(response.data.user);
          window.localStorage.setItem(
            'authUser',
            JSON.stringify(response.data.user)
          );
        } catch (error) {
          console.error('Failed to initialize authentication:', error);
          clearAuthData();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [axiosInstance, memoizedAuthConfig, clearAuthData]);

  // Login function
  const login = useCallback(
    async (params) => {
      setLoading(true);
      try {
        const response = await axiosInstance.post(
          memoizedAuthConfig.loginEndpoint,
          params
        );
        const token = response.data.access_token;

        window.localStorage.setItem('accessToken', token);

        // Fetch user data after successful login
        const userResponse = await axiosInstance.get(
          memoizedAuthConfig.dashboardEndpoint
        );
        setUser(userResponse.data.user);
        router.push('/tableau-de-bord'); // Redirect to dashboard after login
        return true;
      } catch (error) {
        console.error('Login error:', error);
        throw error; // Re-throw to allow component to handle specific login errors
      } finally {
        setLoading(false);
      }
    },
    [axiosInstance, router, memoizedAuthConfig]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      // It's good practice to invalidate the token on the server
      await axiosInstance.post(memoizedAuthConfig.LogoutEndpoint, null);
    } catch (error) {
      console.error('Logout error (server-side):', error);
      // Even if server logout fails, clear client-side data
    } finally {
      clearAuthData();
      setUser(null);
      router.push('/login');
    }
  }, [axiosInstance, router, memoizedAuthConfig, clearAuthData]);

  // Protected logout for LinkedIn flows (or similar external authentication)
  const protectedLogout = useCallback(() => {
    const isLinkedInFlow =
      localStorage.getItem('linkedin_admin_flow') === 'true' ||
      localStorage.getItem('linkedin_state') !== null ||
      window.location.pathname.includes('linkedin-callback');

    if (isLinkedInFlow) {
      console.log('Preventing logout during LinkedIn auth flow');
      return;
    }

    logout();
  }, [logout]);

  // Handle potential token loss during external redirects (e.g., OAuth flows)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const isLinkedInFlow =
        localStorage.getItem('linkedin_admin_flow') === 'true';
      if (isLinkedInFlow) {
        // Backup token before potential loss on redirect
        const token = localStorage.getItem('accessToken');
        if (token) {
          sessionStorage.setItem('backup_token', token);
        }
      }
    };

    const handleLoad = () => {
      // Restore token if it was backed up and current one is missing
      const backupToken = sessionStorage.getItem('backup_token');
      const currentToken = localStorage.getItem('accessToken');
      if (backupToken && !currentToken) {
        localStorage.setItem('accessToken', backupToken);
        sessionStorage.removeItem('backup_token');
        // Re-initialize auth if token was restored
        // This might trigger an extra dashboardEndpoint call, consider optimizing if needed
        const initAuthAfterRestore = async () => {
          setLoading(true);
          try {
            const response = await axiosInstance.get(
              memoizedAuthConfig.dashboardEndpoint
            );
            setUser(response.data.user);
          } catch (error) {
            console.error(
              'Failed to re-initialize auth after token restore:',
              error
            );
            clearAuthData();
          } finally {
            setLoading(false);
          }
        };
        initAuthAfterRestore();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, [axiosInstance, memoizedAuthConfig, clearAuthData]);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout: protectedLogout,
      isAuthenticated: !!user,
      loading,
    }),
    [user, login, protectedLogout, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import authConfig from "../configs/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRefreshing = useRef(false);

  // Setup axios interceptors for handling token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401 && !isRefreshing.current) {
          isRefreshing.current = true;
          
          // Clear all authentication and application state
          window.localStorage.removeItem('accessToken');
          window.localStorage.removeItem('selectedSociete');
          window.localStorage.removeItem('selectedProjet');
          setUser(null);
          
          router.push('/login');
          
          isRefreshing.current = false;
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]);

  useEffect(() => {
    const initAuth = async () => {
      const token = window.localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await axios.get(authConfig.dashboardEndpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
        } catch (error) {
          window.localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (params) => {
    setLoading(true);
    try {
      const response = await axios.post(authConfig.loginEndpoint, params);
      const token = response.data.access_token;
      
      window.localStorage.setItem('accessToken', token);
      
      const userResponse = await axios.get(authConfig.dashboardEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(userResponse.data.user);
      router.push('/');
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const token = window.localStorage.getItem('accessToken');
    try {
      await axios.post(authConfig.LogoutEndpoint, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } finally {
      // Clear all authentication and application state
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('selectedSociete');
      window.localStorage.removeItem('selectedProjet');
      setUser(null);
      router.push("/login");
    }
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
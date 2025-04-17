"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import authConfig from "../configs/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      window.localStorage.removeItem('accessToken');
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
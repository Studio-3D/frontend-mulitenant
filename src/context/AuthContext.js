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
    const token = window.localStorage.getItem('accessToken');
    if (token) {
      axios.get(authConfig.dashboardEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data.user);
        setLoading(false);
      })
      .catch(() => {
        window.localStorage.removeItem('accessToken');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
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
      setLoading(false);
      router.push('/');
      return true;
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      throw error;
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
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
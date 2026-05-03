import { createContext, useContext, useEffect, useState } from "react";

import { AUTH_UNAUTHORIZED_EVENT } from "../api/client";
import { fetchMe, login as loginRequest, signup as signupRequest } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("auth_token");
      setUser(null);
      setIsAuthLoading(false);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsAuthLoading(false);
      return;
    }

    fetchMe()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("auth_token");
        setUser(null);
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  const handleAuthSuccess = (response) => {
    localStorage.setItem("auth_token", response.access_token);
    setUser(response.user);
  };

  const login = async (email, password) => {
    const response = await loginRequest(email, password);
    handleAuthSuccess(response);
    return response.user;
  };

  const signup = async (payload) => {
    const response = await signupRequest(payload);
    handleAuthSuccess(response);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAuthLoading,
    login,
    signup,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

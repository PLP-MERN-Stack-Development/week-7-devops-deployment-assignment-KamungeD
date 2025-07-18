import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem('authTokens');
    return savedTokens ? JSON.parse(savedTokens) : null;
  });

  // Configure axios defaults
  useEffect(() => {
    if (tokens?.accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [tokens]);

  // Auto-refresh token setup
  useEffect(() => {
    let refreshTimer;
    
    if (tokens?.accessToken) {
      // Refresh token 5 minutes before expiry
      const tokenExpiry = JSON.parse(atob(tokens.accessToken.split('.')[1])).exp * 1000;
      const refreshTime = tokenExpiry - Date.now() - 5 * 60 * 1000; // 5 minutes before expiry
      
      if (refreshTime > 0) {
        refreshTimer = setTimeout(() => {
          refreshTokens();
        }, refreshTime);
      }
    }
    
    return () => clearTimeout(refreshTimer);
  }, [tokens]);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (tokens?.accessToken) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          if (error.response?.status === 401 && tokens?.refreshToken) {
            await refreshTokens();
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const saveTokens = (newTokens) => {
    setTokens(newTokens);
    localStorage.setItem('authTokens', JSON.stringify(newTokens));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;
  };

  const refreshTokens = async () => {
    try {
      const response = await axios.post('/api/auth/refresh', {
        refreshToken: tokens?.refreshToken
      });
      
      const newTokens = {
        accessToken: response.data.accessToken,
        refreshToken: tokens.refreshToken
      };
      
      saveTokens(newTokens);
      return newTokens;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { user, tokens } = response.data;
      
      setUser(user);
      saveTokens(tokens);
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message, errors: error.response?.data?.errors };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { user, tokens } = response.data;
      
      setUser(user);
      saveTokens(tokens);
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message, errors: error.response?.data?.errors };
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('authTokens');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, message, errors: error.response?.data?.errors };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await axios.post('/api/auth/change-password', passwordData);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      return { success: false, message, errors: error.response?.data?.errors };
    }
  };

  const value = {
    user,
    tokens,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshTokens
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
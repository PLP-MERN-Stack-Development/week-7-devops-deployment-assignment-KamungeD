import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [tokens, setTokens] = useState({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  });
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Save tokens to localStorage
  const saveTokens = (newTokens) => {
    setTokens(newTokens);
    localStorage.setItem('accessToken', newTokens.accessToken);
    localStorage.setItem('refreshToken', newTokens.refreshToken);
  };

  // Clear tokens from localStorage
  const clearTokens = () => {
    setTokens({ accessToken: null, refreshToken: null });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Make authenticated API requests
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const requestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Add auth header if we have a token
    if (tokens.accessToken) {
      requestOptions.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
      
      // If token expired, try to refresh
      if (response.status === 401 && tokens.refreshToken) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          requestOptions.headers.Authorization = `Bearer ${newAccessToken}`;
          return fetch(`${API_BASE_URL}${url}`, requestOptions);
        }
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        const newTokens = {
          accessToken: data.accessToken,
          refreshToken: tokens.refreshToken
        };
        saveTokens(newTokens);
        return data.accessToken;
      } else {
        // Refresh failed, logout user
        logout();
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        saveTokens(data.tokens);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        saveTokens(data.tokens);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      if (tokens.accessToken) {
        await makeAuthenticatedRequest('/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      clearTokens();
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await makeAuthenticatedRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await makeAuthenticatedRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Password change failed:', error);
      return { success: false, error: 'Password change failed. Please try again.' };
    }
  };

  // Get current user from server
  const getCurrentUser = async () => {
    try {
      const response = await makeAuthenticatedRequest('/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data.user;
      } else {
        logout();
        return null;
      }
    } catch (error) {
      console.error('Get current user failed:', error);
      logout();
      return null;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(user && tokens.accessToken);
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      if (tokens.accessToken) {
        await getCurrentUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    getCurrentUser,
    makeAuthenticatedRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
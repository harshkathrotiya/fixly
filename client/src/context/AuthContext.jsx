import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true);

  // Add this useEffect for debugging token
  useEffect(() => {
    if (token) {
      console.log('Current auth token:', token);
    }
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUserData = localStorage.getItem('userData');

      if (storedToken) {
        try {
          // First set user from localStorage if available for immediate UI update
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            setUser(userData);
          }

          // Then fetch fresh data from the server
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });

          const freshUserData = response.data.data || response.data;

          // Check if user is active
          if (!freshUserData.isActive) {
            console.log('User account is deactivated');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setUser(null);
            setToken(null);
            // Don't throw an error, just silently log out
          } else {
            setUser(freshUserData);
            setToken(storedToken);

            // Update localStorage with fresh data
            localStorage.setItem('userData', JSON.stringify(freshUserData));
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, authToken) => {
    console.log('Setting user in context:', userData);
    // Ensure we're setting the correct user data structure
    const userToSet = userData.data || userData;

    // Check if user is active
    if (!userToSet.isActive) {
      console.log('Cannot login: User account is deactivated');
      // Clear any stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return false;
    }

    setUser(userToSet);
    setToken(authToken);

    // Store both the token and user data in localStorage
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userData', JSON.stringify(userToSet));

    // Dispatch auth change event here too for redundancy
    window.dispatchEvent(new Event('auth-change'));

    return true;
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');

    // Dispatch auth change event for components listening to it
    window.dispatchEvent(new Event('auth-change'));

    // Redirect to login page
    window.location.href = '/login';
  };

  const isAuthenticated = () => {
    return !!token;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Remove the standalone useEffect that was here
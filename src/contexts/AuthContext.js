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
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('handwerker_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('handwerker_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with real authentication
      if (email && password) {
        const userData = {
          id: '1',
          email: email,
          name: 'Max Mustermann',
          role: 'handwerker',
          company: 'Musterfirma GmbH'
        };
        
        setUser(userData);
        localStorage.setItem('handwerker_user', JSON.stringify(userData));
        return { success: true };
      } else {
        throw new Error('Ungültige Anmeldedaten');
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('handwerker_user');
  };

  const updateProfile = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('handwerker_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

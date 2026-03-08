import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);

  const login = async (token) => {
    try {
      await AsyncStorage.setItem('auth_token', token);
      setAuthToken(token);
      return token;
    } catch (error) {
      console.error('Error saving token to storage', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      setAuthToken(null);
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

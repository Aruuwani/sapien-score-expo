import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  authToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error('Error checking auth state', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (token: string) => {
    try {
      localStorage.setItem('auth_token', token);
      setAuthToken(token);
    } catch (error) {
      console.error('Error saving token to storage', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.clear();
      setAuthToken(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        isAuthenticated: !!authToken,
        loading,
        login,
        logout
      }}
    >
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


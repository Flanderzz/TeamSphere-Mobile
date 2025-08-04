import React, { createContext, useContext, useState, useEffect } from 'react';
import { authStorage } from '../utils/authStorage';

type AuthContextType = {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  signIn: (token: string, user: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode | ((value: AuthContextType) => React.ReactNode) }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await authStorage.getToken();
      const storedUser = await authStorage.getUser();
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(newToken: string, userData: any) {
    try {
      await authStorage.setToken(newToken);
      await authStorage.setUser(userData);
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await authStorage.clearAll();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  async function updateUser(userData: any) {
    try {
      await authStorage.setUser(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  const value = {
    token,
    user,
    isLoading,
    signIn,
    signOut,
    updateUser,
  };  return <AuthContext.Provider value={value}>
    {typeof children === 'function' ? children(value) : children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
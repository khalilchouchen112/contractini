"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          // Only redirect if we're on a protected route (not login/signup pages)
          const currentPath = window.location.pathname;
          const isOnAuthPage = currentPath === '/' || currentPath === '/signup';
          
          if (!isOnAuthPage) {
            window.location.href = '/';
          }
          
          // Clear user data only on auth failure
          setUser(null);
        }
        throw new Error('Authentication failed');
      }

      const { data } = await res.json();
      setUser(data);
      setError(null); // Clear any previous errors on successful auth
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const refreshAuth = async () => {
    setLoading(true);
    await checkAuth();
  };

  const refreshToken = async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Token refresh failed');
      }

      const { data } = await res.json();
      setUser(data);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token refresh failed');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, updateUser, refreshAuth, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

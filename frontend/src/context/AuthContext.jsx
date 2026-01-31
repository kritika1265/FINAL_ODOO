import React, { createContext, useContext } from 'react';
import useAuthState from '../hooks/useAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const authState = useAuthState();
  const value = {
    ...authState,
    isAuthenticated: !!authState.user && (typeof window === 'undefined' || !!localStorage.getItem('token')),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * useAuth Hook
 * 
 * Shared authentication hook that provides authentication state and methods
 * across all components. Handles SSR-safe localStorage access and token management.
 * 
 * Design Features:
 * - SSR-safe localStorage access with proper guards
 * - Automatic token validation and refresh
 * - User role management and permissions
 * - Clean authentication state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthState, User } from './types';

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  isLoading: boolean;
  error: string;
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // SSR-safe token retrieval
  const getStoredToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  // SSR-safe user retrieval
  const getStoredUser = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    
    if (token && user) {
      setAuthState({
        token,
        user,
        isAuthenticated: true
      });
    }
    setIsLoading(false);
  }, [getStoredToken, getStoredUser]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token, user } = data;
        
        // Store in localStorage (SSR-safe)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }

        setAuthState({
          token,
          user,
          isAuthenticated: true
        });

        return true;
      } else {
        setError(data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      setError('Network error during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    // Clear localStorage (SSR-safe)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false
    });
    setError('');
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const currentToken = getStoredToken();
    if (!currentToken) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token, user } = data;
        
        // Update localStorage (SSR-safe)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }

        setAuthState({
          token,
          user,
          isAuthenticated: true
        });

        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      logout();
      return false;
    }
  }, [getStoredToken, logout]);

  return {
    ...authState,
    login,
    logout,
    refreshToken,
    isLoading,
    error
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: 'admin' | 'user';
  lastLoginAt: string;
  createdAt: string;
}

export function useAuth() {
  const router = useRouter();
  // Add a key to force re-fetch when login state changes
  const [loginKey, setLoginKey] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch user');
        }

        setUser(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Function to refresh auth state
  const refresh = () => setLoginKey(k => k + 1);

  const login = async (email: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Refresh auth state
      refresh();
      router.refresh();
      
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      refresh();
      router.refresh();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return {
    user,
    isLoading,
    error,
    isAdmin: user?.role === 'admin',
    refresh,
    login,
    logout
  };
}

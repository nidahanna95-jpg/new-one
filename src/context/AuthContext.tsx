/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthSession, UserRole } from '../types/index.ts';

interface AuthContextType {
  session: AuthSession | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (role: UserRole, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  inactivityWarning: boolean;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  inactivityWarning: false,
  resetInactivityTimer: () => {},
});

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes (1 min warning)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inactivityWarning, setInactivityWarning] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const timerCheckRef = useRef<any>(null);

  // Restore session from localStorage if valid
  useEffect(() => {
    const saved = localStorage.getItem('abc_univ_session');
    if (saved) {
      try {
        const parsed: AuthSession = JSON.parse(saved);
        if (parsed.expiresAt > Date.now()) {
          setSession(parsed);
          // Verify with backend
          fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${parsed.token}` },
          })
            .then((res) => {
              if (!res.ok) {
                localStorage.removeItem('abc_univ_session');
                setSession(null);
              }
            })
            .catch(() => {});
        } else {
          localStorage.removeItem('abc_univ_session');
        }
      } catch (e) {
        localStorage.removeItem('abc_univ_session');
      }
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    if (session?.token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` },
        });
      } catch (e) {
        // Ignore network errors on logout
      }
    }
    localStorage.removeItem('abc_univ_session');
    setSession(null);
    setInactivityWarning(false);
  }, [session]);

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setInactivityWarning(false);
  }, []);

  // Monitor user activity for auto-logout
  useEffect(() => {
    if (!session) return;

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    timerCheckRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        logout();
      } else if (elapsed >= WARNING_TIMEOUT_MS) {
        setInactivityWarning(true);
      } else {
        setInactivityWarning(false);
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      if (timerCheckRef.current) clearInterval(timerCheckRef.current);
    };
  }, [session, logout]);

  const login = async (role: UserRole, username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed. Please check credentials.' };
      }

      setSession(data.session);
      localStorage.setItem('abc_univ_session', JSON.stringify(data.session));
      lastActivityRef.current = Date.now();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network or server error during login.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        role: session?.role || null,
        isLoading,
        login,
        logout,
        inactivityWarning,
        resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

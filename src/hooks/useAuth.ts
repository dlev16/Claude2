/**
 * Authentication Hook
 * Centralized authentication logic
 * 
 * SECURITY NOTE: This is a frontend-only implementation for demo purposes.
 * In production, authentication should be handled by a secure backend with:
 * - Proper password hashing (bcrypt, argon2)
 * - JWT tokens with refresh tokens
 * - HTTP-only cookies for session management
 * - Rate limiting on login attempts
 * - Multi-factor authentication
 * - Server-side role verification
 */

import { useState, useEffect, useCallback } from 'react';
import { UserRole } from '@/constants/roles';
import { mockUsers } from '@/data/mockUsers';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  instructorName: string | null;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    instructorName: null,
  });
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [initialized, setInitialized] = useState(false);

  // Broadcast auth changes to all hook instances
  const broadcastAuthChange = () => {
    try {
      window.dispatchEvent(new CustomEvent('auth:update'));
    } catch {}
  };

  // Sync local auth state from sessionStorage (used when other components change auth)
  const syncFromStorage = () => {
    const role = sessionStorage.getItem('userRole') as UserRole | null;
    const instructorName = sessionStorage.getItem('instructorName');
    if (role) {
      setAuthState({ isAuthenticated: true, role, instructorName });
    } else {
      setAuthState({ isAuthenticated: false, role: null, instructorName: null });
    }
  };

  // Listen for auth updates and storage changes
  useEffect(() => {
    const handler = () => syncFromStorage();
    window.addEventListener('auth:update', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('auth:update', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    // Clear specific session storage items
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('instructorName');
    sessionStorage.removeItem('lastActivity');

    // Reset auth state
    setAuthState({
      isAuthenticated: false,
      role: null,
      instructorName: null,
    });
    setLastActivity(Date.now());
    broadcastAuthChange();
  }, []);
  // Initialize auth state from sessionStorage
  useEffect(() => {
    const role = sessionStorage.getItem('userRole') as UserRole | null;
    const instructorName = sessionStorage.getItem('instructorName');
    const lastActivityStored = sessionStorage.getItem('lastActivity');

    if (role) {
      // If lastActivity is missing, initialize it instead of forcing a logout
      if (!lastActivityStored) {
        const now = Date.now();
        sessionStorage.setItem('lastActivity', now.toString());
        setLastActivity(now);
      } else {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivityStored, 10);
        // Check for session timeout
        if (timeSinceLastActivity > SESSION_TIMEOUT) {
          // Session expired
          logout();
          setInitialized(true);
          return;
        }
        const now = Date.now();
        setLastActivity(now);
        sessionStorage.setItem('lastActivity', now.toString());
      }

      setAuthState({
        isAuthenticated: true,
        role,
        instructorName,
      });
    }
    setInitialized(true);
  }, []);

  // Auto-logout on session timeout
  useEffect(() => {
    const checkTimeout = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      
      if (authState.isAuthenticated && timeSinceLastActivity > SESSION_TIMEOUT) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTimeout);
  }, []);

  // Update last activity on user interaction
  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    sessionStorage.setItem('lastActivity', now.toString());
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    // Find user by email and password
    const user = mockUsers.find(
      (u) => u.email === username && u.password === password
    );

    if (!user) {
      return false;
    }

    // Set auth state based on found user's role
    sessionStorage.setItem('userRole', user.role);
    sessionStorage.setItem('instructorName', user.instructor_name || user.full_name);
    sessionStorage.setItem('lastActivity', Date.now().toString());

    setAuthState({
      isAuthenticated: true,
      role: user.role,
      instructorName: user.instructor_name || user.full_name,
    });
    setLastActivity(Date.now());
    broadcastAuthChange();

    return true;
  }, [updateActivity]);

  return {
    ...authState,
    initialized,
    login,
    logout,
    updateActivity,
  };
};
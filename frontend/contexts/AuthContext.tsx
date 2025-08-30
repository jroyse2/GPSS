import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import apiClient from '@/utils/api';
import routerLock from '@/utils/routerLock';

// Define auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createClient();
  
  // Use refs to track initialization
  const isInitialized = useRef(false);
  const authCheckCount = useRef(0);
  const lastPathChecked = useRef('');

  // Check if user is logged in on mount or path change
  useEffect(() => {
    // Skip if we've already checked this path
    if (lastPathChecked.current === router.pathname) {
      return;
    }
    
    lastPathChecked.current = router.pathname;
    
    const checkAuth = async () => {
      try {
        // Prevent multiple simultaneous auth checks
        authCheckCount.current++;
        const currentCheck = authCheckCount.current;
        
        setLoading(true);
        console.log(`[Auth Check #${currentCheck}] Starting authentication check...`);
        
        // Get current session from Supabase
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        // If another check has started, abort this one
        if (currentCheck !== authCheckCount.current) {
          console.log(`[Auth Check #${currentCheck}] Aborted: newer check in progress`);
          return;
        }
        
        if (supabaseUser) {
          console.log(`[Auth Check #${currentCheck}] User authenticated:`, supabaseUser.email);
          setUser(supabaseUser);
          setIsAuthenticated(true);
          
          // Handle redirects based on path, but only if not in a locked state
          const isAuthPage = router.pathname.includes('/auth/');
          
          if (isAuthPage && !routerLock.isLocked()) {
            console.log(`[Auth Check #${currentCheck}] Already authenticated on auth page, redirecting to dashboard`);
            routerLock.safeNavigate(router, '/dashboard');
          }
        } else {
          console.log(`[Auth Check #${currentCheck}] No authenticated user found`);
          setUser(null);
          setIsAuthenticated(false);
          
          // Handle redirects for protected pages, but only if not in a locked state
          const isProtectedPage = !router.pathname.includes('/auth/') && 
                                 router.pathname !== '/' && 
                                 router.pathname !== '/unauthorized';
                                 
          if (isProtectedPage && !routerLock.isLocked()) {
            console.log(`[Auth Check #${currentCheck}] Protected route accessed without authentication, redirecting to login`);
            routerLock.safeNavigate(router, '/auth/login');
          }
        }
        
        isInitialized.current = true;
      } catch (error) {
        console.error('[Auth] Check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Only check auth if not currently locked
    if (!routerLock.isLocked()) {
      checkAuth();
    }
  }, [router.pathname]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Auth] State changed:', event);
        
        // Update user state
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[Auth] Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('[Auth] Login successful');
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Clear any redirect history
      routerLock.clearHistory();
      
      // Safe redirect to dashboard
      console.log('[Auth] Redirecting to dashboard after login');
      routerLock.safeNavigate(router, '/dashboard');
    } catch (error: any) {
      console.error('[Auth] Login failed:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[Auth] Attempting registration with:', email);
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) throw error;
      
      // Clear any redirect history
      routerLock.clearHistory();
      
      // If email confirmation is required
      if (!data.user?.confirmed_at) {
        console.log('[Auth] Registration successful, email confirmation required');
        routerLock.safeNavigate(router, '/auth/check-email');
      } else {
        console.log('[Auth] Registration successful, redirecting to dashboard');
        setUser(data.user);
        setIsAuthenticated(true);
        routerLock.safeNavigate(router, '/dashboard');
      }
    } catch (error: any) {
      console.error('[Auth] Registration failed:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      console.log('[Auth] Logging out...');
      
      // Sign out with Supabase
      await supabase.auth.signOut();
      
      // Clear user state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear any redirect history
      routerLock.clearHistory();
      
      console.log('[Auth] Logout successful, redirecting to login');
      routerLock.safeNavigate(router, '/auth/login');
    } catch (error: any) {
      console.error('[Auth] Logout failed:', error);
      setError(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout, 
      clearError,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
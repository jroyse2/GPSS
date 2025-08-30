import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import routerLock from '@/utils/routerLock';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip if router is locked
    if (routerLock.isLocked()) {
      return;
    }
    
    // Only redirect if not loading and not authenticated
    if (!loading && !isAuthenticated) {
      console.log('[ProtectedRoute] No authenticated user, redirecting to login');
      routerLock.safeNavigate(router, '/auth/login');
      return;
    } 
    
    // Check for required role if user is authenticated
    if (!loading && user && requiredRole) {
      // Get role from user metadata
      const userRole = user.user_metadata?.role;
      
      // Check if user has required role
      const hasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(userRole)
        : userRole === requiredRole;
      
      if (!hasRequiredRole) {
        console.log('[ProtectedRoute] User does not have required role, redirecting to unauthorized');
        routerLock.safeNavigate(router, '/unauthorized');
      }
    }
  }, [user, loading, isAuthenticated, router, requiredRole]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check for required role
  if (requiredRole && user) {
    const userRole = user.user_metadata?.role;
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;
    
    if (!hasRequiredRole) {
      return null;
    }
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
};

export default ProtectedRoute;
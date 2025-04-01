'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthGuard(requireAuth = true, redirectTo = requireAuth ? '/login' : '/') {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // Use a ref to track if we've already redirected to prevent loops
  const hasRedirected = useRef(false);
  // Use a ref to track mounted state to avoid state updates after unmount
  const isMounted = useRef(true);
  // Track the last auth state to detect changes
  const lastAuthState = useRef<boolean | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Skip if still loading auth
    if (isAuthLoading) return;

    // Get current auth state
    const isAuthenticated = !!user;
    
    // Check if auth state actually changed
    const authStateChanged = lastAuthState.current !== isAuthenticated;
    lastAuthState.current = isAuthenticated;
    
    // Only perform redirect if auth state changed and we haven't redirected yet
    if (authStateChanged && !hasRedirected.current) {
      const shouldRedirect = 
        (requireAuth && !isAuthenticated) || // Needs auth but not authenticated
        (!requireAuth && isAuthenticated);   // Doesn't need auth but is authenticated
      
      if (shouldRedirect) {
        console.log(`Redirecting to ${redirectTo} (requireAuth: ${requireAuth}, isAuthenticated: ${isAuthenticated})`);
        hasRedirected.current = true; // Mark as redirected to prevent loops
        router.push(redirectTo);
      }
    }
    
    // Always update checking state when auth loading completes
    if (isMounted.current && !isAuthLoading) {
      setIsChecking(false);
    }
  }, [user, isAuthLoading, requireAuth, redirectTo, router]);

  return { isLoading: isAuthLoading || isChecking };
}
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// A very simple hook that just checks if the user is authenticated once and redirects if needed
export function useAuthGuard(requireAuth = true, redirectTo = requireAuth ? '/login' : '/') {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [checkCompleted, setCheckCompleted] = useState(false);
  
  // Only run the check once when the component mounts
  const didRun = useRef(false);
  
  useEffect(() => {
    // Skip if we've already run this effect or if auth is still loading
    if (didRun.current || isLoading) return;
    
    // Mark as run to prevent future executions
    didRun.current = true;
    
    const isAuthenticated = !!user;
    
    // Simple check: If we need auth and don't have it, or don't need auth and have it
    if ((requireAuth && !isAuthenticated) || (!requireAuth && isAuthenticated)) {
      console.log(`[Auth Guard] Redirecting to ${redirectTo}`);
      router.push(redirectTo);
    }
    
    // Mark the check as complete regardless
    setCheckCompleted(true);
  }, [user, isLoading, requireAuth, redirectTo, router]);
  
  // Return loading state - true until auth check is done AND auth loading is done
  return { isLoading: isLoading || !checkCompleted };
}
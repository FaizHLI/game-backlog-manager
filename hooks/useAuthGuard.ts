'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthGuard(requireAuth = true, redirectTo = requireAuth ? '/login' : '/') {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [checkCompleted, setCheckCompleted] = useState(false);
  
  const didRun = useRef(false);
  
  useEffect(() => {
    if (didRun.current || isLoading) return;
    
    didRun.current = true;
    
    const isAuthenticated = !!user;
    
    if ((requireAuth && !isAuthenticated) || (!requireAuth && isAuthenticated)) {
      console.log(`[Auth Guard] Redirecting to ${redirectTo}`);
      router.push(redirectTo);
    }
    
    setCheckCompleted(true);
  }, [user, isLoading, requireAuth, redirectTo, router]);
  
  return { isLoading: isLoading || !checkCompleted };
}
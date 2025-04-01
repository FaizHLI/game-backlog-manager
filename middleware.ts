import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ONLY refreshes the auth session token
// We handle redirects entirely client-side now
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Skip running on static assets
  if (
    req.nextUrl.pathname.startsWith('/_next') || 
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return res;
  }
  
  // Create Supabase client
  const supabase = createMiddlewareClient({ req, res });
  
  // This only refreshes the session token if needed, doesn't redirect
  await supabase.auth.getSession();
  
  return res;
}
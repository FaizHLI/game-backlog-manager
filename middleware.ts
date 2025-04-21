import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  if (
    req.nextUrl.pathname.startsWith('/_next') || 
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return res;
  }
  
  const supabase = createMiddlewareClient({ req, res });
  
  await supabase.auth.getSession();
  
  return res;
}
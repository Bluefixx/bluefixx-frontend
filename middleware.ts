import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Role-based routing middleware for BlueFixx
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Skip middleware for static assets, public files, and auth pages
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') || // matches file extensions
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/' ||
    pathname === '/onboarding'
  ) {
    return NextResponse.next();
  }

  // 2. Get active role from cookies
  const activeRole = request.cookies.get('bluefixx_active_role')?.value;

  // 3. Handle dashboard root redirection
  if (pathname === '/dashboard') {
    if (activeRole === 'artisan') {
      return NextResponse.redirect(new URL('/artisan', request.url));
    }
    if (activeRole === 'apprentice' || activeRole === 'talent' || activeRole === 'learner') {
      return NextResponse.redirect(new URL('/talent/home', request.url));
    }
    // Default for customer
    return NextResponse.next();
  }

  // 4. Protect role-specific route groups
  
  // Protect Artisan routes
  if (pathname.startsWith('/artisan')) {
    if (activeRole !== 'artisan') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Talent routes
  if (pathname.startsWith('/talent')) {
    const isTalent = activeRole === 'apprentice' || activeRole === 'talent' || activeRole === 'learner';
    if (!isTalent) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Customer routes (everything under /dashboard except what was handled above)
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard') {
    if (activeRole === 'artisan') {
      return NextResponse.redirect(new URL('/artisan', request.url));
    }
    const isTalent = activeRole === 'apprentice' || activeRole === 'talent' || activeRole === 'learner';
    if (isTalent) {
      return NextResponse.redirect(new URL('/talent/home', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

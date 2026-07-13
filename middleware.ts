import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only handle /admin routes for redirect
  if (path.startsWith('/admin')) {
    // Check for auth token in cookies or headers
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    // Let the API handle the actual verification
    // We'll just check if token exists
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
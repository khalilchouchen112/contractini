import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Paths that are accessible without authentication
const publicPaths = [
  '/',                  // Login page
  '/signup',           // Signup page
  '/api/users/login',  // Login API
  '/api/users',        // User creation API
];

function isPublicPath(path: string | null) {
  if (!path) return false;
  return publicPaths.some(publicPath => path.startsWith(publicPath));
}

function isStaticPath(path: string | null) {
  if (!path) return false;
  return path.startsWith('/_next') || 
         path.startsWith('/static') || 
         path.includes('/favicon.ico') ||
         path.includes('/sitemap.xml');
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow static files and public paths
  if (isStaticPath(path) || isPublicPath(path)) {
    // If user is already logged in and tries to access login/signup pages, redirect to dashboard
    if ((path === '/' || path === '/signup') && request.cookies.get('auth-token')) {
      try {
        const token = request.cookies.get('auth-token');
        if (token) {
          const decoded = verify(token.value, JWT_SECRET) as { role: string };
          const redirectUrl = decoded.role === 'ADMIN' ? '/dashboard' : '/my-contract';
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
      } catch (error) {
        // If token verification fails, continue to public path
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const token = request.cookies.get('auth-token');

  if (!token) {
    // Store the attempted URL to redirect back after login
    const redirectUrl = new URL('/', request.url);
    if (path) {
      redirectUrl.searchParams.set('callbackUrl', request.url);
    }
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Verify the token
    const decoded = verify(token.value, JWT_SECRET) as { userId: string; role: string };
    
    // Add user info to request headers for use in the API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);

    // Check role-based access
    if (path.startsWith('/dashboard') && decoded.role !== 'ADMIN') {
      // Non-admin users trying to access dashboard are redirected to my-contract
      return NextResponse.redirect(new URL('/my-contract', request.url));
    }

    // Continue with the request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // If token is invalid or expired, redirect to login
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

// Update the matcher to protect all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

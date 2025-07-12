import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
    '/',
    '/signup',
    '/api/users/login',
    '/api/users',
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
        return NextResponse.next();
    }

    // For protected routes, check if token exists
    const token = request.cookies.get('auth-token');

    if (!token) {
        const redirectUrl = new URL('/', request.url);
        if (path) {
            redirectUrl.searchParams.set('callbackUrl', path);
        }
        return NextResponse.redirect(redirectUrl);
    }

    // Let the API routes handle token validation
    // This prevents database calls in middleware which can be heavy
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    if (isStaticPath(path) || isPublicPath(path)) {
        if ((path === '/' || path === '/signup') && request.cookies.get('auth-token')) {
            try {
                const token = request.cookies.get('auth-token');
                if (token) {
                    const decoded = verify(token.value, JWT_SECRET) as { role: string };
                    const redirectUrl = "/dashboard";
                    return NextResponse.redirect(new URL(redirectUrl, request.url));
                }
            } catch (error) {
                return NextResponse.next();
            }
        }
        return NextResponse.next();
    }

    const token = request.cookies.get('auth-token');

    if (!token) {
        const redirectUrl = new URL('/', request.url);
        if (path) {
            redirectUrl.searchParams.set('callbackUrl', request.url);
        }
        return NextResponse.redirect(redirectUrl);
    }

    try {
        const decoded = verify(token.value, JWT_SECRET) as { userId: string; role: string };

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', decoded.userId);
        requestHeaders.set('x-user-role', decoded.role);

        if (path.startsWith('/dashboard') && decoded.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/my-contract', request.url));
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('auth-token');
        return response;
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

import { NextResponse } from 'next/server';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { refreshToken } from '@/lib/token-utils';

export async function POST() {
    try {
        const tokenCookie = await getAuthToken();
        
        if (!tokenCookie) {
            return NextResponse.json(
                { success: false, error: 'No token found' },
                { status: 401 }
            );
        }

        // Refresh the token expiration
        const refreshedToken = await refreshToken(tokenCookie.value);
        
        if (!refreshedToken) {
            return NextResponse.json(
                { success: false, error: 'Token refresh failed' },
                { status: 401 }
            );
        }

        // Get updated user data
        const user = await getUserFromToken();
        
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
            message: 'Token refreshed successfully'
        });
        
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { success: false, error: 'Token refresh failed' },
            { status: 500 }
        );
    }
}

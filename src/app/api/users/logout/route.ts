import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import AuthToken from '@/models/auth-token';

export async function POST() {
    try {
        await dbConnect();
        
        // Get the current token
        const tokenCookie = await getAuthToken();
        
        if (tokenCookie) {
            // Remove the token from the database
            await AuthToken.deleteOne({ token: tokenCookie.value });
        }

        // Create a response
        const response = NextResponse.json({ success: true });

        // Clear the auth-token cookie
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: new Date(0), // Set expiry to epoch time to ensure cookie is removed
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, error: 'Logout failed' },
            { status: 500 }
        );
    }
}
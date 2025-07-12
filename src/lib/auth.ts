import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import AuthToken from '@/models/auth-token';
import User from '@/models/User';

export async function getAuthToken() {
    const cookieStore = await cookies();
    return cookieStore.get('auth-token');
}

export async function verifyAuth() {
    try {
        await dbConnect();
        
        const tokenCookie = await getAuthToken();
        if (!tokenCookie) return null;

        // Find the token in the database and populate user data
        const authToken = await AuthToken.findOne({ 
            token: tokenCookie.value,
            expiresAt: { $gt: new Date() } // Check if token is not expired
        }).populate('userId');

        if (!authToken || !authToken.userId) {
            return null;
        }

        // Return the user data
        return {
            userId: authToken.userId._id.toString(),
            email: authToken.userId.email,
            role: authToken.userId.role,
            name: authToken.userId.name
        };
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

export async function getUserFromToken() {
    try {
        await dbConnect();
        
        const tokenCookie = await getAuthToken();
        if (!tokenCookie) return null;

        // Find the token in the database
        const authToken = await AuthToken.findOne({ 
            token: tokenCookie.value,
            expiresAt: { $gt: new Date() }
        });

        if (!authToken) {
            return null;
        }

        // Get the full user data
        const user = await User.findById(authToken.userId);
        if (!user) {
            return null;
        }

        return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        };
    } catch (error) {
        console.error('Get user from token error:', error);
        return null;
    }
}

export function generateError(message: string, status = 401) {
    return new Response(
        JSON.stringify({ success: false, error: message }),
        {
            status,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
}


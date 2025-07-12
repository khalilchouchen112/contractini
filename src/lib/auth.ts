import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getAuthToken() {
    const cookieStore = await cookies();
    return cookieStore.get('auth-token');
}

export async function verifyAuth() {
    try {
        const token = await getAuthToken();
        if (!token) return null;

        const decoded = verify(token.value, JWT_SECRET);
        return decoded;
    } catch {
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


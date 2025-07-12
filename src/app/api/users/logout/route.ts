import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // Clear authentication cookies (example: 'token')
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
    return response;
}
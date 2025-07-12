import { NextResponse } from 'next/server';
import { cleanupExpiredTokens } from '@/lib/token-utils';

export async function POST() {
    try {
        const deletedCount = await cleanupExpiredTokens();
        
        return NextResponse.json({
            success: true,
            message: `Cleaned up ${deletedCount} expired tokens`,
            deletedCount
        });
    } catch (error) {
        console.error('Token cleanup error:', error);
        return NextResponse.json(
            { success: false, error: 'Token cleanup failed' },
            { status: 500 }
        );
    }
}

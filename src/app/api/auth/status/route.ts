import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AuthToken from '@/models/auth-token';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();
        
        const users = await User.find({}, { name: 1, email: 1, role: 1 }).limit(10);
        const tokenCount = await AuthToken.countDocuments({
            expiresAt: { $gt: new Date() }
        });
        const expiredTokenCount = await AuthToken.countDocuments({
            expiresAt: { $lt: new Date() }
        });
        
        return NextResponse.json({
            success: true,
            data: {
                users,
                activeTokens: tokenCount,
                expiredTokens: expiredTokenCount,
                totalTokens: tokenCount + expiredTokenCount
            }
        });
        
    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json(
            { success: false, error: 'Status check failed' },
            { status: 500 }
        );
    }
}

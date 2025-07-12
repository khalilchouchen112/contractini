import dbConnect from '@/lib/dbConnect';
import AuthToken from '@/models/auth-token';

/**
 * Clean up expired tokens from the database
 */
export async function cleanupExpiredTokens() {
    try {
        await dbConnect();
        
        const result = await AuthToken.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        
        console.log(`Cleaned up ${result.deletedCount} expired tokens`);
        return result.deletedCount;
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
        return 0;
    }
}

/**
 * Get all active tokens for a user
 */
export async function getUserActiveTokens(userId: string) {
    try {
        await dbConnect();
        
        return await AuthToken.find({
            userId,
            expiresAt: { $gt: new Date() }
        });
    } catch (error) {
        console.error('Error getting user active tokens:', error);
        return [];
    }
}

/**
 * Revoke all tokens for a user (useful for password changes, etc.)
 */
export async function revokeAllUserTokens(userId: string) {
    try {
        await dbConnect();
        
        const result = await AuthToken.deleteMany({ userId });
        console.log(`Revoked ${result.deletedCount} tokens for user ${userId}`);
        return result.deletedCount;
    } catch (error) {
        console.error('Error revoking user tokens:', error);
        return 0;
    }
}

/**
 * Refresh a token (extend its expiration)
 */
export async function refreshToken(token: string) {
    try {
        await dbConnect();
        
        // Extend expiration by 24 hours
        const newExpiresAt = new Date();
        newExpiresAt.setHours(newExpiresAt.getHours() + 24);
        
        const result = await AuthToken.findOneAndUpdate(
            { 
                token, 
                expiresAt: { $gt: new Date() } 
            },
            { expiresAt: newExpiresAt },
            { new: true }
        );
        
        return result;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
}

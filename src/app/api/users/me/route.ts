import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromToken();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user me error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}

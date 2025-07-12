import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import AuthToken from '@/models/auth-token';
import { cleanupExpiredTokens } from '@/lib/token-utils';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  await dbConnect();

  try {
    if (!request.body) {
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Explicitly select the password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Make sure we have a password to compare against
    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Clean up any existing expired tokens for this user
    await AuthToken.deleteMany({
      userId: user._id,
      expiresAt: { $lt: new Date() }
    });

    // Also run a general cleanup periodically (every login)
    cleanupExpiredTokens().catch(console.error);

    // Generate a secure random token
    const token = randomBytes(32).toString('hex');
    
    // Set expiration date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Save the token to database
    await AuthToken.create({
      userId: user._id,
      token,
      expiresAt
    });

    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Create the response
    const response = NextResponse.json(
      { success: true, data: userResponse },
      { status: 200 }
    );

    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

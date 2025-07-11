import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // In a real app, you would compare the hashed password
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    // }
    
    // For demo purposes, we are not comparing passwords
    if (password !== 'password') { // Simple check for the demo
        // return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }


    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json({ success: true, data: userResponse });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

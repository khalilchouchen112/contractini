import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();

  try {
    const body = await request.json();
    const { name, email, role, phone, address } = body;

    const user = await User.findByIdAndUpdate(
        id, 
        { name, email, role, phone, address }, 
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const contracts = await mongoose.model('Contract').find({ employeeId: id });
    
    return NextResponse.json({ success: true, data: { user, contracts } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Optional: Also delete contracts associated with the user
    // await mongoose.model('Contract').deleteMany({ employeeId: id });

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
     return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

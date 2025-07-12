import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Contract from '@/models/Contract';

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    // Build filter object
    let filter: any = {};

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by contract type
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Filter by user ID
    if (userId) {
      filter.employee = userId;
    }

    const contracts = await Contract.find(filter).populate('employee', 'name email _id');
    return NextResponse.json({ success: true, data: contracts });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const contract = await Contract.create(body);
    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedContract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedContract });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Contract ID is required' }, { status: 400 });
    }

    const deletedContract = await Contract.findByIdAndDelete(id);

    if (!deletedContract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deletedContract });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

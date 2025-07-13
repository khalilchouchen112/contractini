import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Contract from '@/models/Contract';
import Request from '@/models/Request';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  await dbConnect();

  try {
    // Get user from auth token
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { contractId, type, reason, requestedStatus } = body;

    if (!contractId || !type) {
      return NextResponse.json({ 
        success: false, 
        error: 'Contract ID and request type are required' 
      }, { status: 400 });
    }

    if (!['renewal', 'termination', 'status_change'].includes(type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request type. Must be "renewal", "termination", or "status_change"' 
      }, { status: 400 });
    }

    // Find the contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    // Check if user owns this contract
    if (contract.employee.toString() !== user.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    // Check if there's already a pending request for this contract
    const existingRequest = await Request.findOne({ 
      contract: contractId, 
      status: 'pending' 
    });

    if (existingRequest) {
      return NextResponse.json({ 
        success: false, 
        error: 'There is already a pending request for this contract' 
      }, { status: 400 });
    }

    // Create new request
    const newRequest = new Request({
      employee: user.userId,
      contract: contractId,
      type,
      currentStatus: contract.status,
      requestedStatus: type === 'status_change' ? requestedStatus : undefined,
      reason: reason || `${type} requested by employee`,
      status: 'pending'
    });

    await newRequest.save();

    // Populate the request with employee and contract details
    await newRequest.populate('employee', 'name email');
    await newRequest.populate('contract', 'type status');

    return NextResponse.json({ 
      success: true, 
      message: `${type} request submitted successfully`,
      data: newRequest 
    });

  } catch (error) {
    console.error('Error processing contract request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    // Get user from auth token
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Get all requests for the user
    const requests = await Request.find({ employee: user.userId })
      .populate('contract', 'type status')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      data: requests 
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch requests' 
    }, { status: 500 });
  }
}

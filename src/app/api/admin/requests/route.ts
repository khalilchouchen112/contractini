import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Request from '@/models/Request';
import Contract from '@/models/Contract';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  await dbConnect();

  try {
    // Get user from auth token
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Get all requests with populated data
    const requests = await Request.find({})
      .populate('employee', 'name email')
      .populate('contract', 'type status')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      data: requests 
    });

  } catch (error) {
    console.error('Error fetching admin requests:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch requests' 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await dbConnect();

  try {
    // Get user from auth token
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action, adminNotes } = body;

    if (!requestId || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'Request ID and action are required' 
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action. Must be "approve" or "reject"' 
      }, { status: 400 });
    }

    // Find the request
    const requestDoc = await Request.findById(requestId).populate('contract');
    if (!requestDoc) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (requestDoc.status !== 'pending') {
      return NextResponse.json({ 
        success: false, 
        error: 'Request has already been processed' 
      }, { status: 400 });
    }

    // Update the request
    requestDoc.status = action === 'approve' ? 'approved' : 'rejected';
    requestDoc.processedBy = user.userId;
    requestDoc.processedAt = new Date();
    requestDoc.adminNotes = adminNotes;

    await requestDoc.save();

    // If approved, update the contract
    if (action === 'approve' && requestDoc.contract) {
      const contract = await Contract.findById(requestDoc.contract._id);
      if (contract) {
        let newStatus = contract.status;
        
        // Determine new status based on request type
        if (requestDoc.type === 'termination') {
          newStatus = 'Terminated';
        } else if (requestDoc.type === 'renewal') {
          newStatus = 'Active';
        } else if (requestDoc.type === 'status_change' && requestDoc.requestedStatus) {
          newStatus = requestDoc.requestedStatus;
        }

        // Add to status history
        const statusUpdate = {
          status: newStatus,
          previousStatus: contract.status,
          updatedAt: new Date(),
          reason: `${requestDoc.type} approved by admin${adminNotes ? ': ' + adminNotes : ''}`,
          updatedBy: user.name || user.userId
        };

        contract.status = newStatus;
        contract.statusHistory = contract.statusHistory || [];
        contract.statusHistory.push(statusUpdate);
        contract.lastStatusUpdate = new Date();

        await contract.save();
      }
    }

    // Populate the updated request
    await requestDoc.populate('employee', 'name email');
    await requestDoc.populate('contract', 'type status');
    await requestDoc.populate('processedBy', 'name email');

    return NextResponse.json({ 
      success: true, 
      message: `Request ${action}d successfully`,
      data: requestDoc 
    });

  } catch (error) {
    console.error('Error processing admin request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Contract from '@/models/Contract';
import Request from '@/models/Request';
import User from '@/models/User';

interface Activity {
  id: string;
  type: 'contract_created' | 'contract_updated' | 'request_submitted' | 'request_approved' | 'contract_expired';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

export async function GET() {
  try {
    await dbConnect();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get recent contracts
    const recentContracts = await Contract.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate('employee', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get recent requests
    const recentRequests = await Request.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate('employee', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get recently updated contracts
    const recentUpdates = await Contract.find({
      lastStatusUpdate: { $gte: sevenDaysAgo },
      createdAt: { $lt: sevenDaysAgo } // Exclude newly created ones
    })
    .populate('employee', 'name')
    .sort({ lastStatusUpdate: -1 })
    .limit(3);

    const activities: Activity[] = [];

    // Add contract activities
    recentContracts.forEach(contract => {
      activities.push({
        id: `contract-${contract._id}`,
        type: 'contract_created',
        title: 'New Contract Created',
        description: `${contract.type} contract for ${contract.employee?.name || 'Unknown User'}`,
        timestamp: contract.createdAt,
        user: contract.employee?.name
      });
    });

    // Add request activities
    recentRequests.forEach(request => {
      let title = 'Request Submitted';
      let description = `${request.type} request`;
      
      if (request.status === 'approved') {
        title = 'Request Approved';
        description = `${request.type} request approved`;
      } else if (request.status === 'rejected') {
        title = 'Request Rejected';
        description = `${request.type} request rejected`;
      }

      activities.push({
        id: `request-${request._id}`,
        type: request.status === 'approved' ? 'request_approved' : 'request_submitted',
        title,
        description: `${description} for ${request.employee?.name || 'Unknown User'}`,
        timestamp: request.processedAt || request.createdAt,
        user: request.employee?.name
      });
    });

    // Add contract updates
    recentUpdates.forEach(contract => {
      activities.push({
        id: `update-${contract._id}`,
        type: 'contract_updated',
        title: 'Contract Status Updated',
        description: `Contract status changed to ${contract.status} for ${contract.employee?.name || 'Unknown User'}`,
        timestamp: contract.lastStatusUpdate,
        user: contract.employee?.name
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Take only the most recent 10
    const limitedActivities = activities.slice(0, 10);

    return NextResponse.json({ activities: limitedActivities });
  } catch (error) {
    console.error('Recent activity API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}

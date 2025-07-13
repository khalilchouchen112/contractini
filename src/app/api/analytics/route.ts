import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Contract from '@/models/Contract';
import Request from '@/models/Request';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Get current date for calculations
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Contract statistics
    const totalContracts = await Contract.countDocuments();
    const activeContracts = await Contract.countDocuments({ status: 'Active' });
    const expiringContracts = await Contract.countDocuments({
      status: { $in: ['Active', 'Expiring Soon'] },
      endDate: { $lte: thirtyDaysFromNow, $gte: now }
    });
    const terminatedContracts = await Contract.countDocuments({ status: 'Terminated' });
    
    // Previous month active contracts for comparison
    const lastMonthActiveContracts = await Contract.countDocuments({
      status: 'Active',
      createdAt: { $gte: lastMonth, $lt: startOfMonth }
    });

    // Contract status breakdown
    const contractsByStatus = await Contract.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Contract types breakdown
    const contractsByType = await Contract.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly renewals data (last 12 months)
    const monthlyRenewals = await Contract.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          renewals: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Requests statistics
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const totalRequests = await Request.countDocuments();
    const approvedRequests = await Request.countDocuments({ status: 'approved' });
    const rejectedRequests = await Request.countDocuments({ status: 'rejected' });

    // Recent requests (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentRequests = await Request.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // User statistics
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'ADMIN' });
    const regularUsers = await User.countDocuments({ role: 'USER' });

    // Recent activity (contracts created in last 30 days)
    const recentContracts = await Contract.countDocuments({
      createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Contracts expiring by month (next 6 months)
    const expiringByMonth = await Contract.aggregate([
      {
        $match: {
          endDate: { 
            $gte: now, 
            $lte: new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$endDate' },
            month: { $month: '$endDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format monthly renewals data
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const formattedMonthlyRenewals = months.map((month, index) => {
      const monthData = monthlyRenewals.find(
        item => item._id.month === index + 1 && item._id.year === now.getFullYear()
      );
      return {
        month,
        renewals: monthData ? monthData.renewals : 0
      };
    });

    // Format expiring contracts by month
    const formattedExpiringByMonth = months.slice(now.getMonth(), now.getMonth() + 6).map((month, index) => {
      const actualMonth = (now.getMonth() + index) % 12 + 1;
      const year = now.getMonth() + index >= 12 ? now.getFullYear() + 1 : now.getFullYear();
      
      const monthData = expiringByMonth.find(
        item => item._id.month === actualMonth && item._id.year === year
      );
      
      return {
        month,
        expiring: monthData ? monthData.count : 0
      };
    });

    const analytics = {
      overview: {
        totalContracts,
        activeContracts,
        expiringContracts,
        terminatedContracts,
        activeContractsChange: activeContracts - lastMonthActiveContracts,
        totalUsers,
        adminUsers,
        regularUsers,
        recentContracts,
        pendingRequests,
        totalRequests,
        approvedRequests,
        rejectedRequests,
        recentRequests
      },
      contractsByStatus: contractsByStatus.map(item => ({
        name: item._id,
        value: item.count,
        fill: getStatusColor(item._id)
      })),
      contractsByType: contractsByType.map(item => ({
        name: item._id,
        value: item.count,
        fill: getTypeColor(item._id)
      })),
      monthlyRenewals: formattedMonthlyRenewals,
      expiringByMonth: formattedExpiringByMonth,
      requestsBreakdown: [
        { name: 'Pending', value: pendingRequests, fill: 'hsl(var(--chart-4))' },
        { name: 'Approved', value: approvedRequests, fill: 'hsl(var(--chart-1))' },
        { name: 'Rejected', value: rejectedRequests, fill: 'hsl(var(--chart-5))' }
      ]
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Active':
      return 'hsl(var(--chart-1))';
    case 'Expiring Soon':
      return 'hsl(var(--chart-4))';
    case 'Terminated':
      return 'hsl(var(--chart-5))';
    case 'Expired':
      return 'hsl(var(--chart-3))';
    default:
      return 'hsl(var(--chart-2))';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'CDI':
      return 'hsl(var(--chart-1))';
    case 'CDD':
      return 'hsl(var(--chart-2))';
    case 'Internship':
      return 'hsl(var(--chart-3))';
    case 'Terminated':
      return 'hsl(var(--chart-5))';
    default:
      return 'hsl(var(--chart-4))';
  }
}

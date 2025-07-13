import { NextRequest, NextResponse } from 'next/server';
import { ContractStatusService } from '@/lib/contract-status-service';

// POST /api/contracts/status/update - Update all contract statuses
export async function POST(request: NextRequest) {
  try {
    const updates = await ContractStatusService.updateAllContractStatuses();
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} contract statuses`,
      data: updates
    });
  } catch (error) {
    console.error('Error updating contract statuses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update contract statuses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/contracts/status/expiring - Get contracts expiring soon
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const expiringContracts = await ContractStatusService.getExpiringContracts(days);
    
    return NextResponse.json({
      success: true,
      data: expiringContracts,
      count: expiringContracts.length
    });
  } catch (error) {
    console.error('Error fetching expiring contracts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch expiring contracts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

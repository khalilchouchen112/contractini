import { NextRequest, NextResponse } from 'next/server';
import { ContractStatusService } from '@/lib/contract-status-service';

// This endpoint can be called by a cron service like Vercel Cron, GitHub Actions, or external cron services
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for security
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting automated contract status update...');
    const startTime = Date.now();
    
    const updates = await ContractStatusService.updateAllContractStatuses();
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Contract status update completed in ${duration}ms. Updated ${updates.length} contracts.`);

    // Log significant changes
    if (updates.length > 0) {
      console.log('Contract status changes:', updates.map(update => ({
        contractId: update.contractId,
        change: `${update.oldStatus} → ${update.newStatus}`,
        reason: update.reason
      })));
    }

    return NextResponse.json({
      success: true,
      message: `Automated status update completed successfully`,
      data: {
        updatedContracts: updates.length,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        updates: updates
      }
    });
  } catch (error) {
    console.error('Error in automated contract status update:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update contract statuses',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check cron service status
export async function GET() {
  try {
    // Get some basic stats
    const expiringContracts = await ContractStatusService.getExpiringContracts();
    const expiredContracts = await ContractStatusService.getExpiredContracts();
    
    return NextResponse.json({
      success: true,
      message: 'Contract status cron service is operational',
      data: {
        expiringContractsCount: expiringContracts.length,
        expiredContractsCount: expiredContracts.length,
        lastChecked: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error checking cron service status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cron service check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

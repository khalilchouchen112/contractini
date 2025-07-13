import { NextResponse } from 'next/server';
import { ContractStatusService } from '@/lib/contract-status-service';

export async function GET() {
  try {
    // Test the contract status calculation with sample data
    const testCases = [
      {
        name: 'Contract expiring in 20 days',
        startDate: '2024-01-01',
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        name: 'Contract expiring in 50 days',
        startDate: '2024-01-01',
        endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        name: 'Contract expired 3 days ago',
        startDate: '2024-01-01',
        endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        name: 'CDI Contract (no end date)',
        startDate: '2024-01-01',
        endDate: undefined,
      },
    ];

    // Test with company settings
    const companySettings = {
      contractNotifications: {
        enabled: true,
        expiringContractDays: 45, // Custom: 45 days instead of default 30
        expiredContractGraceDays: 5, // Custom: 5 days grace period
        reminderFrequency: 'weekly',
        emailNotifications: true,
        dashboardNotifications: true,
      }
    };

    const resultsWithSettings = testCases.map(testCase => ({
      ...testCase,
      statusWithCustomSettings: ContractStatusService.calculateContractStatus(
        testCase.startDate, 
        testCase.endDate, 
        companySettings
      ),
      statusWithDefaultSettings: ContractStatusService.calculateContractStatus(
        testCase.startDate, 
        testCase.endDate
      )
    }));

    return NextResponse.json({
      success: true,
      message: 'Contract status service test results',
      data: {
        companySettings,
        testResults: resultsWithSettings
      }
    });
  } catch (error) {
    console.error('Error testing contract status service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test contract status service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

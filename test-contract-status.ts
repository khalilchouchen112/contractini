/**
 * Test file to verify contract status automation service
 * Run this with: npx tsx test-contract-status.ts
 */

import { ContractStatusService } from './src/lib/contract-status-service';

async function testContractStatusService() {
  console.log('🧪 Testing Contract Status Service...\n');

  try {
    // Test 1: Status calculation logic
    console.log('📋 Testing status calculation logic:');
    
    const testCases = [
      {
        name: 'Active contract (CDI)',
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
        endDate: undefined,
        expected: 'Active'
      },
      {
        name: 'Expiring soon (20 days)',
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
        expected: 'Expiring Soon'
      },
      {
        name: 'Expired contract',
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        expected: 'Expired'
      },
      {
        name: 'Active contract (40 days remaining)',
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
        endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days from now
        expected: 'Active'
      }
    ];

    testCases.forEach((testCase, index) => {
      const result = ContractStatusService.calculateContractStatus(testCase.startDate, testCase.endDate);
      const status = result === testCase.expected ? '✅' : '❌';
      console.log(`  ${index + 1}. ${testCase.name}: ${status} (Expected: ${testCase.expected}, Got: ${result})`);
    });

    console.log('\n🎯 Status calculation tests completed!\n');

    // Test 2: Check if we can connect to database (only if MongoDB is configured)
    console.log('🔗 Testing database connection...');
    try {
      // This will only work if you have MONGODB_URI set up
      const expiringContracts = await ContractStatusService.getExpiringContracts(30);
      console.log(`✅ Database connection successful! Found ${expiringContracts.length} expiring contracts.`);
    } catch (error) {
      console.log('⚠️  Database connection failed (this is expected if MongoDB is not configured)');
      console.log('   Error:', (error as Error).message);
    }

    console.log('\n🎉 Contract status service tests completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set up your MongoDB connection in .env.local');
    console.log('   2. Add CRON_SECRET_TOKEN to .env.local');
    console.log('   3. Deploy to Vercel to enable automatic status updates');
    console.log('   4. Test the API endpoints at /api/contracts/status');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testContractStatusService();
}

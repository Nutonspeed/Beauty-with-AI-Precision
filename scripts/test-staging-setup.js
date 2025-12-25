// Test script to verify Super Admin Dashboard setup on staging
// Run this in browser console on the staging site

const testSuperAdminDashboard = async () => {
  console.log('🧪 Testing Super Admin Dashboard Setup...\n');
  
  const tests = [];
  
  // Test 1: Check if we can access the admin page
  tests.push({
    name: 'Admin Page Access',
    test: async () => {
      const response = await fetch('/admin');
      return {
        status: response.status,
        redirected: response.redirected,
        url: response.url
      };
    }
  });
  
  // Test 2: Check audit logs API
  tests.push({
    name: 'Audit Logs API',
    test: async () => {
      try {
        const response = await fetch('/api/admin/audit-logs');
        const data = await response.json();
        return {
          status: response.status,
          hasError: !!data.error,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    }
  });
  
  // Test 3: Check feature flags API
  tests.push({
    name: 'Feature Flags API',
    test: async () => {
      try {
        const response = await fetch('/api/admin/feature-flags');
        const data = await response.json();
        return {
          status: response.status,
          hasError: !!data.error,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    }
  });
  
  // Test 4: Check system health API
  tests.push({
    name: 'System Health API',
    test: async () => {
      try {
        const response = await fetch('/api/admin/system-health');
        const data = await response.json();
        return {
          status: response.status,
          hasError: !!data.error,
          hasMetrics: !!data.metrics,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    }
  });
  
  // Test 5: Check analytics API
  tests.push({
    name: 'Analytics API',
    test: async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        const data = await response.json();
        return {
          status: response.status,
          hasError: !!data.error,
          hasData: !!data.data,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    }
  });
  
  // Run all tests
  console.log('Running tests...\n');
  for (const test of tests) {
    try {
      console.log(`⏳ ${test.name}...`);
      const result = await test.test();
      
      if (result.error) {
        console.log(`❌ ${test.name}: ${result.error}`);
      } else if (result.hasError || result.status === 403 || result.status === 401) {
        console.log(`⚠️  ${test.name}: Expected error (not authenticated)`);
      } else {
        console.log(`✅ ${test.name}: OK`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
  
  console.log('\n📝 Manual Testing Checklist:');
  console.log('1. Login with super admin credentials');
  console.log('2. Navigate to /admin');
  console.log('3. Test each feature:');
  console.log('   - Subscriptions: View and edit clinic subscriptions');
  console.log('   - Audit Logs: Filter and view logs');
  console.log('   - Analytics: Check charts and metrics');
  console.log('   - Bulk Users: Import CSV file');
  console.log('   - Revenue: View reports and export');
  console.log('   - Feature Flags: Toggle features');
  console.log('   - System Health: Monitor metrics');
  console.log('   - Clinic Performance: View rankings');
  
  console.log('\n🔍 Database Verification:');
  console.log('Run this in Supabase SQL Editor:');
  console.log('SELECT COUNT(*) FROM audit_logs;');
  console.log('SELECT COUNT(*) FROM feature_flags;');
  console.log('SELECT * FROM feature_flags LIMIT 5;');
};

// Auto-run the test
testSuperAdminDashboard();

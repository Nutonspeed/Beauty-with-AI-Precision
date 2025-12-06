import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/['"]/g, '');
  }
});

const BASE_URL = 'http://localhost:3004'; // Dev server port

async function testEndpoint(name, url, expectAuthRequired = true) {
  console.log(`\n🧪 Testing ${name}:`);
  console.log(`   URL: ${url}`);

  try {
    // Test without authentication
    const response = await fetch(url);
    const status = response.status;
    const isJson = response.headers.get('content-type')?.includes('application/json');

    if (expectAuthRequired) {
      if (status === 401 || status === 403) {
        console.log(`   ✅ PASS: Correctly requires authentication (${status})`);
      } else {
        console.log(`   ❌ FAIL: Should require authentication but got ${status}`);
        if (isJson) {
          const data = await response.json();
          console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
        }
      }
    } else {
      if (status === 200) {
        console.log(`   ✅ PASS: Public endpoint accessible (${status})`);
      } else {
        console.log(`   ⚠️  UNEXPECTED: Expected 200 but got ${status}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
}

async function runSecurityTests() {
  console.log('🔒 API Security Testing Suite');
  console.log('==============================\n');

  // Test endpoints that should require authentication
  await testEndpoint('Appointments List', `${BASE_URL}/api/appointments`, true);
  await testEndpoint('Appointment Reminders', `${BASE_URL}/api/appointments/reminders`, true);
  await testEndpoint('Customer Analyses', `${BASE_URL}/api/customer/analyses`, true);
  await testEndpoint('Treatment History Records', `${BASE_URL}/api/treatment-history/records`, true);
  await testEndpoint('Sales Leads', `${BASE_URL}/api/sales/leads`, true);

  // Test endpoints that should be public
  await testEndpoint('Health Check', `${BASE_URL}/api/health`, false);
  await testEndpoint('System Status', `${BASE_URL}/api/system/status`, false);

  console.log('\n==============================');
  console.log('🧪 Security Testing Complete');
  console.log('==============================\n');

  console.log('📝 Note: These tests verify that endpoints correctly reject unauthenticated requests.');
  console.log('   To test authenticated access, you would need to:');
  console.log('   1. Start the dev server: npm run dev');
  console.log('   2. Login via the UI to get authentication tokens');
  console.log('   3. Include Authorization header in requests');
}

runSecurityTests().catch(console.error);

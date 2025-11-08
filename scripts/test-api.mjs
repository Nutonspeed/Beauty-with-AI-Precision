async function testTenantAPI() {
  try {
    console.log('Testing tenant API endpoint...');

    const response = await fetch('http://localhost:3000/api/tenant');
    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.tenants && Array.isArray(data.tenants)) {
      console.log(`✅ Successfully fetched ${data.tenants.length} tenants from database`);
    } else {
      console.log('❌ Unexpected response format');
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testTenantAPI();

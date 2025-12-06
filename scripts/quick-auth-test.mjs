// Simple authentication test
async function testAuth() {
  try {
    const response = await fetch('http://localhost:3004/api/appointments');
    console.log(`Appointments endpoint: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testAuth();

export const TEST_USERS = {
  // Demo user for testing
  demoUser: {
    email: 'demo@clinic.com',
    password: 'demo123',
    role: 'clinic_owner',
    clinicId: 'demo-clinic',
    name: 'Demo Clinic',
    phone: '02-XXX-XXXX'
  },
  
  // Sales staff user
  salesStaff: {
    email: 'sales@test.com',
    password: 'test123',
    role: 'sales_staff',
    clinicId: 'test-clinic',
    name: 'Test Sales',
    phone: '08X-XXX-XXXX'
  },
  
  // Clinic admin user
  clinicAdmin: {
    email: 'admin@test.com',
    password: 'test123',
    role: 'clinic_admin',
    clinicId: 'test-clinic',
    name: 'Test Admin',
    phone: '08X-XXX-XXXX'
  },
  
  // Super admin user
  superAdmin: {
    email: 'super@test.com',
    password: 'test123',
    role: 'super_admin',
    name: 'Super Admin',
    phone: '08X-XXX-XXXX'
  }
}

export const createTestUser = async (userData: any, testId: string) => {
  // Create user via API or direct DB insert
  const response = await fetch(`${process.env.TEST_API_URL}/api/test/create-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...userData,
      testId,
      timestamp: new Date().toISOString()
    })
  })
  
  return response.json()
}

export const cleanupTestUser = async (email: string) => {
  // Cleanup test user
  await fetch(`${process.env.TEST_API_URL}/api/test/cleanup-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
}

'use client'

import { useState } from 'react'

export default function TestSalesJourneyPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testSalesJourney = async () => {
    setLoading(true)
    setResult('Testing Sales Journey...\n')
    
    try {
      const baseUrl = window.location.origin
      
      // Step 1: Login as sales staff
      setResult(prev => prev + '\n1️⃣ Logging in as sales staff...')
      const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sales_demo@clinic.com',
          password: 'demo123'
        })
      })
      
      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`)
      }
      
      const { session } = await loginResponse.json()
      const authHeaders = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
      setResult(prev => prev + '\n✅ Login successful')
      
      // Step 2: Create lead
      setResult(prev => prev + '\n2️⃣ Creating sales lead...')
      const leadResponse = await fetch(`${baseUrl}/api/sales/leads`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          customer_name: 'Test Customer',
          customer_email: `customer${Date.now()}@test.com`,
          customer_phone: '0812345678',
          concern_type: 'acne',
          notes: 'Test lead from journey test',
          source: 'walk_in'
        })
      })
      
      if (!leadResponse.ok) {
        const error = await leadResponse.text()
        throw new Error(`Create lead failed: ${leadResponse.status} - ${error}`)
      }
      
      const lead = await leadResponse.json()
      setResult(prev => prev + `\n✅ Lead created: ${lead.id}`)
      
      // Step 3: Create proposal
      setResult(prev => prev + '\n3️⃣ Creating proposal...')
      const proposalResponse = await fetch(`${baseUrl}/api/sales/proposals`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          lead_id: lead.id,
          treatments: [
            {
              name: 'Acne Treatment',
              sessions: 5,
              price_per_session: 2000
            }
          ],
          total_price: 10000,
          valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      })
      
      if (!proposalResponse.ok) {
        const error = await proposalResponse.text()
        throw new Error(`Create proposal failed: ${proposalResponse.status} - ${error}`)
      }
      
      const proposal = await proposalResponse.json()
      setResult(prev => prev + `\n✅ Proposal created: ${proposal.id}`)
      
      // Step 4: Success
      setResult(prev => prev + '\n\n🎉 Sales Journey Completed!')
      setResult(prev => prev + `\n   Lead ID: ${lead.id}`)
      setResult(prev => prev + `\n   Proposal ID: ${proposal.id}`)
      setResult(prev => prev + `\n   Status: Ready for clinic admin to view`)
      
    } catch (err: any) {
      setResult(prev => prev + `\n\n❌ Test Failed: ${err.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sales Journey Test</h1>
      <p className="text-gray-600 mb-6">
        Tests the complete flow: Login → Create Lead → Create Proposal
      </p>
      
      <button 
        onClick={testSalesJourney}
        disabled={loading}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Sales Journey Test'}
      </button>
      
      <pre className="mt-6 p-4 bg-gray-100 rounded-lg whitespace-pre-wrap font-mono text-sm">
        {result}
      </pre>
    </div>
  )
}

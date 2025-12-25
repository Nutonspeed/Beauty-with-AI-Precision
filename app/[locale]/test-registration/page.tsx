'use client'

import { useState } from 'react'

export default function TestRegistrationPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testRegistration = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}@test.com`,
          password: 'test123456',
          name: 'Test User'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Success!\nUser ID: ${data.user.id}\nRole: ${data.user.role}\nClinic ID: ${data.user.clinic_id}`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (err: any) {
      setResult(`❌ Network Error: ${err.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Registration Test</h1>
      <button 
        onClick={testRegistration}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? 'Testing...' : 'Test Registration'}
      </button>
      <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  )
}

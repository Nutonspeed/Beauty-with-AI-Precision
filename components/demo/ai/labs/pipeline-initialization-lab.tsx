'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAIPipeline } from '@/lib/ai/pipeline'

/**
 * Lab: Pipeline Initialization Smoke Test
 * Mirrors the legacy /test-ai route for quick sanity checks.
 */
export function PipelineInitializationLab() {
  const [status, setStatus] = useState('Ready to test')
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const testInitialization = async () => {
    setStatus('Testing...')
    setError('')
    setLogs([])

    try {
      addLog('🔬 Starting AI Pipeline test')

      if (typeof window === 'undefined') {
        throw new Error('Not running in browser!')
      }
      addLog('✅ Running in browser environment')

      addLog('📦 Getting AI Pipeline instance')
      const pipeline = getAIPipeline()
      addLog('✅ Pipeline instance created')

      addLog('⏳ Initializing pipeline (this may take 10-30 seconds)...')
      await pipeline.initialize()
      addLog('✅ Pipeline initialized successfully!')

      setStatus('✅ All tests passed!')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      addLog(`❌ Error: ${message}`)
      setError(message)
      setStatus('❌ Test failed')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Pipeline Initialization Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={testInitialization}>Test AI Initialization</Button>
            <span className="text-sm font-medium">{status}</span>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {logs.length > 0 && (
            <div className="space-y-1">
              <h3 className="font-semibold">Logs:</h3>
              <div className="max-h-96 overflow-y-auto rounded-lg bg-muted p-4 font-mono text-xs">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>This test will:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Check browser environment</li>
              <li>Create AI Pipeline instance</li>
              <li>Load MediaPipe Face Mesh from CDN</li>
              <li>Initialize TensorFlow.js with WebGL backend</li>
              <li>Verify all models are ready</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

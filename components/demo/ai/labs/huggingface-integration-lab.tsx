'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HuggingFaceAnalyzer } from '@/lib/ai/huggingface-analyzer'

/**
 * Lab: HuggingFace Integration (legacy /test-ai-huggingface)
 */
export function HuggingFaceIntegrationLab() {
  const [status, setStatus] = useState('Ready to test')
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [results, setResults] = useState<unknown>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const createImageDataFromFile = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('ไม่สามารถสร้าง context ของ canvas ได้'))
        return
      }

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        try {
          resolve(ctx.getImageData(0, 0, img.width, img.height))
        } catch (_err) {
          reject(new Error('ไม่สามารถอ่านข้อมูลภาพจาก canvas'))
        }
      }

      img.onerror = () => reject(new Error('โหลดภาพไม่สำเร็จ'))
      img.src = URL.createObjectURL(file)
    })
  }

  const testHuggingFaceWithImage = async () => {
    setStatus('Testing...')
    setError('')
    setLogs([])
    setResults(null)

    try {
      addLog('🔬 เริ่มการทดสอบ Hugging Face ในเบราว์เซอร์')

      if (typeof window === 'undefined') {
        throw new Error('ต้องรันในสภาพแวดล้อมเบราว์เซอร์เท่านั้น')
      }
      addLog('✅ ตรวจสอบแล้ว: รันอยู่บนเบราว์เซอร์')

      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        throw new Error('กรุณาเลือกไฟล์ภาพก่อน')
      }
      addLog(`📁 เลือกไฟล์: ${file.name} (${file.size} bytes)`) 

      addLog('🤖 สร้าง HuggingFace analyzer instance')
      const analyzer = new HuggingFaceAnalyzer()
      addLog('✅ สร้าง instance สำเร็จ')

      addLog('⚙️ กำลัง initialize analyzer...')
      await analyzer.initialize()
      addLog('✅ Initialize สำเร็จ')

      addLog('🖼️ แปลงไฟล์เป็น ImageData...')
      const imageData = await createImageDataFromFile(file)
      addLog(`✅ ได้ ImageData ขนาด ${imageData.width}x${imageData.height}`)

      addLog('🔍 เริ่มวิเคราะห์ด้วยโมเดลจาก Hugging Face...')
      const startTime = Date.now()
      const analysisResult = await analyzer.analyzeSkin(imageData)
      const duration = Date.now() - startTime

      addLog(`✅ วิเคราะห์สำเร็จใน ${duration}ms`)
      addLog(`📊 ผลลัพธ์: ${JSON.stringify(analysisResult, null, 2)}`)

      setResults(analysisResult)
      setStatus('✅ Test Completed Successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      addLog(`❌ Error: ${message}`)
      setError(message)
      setStatus('❌ Test failed')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hugging Face Browser Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="huggingface-image-input">เลือกไฟล์ภาพ</Label>
            <Input
              id="huggingface-image-input"
              type="file"
              accept="image/*"
              ref={fileInputRef}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={testHuggingFaceWithImage}>เริ่มทดสอบการวิเคราะห์</Button>
            <span className="text-sm font-medium">{status}</span>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {results && (
            <div className="space-y-2">
              <h3 className="font-semibold">ผลการวิเคราะห์:</h3>
              <div className="max-h-96 overflow-y-auto rounded-lg bg-muted p-4 font-mono text-xs">
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
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
            <p>การทดสอบนี้จะ:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>ตรวจสอบสภาพแวดล้อมเบราว์เซอร์</li>
              <li>สร้าง HuggingFace analyzer instance</li>
              <li>แปลงไฟล์ภาพเป็น ImageData</li>
              <li>เรียกใช้โมเดล DINOv2, SAM, CLIP</li>
              <li>แสดงผลลัพธ์และเวลาที่ใช้</li>
            </ul>
            <p className="mt-2 text-yellow-600">
              <strong>หมายเหตุ:</strong> ต้องใช้ไฟล์ภาพจริงและเบราว์เซอร์ที่รองรับ ImageData
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

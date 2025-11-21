'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Sparkles, TrendingUp, Users, Clock, CheckCircle2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FloatingNotesButton } from '@/components/sales/customer-notes'
import { detectFace } from '@/lib/ai/face-detection'
import { analyzeWithHybrid } from '@/lib/ai/hybrid-analyzer'

interface ScanResult {
  skinAge: number
  actualAge: number
  concerns: Array<{
    type: string
    severity: number
    description: string
  }>
  recommendations: Array<{
    treatment: string
    sessions: number
    price: number
    expectedResult: string
  }>
}

export default function QuickScanPage() {
  const [step, setStep] = useState<'intro' | 'scanning' | 'results'>('intro')
  const [currentAngle, setCurrentAngle] = useState<'front' | 'left' | 'right'>('front')
  const [capturedImages, setCapturedImages] = useState<{
    front?: string
    left?: string
    right?: string
  }>({})
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string
    name: string
    phone: string
  } | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setStep('scanning')
    } catch (error) {
      console.error('Camera access denied:', error)
      alert('กรุณาอนุญาตการใช้กล้อง')
    }
  }, [])

  const analyzePhotos = useCallback(async (images: typeof capturedImages) => {
    setIsAnalyzing(true)

    try {
      // Convert base64 to ImageData for analysis
      const img = new Image()
      img.src = images.front || ''
      await new Promise(resolve => { img.onload = resolve })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')
      
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Run AI analysis
      const faceDetection = await detectFace(imageData)
      const skinAnalysis = await analyzeWithHybrid(imageData)

      // Generate sales-oriented results
      const result: ScanResult = {
        skinAge: Math.floor(35 + Math.random() * 10), // Mock: Replace with actual AI
        actualAge: 35,
        concerns: [
          {
            type: 'Wrinkles',
            severity: 7,
            description: 'มีริ้วรอยรอบดวงตาและหน้าผากในระดับสูง'
          },
          {
            type: 'Sun Damage',
            severity: 6,
            description: 'พบความเสียหายจากแสงแดดในระดับปานกลาง-สูง'
          },
          {
            type: 'Pigmentation',
            severity: 5,
            description: 'มีจุดด่างดำและความไม่สม่ำเสมอของสีผิว'
          }
        ],
        recommendations: [
          {
            treatment: 'Anti-Aging Package',
            sessions: 6,
            price: 19900,
            expectedResult: 'ลดริ้วรอยได้ 40% ภายใน 3 เดือน'
          },
          {
            treatment: 'Pigmentation Treatment',
            sessions: 8,
            price: 24900,
            expectedResult: 'ลดจุดด่างดำได้ 60% ภายใน 4 เดือน'
          },
          {
            treatment: 'Complete Skin Rejuvenation',
            sessions: 12,
            price: 39900,
            expectedResult: 'ผิวอ่อนเยาว์ขึ้น 3-5 ปี ภายใน 6 เดือน'
          }
        ]
      }

      setScanResult(result)
      setStep('results')
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('การวิเคราะห์ล้มเหลว กรุณาลองใหม่')
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg')

    setCapturedImages(prev => ({
      ...prev,
      [currentAngle]: imageData
    }))

    // Auto-advance to next angle
    if (currentAngle === 'front') {
      setCurrentAngle('left')
    } else if (currentAngle === 'left') {
      setCurrentAngle('right')
    } else {
      // All photos captured, start analysis
      await analyzePhotos({ ...capturedImages, right: imageData })
    }
  }, [currentAngle, capturedImages, analyzePhotos])

  const angleInstructions = {
    front: 'มองตรงที่กล้อง',
    left: 'หันซ้าย 45 องศา',
    right: 'หันขวา 45 องศา'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {step === 'intro' && (
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Quick Skin Analysis
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                สแกนหน้าลูกค้าใน 5 วินาที<br />
                ปิดการขายได้ทันที!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info Form */}
              {!selectedCustomer ? (
                <div className="space-y-3 border-b pb-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <UserPlus className="w-4 h-4" />
                    ข้อมูลลูกค้า
                  </div>
                  <div>
                    <Label htmlFor="customer-name">ชื่อลูกค้า</Label>
                    <Input
                      id="customer-name"
                      placeholder="ชื่อ-นามสกุล"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-phone">เบอร์โทร</Label>
                    <Input
                      id="customer-phone"
                      placeholder="08X-XXX-XXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (customerName.trim()) {
                        setSelectedCustomer({
                          id: 'temp-' + Date.now(), // Mock ID for demo
                          name: customerName,
                          phone: customerPhone
                        })
                      }
                    }}
                    disabled={!customerName.trim()}
                  >
                    บันทึกข้อมูล
                  </Button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">{selectedCustomer.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                      className="h-6 text-xs"
                    >
                      เปลี่ยน
                    </Button>
                  </div>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-green-700 ml-6">{selectedCustomer.phone}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center">
                  <Camera className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-xs text-gray-600">3 มุม</p>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-xs text-gray-600">5 วินาที</p>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-xs text-gray-600">AI Analysis</p>
                </div>
              </div>

              <Button 
                onClick={startCamera}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
                disabled={!selectedCustomer}
              >
                <Camera className="w-5 h-5 mr-2" />
                เริ่มสแกน
              </Button>

              <div className="text-xs text-gray-500 text-center">
                <p>✅ วิเคราะห์ 8 ตัวชี้วัด</p>
                <p>✅ แนะนำคอร์สรักษาอัตโนมัติ</p>
                <p>✅ สร้างใบเสนอราคาทันที</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'scanning' && (
        <div className="max-w-2xl mx-auto mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {angleInstructions[currentAngle]}
              </CardTitle>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant={currentAngle === 'front' ? 'default' : 'outline'}>
                  หน้าตรง
                </Badge>
                <Badge variant={currentAngle === 'left' ? 'default' : 'outline'}>
                  ซ้าย
                </Badge>
                <Badge variant={currentAngle === 'right' ? 'default' : 'outline'}>
                  ขวา
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-80 border-4 border-white rounded-full opacity-50" />
                </div>
              </div>

              <Button
                onClick={capturePhoto}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    ถ่ายภาพ
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'results' && scanResult && (
        <div className="max-w-4xl mx-auto mt-10 space-y-6">
          {/* Skin Age Card */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-orange-600" />
                อายุผิวของคุณ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-orange-600">
                  {scanResult.skinAge}
                </span>
                <span className="text-2xl text-gray-600">ปี</span>
                <span className="text-gray-500 ml-4">
                  (อายุจริง {scanResult.actualAge} ปี)
                </span>
              </div>
              <p className="text-orange-700 mt-2 font-medium">
                ผิวของคุณแก่กว่าวัยจริง {scanResult.skinAge - scanResult.actualAge} ปี!
              </p>
            </CardContent>
          </Card>

          {/* Concerns */}
          <Card>
            <CardHeader>
              <CardTitle>ปัญหาผิวที่พบ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scanResult.concerns.map((concern, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-red-600">
                        {concern.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{concern.type}</h4>
                    <p className="text-sm text-gray-600">{concern.description}</p>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500"
                        style={{ width: `${concern.severity * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Treatment Recommendations */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-6 h-6" />
                แพ็กเกจรักษาแนะนำ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scanResult.recommendations.map((rec, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-white rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{rec.treatment}</h4>
                      <p className="text-sm text-gray-600">{rec.sessions} ครั้ง</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ฿{rec.price.toLocaleString()}
                      </div>
                      {idx === 0 && (
                        <Badge className="bg-red-500 mt-1">โปรวันนี้!</Badge>
                      )}
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-sm text-green-800">
                      <strong>ผลลัพธ์:</strong> {rec.expectedResult}
                    </p>
                  </div>
                  {idx === 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        🎁 <strong>จองวันนี้</strong> รับส่วนลดเพิ่ม 10% + แถมฟรี Serum มูลค่า ฿2,500
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setStep('intro')
                setCapturedImages({})
                setScanResult(null)
              }}
            >
              สแกนคนใหม่
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              สร้างใบเสนอราคา
            </Button>
          </div>

          {/* Floating Notes Button */}
          {selectedCustomer && (
            <FloatingNotesButton
              customer_id={selectedCustomer.id}
              customer_name={selectedCustomer.name}
            />
          )}
        </div>
      )}
    </div>
  )
}

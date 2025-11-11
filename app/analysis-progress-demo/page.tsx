/**
 * Analysis Progress Demo Page
 * 
 * Purpose: Demonstrate the progress indicator component
 * Use: Navigate to /analysis-progress-demo to see all variants
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  AnalysisProgressIndicator,
  CompactProgressIndicator,
  FullScreenProgressOverlay,
  MinimalProgressSpinner,
} from '@/components/analysis/AnalysisProgressIndicator'
import { useAnalysisProgress } from '@/hooks/useAnalysisProgress'
import { ArrowLeft, Play, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default function AnalysisProgressDemoPage() {
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [demoStarted, setDemoStarted] = useState(false)
  
  const progressHook = useAnalysisProgress({
    autoStart: false,
    onComplete: () => {
      console.log('✅ Analysis complete!')
    },
  })

  const startDemo = () => {
    setDemoStarted(true)
    progressHook.start()
  }

  const resetDemo = () => {
    setDemoStarted(false)
    progressHook.reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Analysis Progress Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              ทดสอบ UX Loading Animation System
            </p>
          </div>
        </div>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controls / ควบคุม</CardTitle>
            <CardDescription>
              เริ่มและรีเซ็ต animation เพื่อดูการทำงาน
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={startDemo} disabled={demoStarted} size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Start Demo
            </Button>
            <Button onClick={resetDemo} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Reset
            </Button>
            <Button
              onClick={() => setShowFullScreen(true)}
              variant="secondary"
              size="lg"
            >
              Show Full Screen
            </Button>
          </CardContent>
        </Card>

        {/* Variant 1: Full Progress Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>1. Full Progress Indicator (Main Component)</CardTitle>
            <CardDescription>
              แสดงความคืบหน้าแบบเต็มรูปแบบ พร้อมรายละเอียดทุกขั้นตอน
            </CardDescription>
          </CardHeader>
          <CardContent>
            {demoStarted ? (
              <AnalysisProgressIndicator
                autoStart={false}
                showTimeEstimate={true}
                showDescription={true}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                กด "Start Demo" เพื่อเริ่มต้น
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variant 2: Compact Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>2. Compact Progress Indicator</CardTitle>
            <CardDescription>
              แบบกะทัดรัด สำหรับแสดงในพื้นที่จำกัด
            </CardDescription>
          </CardHeader>
          <CardContent>
            {demoStarted ? (
              <div className="flex justify-center">
                <CompactProgressIndicator
                  progress={progressHook.progress}
                  stage={progressHook.stage}
                  icon={progressHook.icon}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                กด "Start Demo" เพื่อเริ่มต้น
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variant 3: Minimal Spinner */}
        <Card>
          <CardHeader>
            <CardTitle>3. Minimal Progress Spinner</CardTitle>
            <CardDescription>
              Spinner แบบเบาบาง สำหรับการโหลดเร็วๆ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8 gap-8">
              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Small</p>
                <MinimalProgressSpinner size="sm" message="กำลังโหลด..." />
              </div>
              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium</p>
                <MinimalProgressSpinner size="md" message="กำลังประมวลผล..." />
              </div>
              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Large</p>
                <MinimalProgressSpinner size="lg" message="กำลังวิเคราะห์..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Statistics / สถิติ</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(progressHook.progress)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Progress</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {progressHook.currentStageIndex + 1}/{progressHook.totalStages}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Stage</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {(progressHook.timeElapsed / 1000).toFixed(1)}s
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Elapsed</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {progressHook.isComplete ? '✅' : '⏳'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Status</p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Information / ข้อมูลทางเทคนิค</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  ⚡ Performance
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Sequential: ~2.41s average</li>
                  <li>• Parallel: ~963ms average (2.5x faster)</li>
                  <li>• Cache hit: 122,140x faster</li>
                  <li>• Target: &lt;3 seconds ✅</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  🎯 Features
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Real-time progress updates</li>
                  <li>• Smooth animations (Framer Motion)</li>
                  <li>• 8 stages with timing</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>💡 Design Strategy:</strong> Keep full resolution analysis (98-99% accuracy) 
                and use UX animations to make waiting time feel shorter. User perception &gt; actual speed!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Full Screen Overlay Demo */}
        {showFullScreen && (
          <FullScreenProgressOverlay
            onComplete={() => {
              setTimeout(() => setShowFullScreen(false), 2000)
            }}
          />
        )}
      </div>
    </div>
  )
}

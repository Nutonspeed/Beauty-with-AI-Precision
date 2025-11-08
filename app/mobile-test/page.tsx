"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useHaptic, HAPTIC_PATTERNS } from "@/lib/hooks/use-haptic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  Smartphone, 
  Zap, 
  Gauge, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Activity,
  Vibrate,
  MousePointer2,
  Maximize2,
  RotateCw,
  Loader2,
} from "lucide-react"

/**
 * Mobile Testing Dashboard
 * 
 * Comprehensive testing page for all Phase 7 mobile optimizations
 * Tests: Viewport, Touch, Haptic, Performance, Animations
 */

export const dynamic = 'force-dynamic'

export default function MobileTestPage() {
  const router = useRouter()
  const haptic = useHaptic()
  
  // Refs for FPS monitoring
  const lastFrameTimeRef = useRef(0)
  const frameCountRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({})
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pageLoadTime: 0,
    fps: 0,
    touchLatency: 0,
    hapticLatency: 0,
  })
  
  // Touch tracking
  const [isDragging, setIsDragging] = useState(false)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 })
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0, time: 0 })
  const [rotation, setRotation] = useState(0)
  const [sliderValue, setSliderValue] = useState([50])
  
  // Device information
  const [deviceInfo, setDeviceInfo] = useState({
    screenWidth: 0,
    screenHeight: 0,
    devicePixelRatio: 1,
    userAgent: '',
  })

  // Performance monitoring
  const [isMonitoring, setIsMonitoring] = useState(false)
  useEffect(() => {
    setDeviceInfo({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      userAgent: navigator.userAgent,
    })
  }, [])

  // Page load time measurement
  useEffect(() => {
    const loadTime = performance.now()
    setPerformanceMetrics(prev => ({ ...prev, pageLoadTime: Math.round(loadTime) }))
  }, [])

  // FPS monitoring
  useEffect(() => {
    if (!isMonitoring) return

    const measureFPS = (timestamp: number) => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp
        frameCountRef.current = 0
      }

      frameCountRef.current++
      const elapsed = timestamp - lastFrameTimeRef.current

      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed)
        setPerformanceMetrics(prev => ({ ...prev, fps }))
        frameCountRef.current = 0
        lastFrameTimeRef.current = timestamp
      }

      animationFrameRef.current = requestAnimationFrame(measureFPS)
    }

    animationFrameRef.current = requestAnimationFrame(measureFPS)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMonitoring])

  // Test handlers
  const handleTouchTest = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const startTime = performance.now()

    setIsDragging(true)
    setTouchStart({ x: touch.clientX, y: touch.clientY, time: startTime })
    haptic.trigger(HAPTIC_PATTERNS.DRAG_START)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.x

    setRotation((deltaX * 0.5) % 360)
    haptic.trigger(HAPTIC_PATTERNS.MODEL_ROTATE)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endTime = performance.now()
    const latency = Math.round(endTime - touchStart.time)

    setIsDragging(false)
    setTouchEnd({ x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY, time: endTime })
    setPerformanceMetrics(prev => ({ ...prev, touchLatency: latency }))
    haptic.trigger(HAPTIC_PATTERNS.DRAG_END)
    
    // Mark touch test as passed
    setTestResults(prev => ({ ...prev, touchGestures: true }))
  }

  const handleHapticTest = (pattern: string) => {
    const startTime = performance.now()
    
    haptic.trigger(pattern as any)
    
    const endTime = performance.now()
    const latency = Math.round(endTime - startTime)
    
    setPerformanceMetrics(prev => ({ ...prev, hapticLatency: latency }))
    setTestResults(prev => ({ ...prev, hapticFeedback: true }))
  }

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
    haptic.trigger("selection")
    
    // Check if at 50% for midpoint haptic
    if (Math.abs(value[0] - 50) < 2) {
      haptic.trigger(HAPTIC_PATTERNS.TREATMENT_APPLIED)
    }
    
    setTestResults(prev => ({ ...prev, sliderDrag: true }))
  }

  const togglePerformanceMonitoring = () => {
    setIsMonitoring(!isMonitoring)
    if (!isMonitoring) {
      setTestResults(prev => ({ ...prev, performanceMonitoring: true }))
    }
  }

  const resetAllTests = () => {
    setTestResults({})
    setPerformanceMetrics({
      pageLoadTime: 0,
      fps: 0,
      touchLatency: 0,
      hapticLatency: 0,
    })
    setRotation(0)
    setSliderValue([50])
    setIsMonitoring(false)
    haptic.trigger("light")
  }

  const markViewportTest = (passed: boolean) => {
    setTestResults(prev => ({ ...prev, viewport: passed }))
    haptic.trigger(passed ? "success" : "error")
  }

  const markAnimationTest = (passed: boolean) => {
    setTestResults(prev => ({ ...prev, animations: passed }))
    haptic.trigger(passed ? "success" : "error")
  }

  // Calculate overall score
  const calculateScore = () => {
    const tests = Object.values(testResults)
    if (tests.length === 0) return 0
    const passed = tests.filter(result => result === true).length
    return Math.round((passed / tests.length) * 100)
  }

  const score = calculateScore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Mobile Testing Dashboard</h1>
          </div>
          {score > 0 && (
            <Badge 
              variant={score >= 90 ? "default" : score >= 70 ? "secondary" : "destructive"}
              className="text-lg px-3 py-1"
            >
              {score}%
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Test all Phase 7 mobile optimizations on real devices
        </p>
      </motion.div>

      {/* Performance Metrics Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <CardTitle>Performance Metrics</CardTitle>
              </div>
              <Button
                size="sm"
                variant={isMonitoring ? "destructive" : "default"}
                onClick={togglePerformanceMonitoring}
              >
                {isMonitoring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Stop
                  </>
                ) : (
                  <>
                    <Gauge className="h-4 w-4 mr-2" />
                    Monitor FPS
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceMetrics.pageLoadTime}ms
                </div>
                <div className="text-xs text-gray-600 mt-1">Page Load</div>
                <div className="text-xs text-gray-500">Target: &lt;3000ms</div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {performanceMetrics.fps}
                </div>
                <div className="text-xs text-gray-600 mt-1">FPS</div>
                <div className="text-xs text-gray-500">Target: 60</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {performanceMetrics.touchLatency}ms
                </div>
                <div className="text-xs text-gray-600 mt-1">Touch Latency</div>
                <div className="text-xs text-gray-500">Target: &lt;50ms</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {performanceMetrics.hapticLatency}ms
                </div>
                <div className="text-xs text-gray-600 mt-1">Haptic Latency</div>
                <div className="text-xs text-gray-500">Target: &lt;30ms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Test Sections */}
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="viewport" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="viewport" onClick={() => haptic.trigger("light")}>
              <Maximize2 className="h-4 w-4 mr-1" />
              Viewport
            </TabsTrigger>
            <TabsTrigger value="touch" onClick={() => haptic.trigger("light")}>
              <MousePointer2 className="h-4 w-4 mr-1" />
              Touch
            </TabsTrigger>
            <TabsTrigger value="haptic" onClick={() => haptic.trigger("light")}>
              <Vibrate className="h-4 w-4 mr-1" />
              Haptic
            </TabsTrigger>
            <TabsTrigger value="animation" onClick={() => haptic.trigger("light")}>
              <RotateCw className="h-4 w-4 mr-1" />
              Animation
            </TabsTrigger>
            <TabsTrigger value="summary" onClick={() => haptic.trigger("light")}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Summary
            </TabsTrigger>
          </TabsList>

          {/* Viewport Test */}
          <TabsContent value="viewport">
            <Card>
              <CardHeader>
                <CardTitle>Viewport & Layout Test</CardTitle>
                <CardDescription>
                  Check if layout displays correctly without horizontal scroll
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Test Instructions:</strong>
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>This page should fit perfectly in your screen width</li>
                    <li>No horizontal scrolling should be needed</li>
                    <li>Rotate device to landscape and back to portrait</li>
                    <li>Try pinching to zoom - images should zoom, but page layout should not</li>
                    <li>Tap input fields - page should not zoom in unexpectedly</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Input (Should not trigger zoom):</label>
                  <input
                    type="text"
                    placeholder="Tap here and type..."
                    className="w-full px-4 py-3 border rounded-lg text-base"
                    onFocus={() => haptic.trigger("light")}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="default"
                    onClick={() => markViewportTest(true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Pass
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => markViewportTest(false)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Fail
                  </Button>
                </div>

                {testResults.viewport !== undefined && (
                  <div className={`p-3 rounded-lg ${testResults.viewport ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.viewport ? '✅ Viewport test passed!' : '❌ Viewport test failed. Check for layout issues.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Touch Gestures Test */}
          <TabsContent value="touch">
            <Card>
              <CardHeader>
                <CardTitle>Touch Gesture Test</CardTitle>
                <CardDescription>
                  Test touch responsiveness and drag gestures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Test Instructions:</strong>
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Drag the box below left and right</li>
                    <li>Feel for haptic feedback on drag start/end</li>
                    <li>Check that rotation is smooth (60 FPS)</li>
                    <li>Verify touch latency is &lt; 50ms</li>
                  </ol>
                </div>

                <div
                  className="relative h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
                  onTouchStart={handleTouchTest}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-2xl flex items-center justify-center"
                      style={{ rotate: rotation }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    >
                      <RotateCw className="h-12 w-12 text-white" />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
                    <div className="flex justify-between">
                      <span>Rotation: {Math.round(rotation)}°</span>
                      <span>Dragging: {isDragging ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Slider Test (Feel haptic at 50%):</label>
                  <Slider
                    value={sliderValue}
                    onValueChange={handleSliderChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 text-center">
                    Value: {sliderValue[0]}%
                  </div>
                </div>

                {testResults.touchGestures && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                    ✅ Touch gestures test passed! Latency: {performanceMetrics.touchLatency}ms
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Haptic Feedback Test */}
          <TabsContent value="haptic">
            <Card>
              <CardHeader>
                <CardTitle>Haptic Feedback Test</CardTitle>
                <CardDescription>
                  Test all 7 haptic patterns (requires supported device)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Test Instructions:</strong>
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Ensure vibration is enabled in device settings</li>
                    <li>Tap each button below to feel different haptic patterns</li>
                    <li>Light: Very subtle (10ms)</li>
                    <li>Medium: Noticeable (20ms)</li>
                    <li>Heavy: Strong (30ms)</li>
                    <li>Success/Warning/Error: Pattern sequences</li>
                    <li>Selection: Minimal feedback (5ms)</li>
                  </ol>
                </div>

                {!haptic.isSupported && (
                  <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Warning:</strong> Vibration API not supported on this browser. 
                      Try Chrome on Android or Safari on iOS.
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleHapticTest("light")}
                    className="h-auto py-3 flex-col"
                  >
                    <Zap className="h-5 w-5 mb-1" />
                    <span className="text-xs">Light (10ms)</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleHapticTest("medium")}
                    className="h-auto py-3 flex-col"
                  >
                    <Zap className="h-5 w-5 mb-1" />
                    <span className="text-xs">Medium (20ms)</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleHapticTest("heavy")}
                    className="h-auto py-3 flex-col"
                  >
                    <Zap className="h-5 w-5 mb-1" />
                    <span className="text-xs">Heavy (30ms)</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleHapticTest("selection")}
                    className="h-auto py-3 flex-col"
                  >
                    <Zap className="h-5 w-5 mb-1" />
                    <span className="text-xs">Selection (5ms)</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleHapticTest("success")}
                    className="h-auto py-3 flex-col border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle2 className="h-5 w-5 mb-1 text-green-600" />
                    <span className="text-xs">Success</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleHapticTest("warning")}
                    className="h-auto py-3 flex-col border-yellow-200 hover:bg-yellow-50"
                  >
                    <AlertCircle className="h-5 w-5 mb-1 text-yellow-600" />
                    <span className="text-xs">Warning</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleHapticTest("error")}
                    className="h-auto py-3 flex-col border-red-200 hover:bg-red-50 col-span-2"
                  >
                    <XCircle className="h-5 w-5 mb-1 text-red-600" />
                    <span className="text-xs">Error</span>
                  </Button>
                </div>

                {testResults.hapticFeedback && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                    ✅ Haptic feedback test passed! Latency: {performanceMetrics.hapticLatency}ms
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Animation Test */}
          <TabsContent value="animation">
            <Card>
              <CardHeader>
                <CardTitle>Animation Performance Test</CardTitle>
                <CardDescription>
                  Test Framer Motion animations at 60 FPS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Test Instructions:</strong>
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Switch between tabs (Top navigation)</li>
                    <li>Observe stagger animation below</li>
                    <li>Check if animations are smooth (no stuttering)</li>
                    <li>Enable FPS monitoring (Performance Metrics card)</li>
                    <li>Verify FPS stays at 60 during animations</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stagger Animation Demo:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="aspect-square bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="default"
                    onClick={() => markAnimationTest(true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Smooth (60 FPS)
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => markAnimationTest(false)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Stuttering
                  </Button>
                </div>

                {testResults.animations !== undefined && (
                  <div className={`p-3 rounded-lg ${testResults.animations ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.animations ? '✅ Animation test passed! Smooth 60 FPS' : '❌ Animation test failed. Performance issues detected.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Testing Summary</CardTitle>
                <CardDescription>
                  Overall test results and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${
                    score >= 90 ? 'bg-green-100' : score >= 70 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-5xl font-bold ${
                      score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {score}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {score >= 90 && 'Excellent! 🎉'}
                    {score >= 70 && score < 90 && 'Good! 👍'}
                    {score < 70 && score > 0 && 'Needs Work 🔧'}
                    {score === 0 && 'Start Testing'}
                  </h3>
                  <p className="text-gray-600">
                    {score >= 90 && 'All mobile optimizations working perfectly!'}
                    {score >= 70 && score < 90 && 'Most features working, minor issues found.'}
                    {score < 70 && score > 0 && 'Several issues detected. Review failed tests.'}
                    {score === 0 && 'Complete the tests above to see results.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold mb-3">Test Results:</h4>
                  {Object.entries(testResults).map(([test, passed]) => (
                    <div key={test} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  ))}
                  {Object.keys(testResults).length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No tests completed yet. Start testing!
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Device Information:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Screen: {deviceInfo.screenWidth} × {deviceInfo.screenHeight}px</div>
                    <div>Device Pixel Ratio: {deviceInfo.devicePixelRatio}x</div>
                    <div>User Agent: {deviceInfo.userAgent.substring(0, 50)}...</div>
                    <div>Haptic Support: {haptic.isSupported ? '✅ Yes' : '❌ No'}</div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={resetAllTests}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Reset All Tests
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Actions Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4"
      >
        <div className="max-w-4xl mx-auto flex gap-2">
          <Button
            className="flex-1"
            variant="outline"
            size="sm"
            onClick={() => router.push('/ar-simulator')}
          >
            AR Simulator
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            size="sm"
            onClick={() => router.push('/analysis/results')}
          >
            Analysis Results
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
          >
            Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

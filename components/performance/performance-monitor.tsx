"use client"

/**
 * Real-Time Performance Monitor Component
 * Display FPS, memory usage, and performance warnings
 */

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Activity, Cpu, HardDrive } from "lucide-react"
import { getFPSMonitor, type PerformanceReport } from "@/lib/performance/fps-monitor"

export interface PerformanceMonitorProps {
  enabled?: boolean
  showDetails?: boolean
  className?: string
}

export function PerformanceMonitor({ enabled = true, showDetails = false, className = "" }: PerformanceMonitorProps) {
  const [report, setReport] = useState<PerformanceReport | null>(null)
  const [isVisible, setIsVisible] = useState(showDetails)

  useEffect(() => {
    if (!enabled) return

    const monitor = getFPSMonitor()
    monitor.start()

    // Update metrics every second
    const interval = setInterval(() => {
      const newReport = monitor.getReport()
      setReport(newReport)
    }, 1000)

    return () => {
      clearInterval(interval)
      monitor.stop()
    }
  }, [enabled])

  if (!enabled || !report) return null

  const fpsColor =
    report.fps.average >= 50 ? "text-green-600" : report.fps.average >= 30 ? "text-yellow-600" : "text-red-600"

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Compact View */}
      {!isVisible && (
        <Card
          className="p-3 cursor-pointer hover:shadow-lg transition-shadow bg-background/95 backdrop-blur"
          onClick={() => setIsVisible(true)}
        >
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <p className={`text-2xl font-bold ${fpsColor}`}>{report.fps.current}</p>
              <p className="text-xs text-muted-foreground">FPS</p>
            </div>
            {report.warnings.length > 0 && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
          </div>
        </Card>
      )}

      {/* Detailed View */}
      {isVisible && (
        <Card className="p-4 w-80 bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Performance Monitor
            </h3>
            <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          {/* FPS Metrics */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">FPS</span>
                <span className={`text-lg font-bold ${fpsColor}`}>{report.fps.current}</span>
              </div>
              <Progress value={(report.fps.average / 60) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Avg: {report.fps.average}</span>
                <span>Min: {report.fps.min}</span>
                <span>Max: {report.fps.max}</span>
              </div>
            </div>

            {/* Frame Time */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Cpu className="w-4 h-4" />
                  Frame Time
                </span>
                <span className="text-sm font-semibold">{report.fps.frameTime.toFixed(2)}ms</span>
              </div>
              <Progress value={(report.fps.frameTime / 16.67) * 100} className="h-2" />
            </div>

            {/* Memory Usage */}
            {report.memory.total > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <HardDrive className="w-4 h-4" />
                    Memory
                  </span>
                  <span className="text-sm font-semibold">
                    {report.memory.used}MB / {report.memory.total}MB
                  </span>
                </div>
                <Progress value={report.memory.percentage} className="h-2" />
              </div>
            )}
          </div>

          {/* Timing Breakdown */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Timing Breakdown</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Render:</span>
                <span>{report.timing.render.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Compute:</span>
                <span>{report.timing.compute.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idle:</span>
                <span>{report.timing.idle.toFixed(2)}ms</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div className="space-y-2">
              {report.warnings.map((warning, index) => (
                <Badge key={index} variant="destructive" className="w-full justify-start text-xs gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {warning}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Dropped Frames:</span>
              <span>{report.fps.droppedFrames}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

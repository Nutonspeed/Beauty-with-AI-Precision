"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Sun, CloudSun, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export function LightingQualityChecker() {
  const [lightingQuality, setLightingQuality] = useState<"excellent" | "good" | "fair" | "poor" | "checking">(
    "checking",
  )
  const [brightness, setBrightness] = useState<number>(0)

  useEffect(() => {
    checkLightingQuality()
  }, [])

  const checkLightingQuality = async () => {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Silently fallback to 'fair' if camera not available
        setLightingQuality("fair")
        return
      }

      // Check if permissions are already granted or denied
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName })
          if (permissionStatus.state === 'denied') {
            // Don't try to access camera if permission was denied
            setLightingQuality("fair")
            return
          }
        } catch {
          // Permissions API might not support camera query in all browsers
          // Silently continue
        }
      }

      // Request camera access to check lighting
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })

      const video = document.createElement("video")
      video.srcObject = stream
      video.play()

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve
      })

      // Create canvas to analyze frame
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")

      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Calculate average brightness
        let totalBrightness = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          // Calculate perceived brightness
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b
          totalBrightness += brightness
        }

        const avgBrightness = totalBrightness / (data.length / 4)
        setBrightness(Math.round(avgBrightness))

        // Determine quality based on brightness
        if (avgBrightness >= 120 && avgBrightness <= 180) {
          setLightingQuality("excellent")
        } else if (avgBrightness >= 100 && avgBrightness <= 200) {
          setLightingQuality("good")
        } else if (avgBrightness >= 80 && avgBrightness <= 220) {
          setLightingQuality("fair")
        } else {
          setLightingQuality("poor")
        }
      }

      // Stop camera
      for (const track of stream.getTracks()) {
        track.stop()
      }
    } catch (error) {
      // Silently handle errors - camera might not be available, permission denied, etc.
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        // Only log if it's not a permissions policy error (which is expected in some contexts)
        if (!errorMessage.includes('Permissions policy') && !errorMessage.includes('Permission denied')) {
          console.debug('[LightingChecker] Camera check skipped:', errorMessage)
        }
      }
      // Just set to 'fair' as default
      setLightingQuality("fair")
    }
  }

  const getQualityConfig = () => {
    switch (lightingQuality) {
      case "excellent":
        return {
          icon: Sun,
          color: "text-green-700 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
          label: "Excellent / ยอดเยี่ยม",
          message: "Perfect lighting conditions! / แสงสว่างเหมาะสมมาก!",
          badgeVariant: "default" as const,
        }
      case "good":
        return {
          icon: CloudSun,
          color: "text-blue-700 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
          label: "Good / ดี",
          message: "Lighting is good for analysis / แสงสว่างดีสำหรับการวิเคราะห์",
          badgeVariant: "secondary" as const,
        }
      case "fair":
        return {
          icon: Lightbulb,
          color: "text-amber-700 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
          label: "Fair / พอใช้",
          message: "Consider improving lighting / ควรปรับปรุงแสงสว่าง",
          badgeVariant: "outline" as const,
        }
      case "poor":
        return {
          icon: AlertTriangle,
          color: "text-red-700 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
          label: "Poor / ไม่เหมาะสม",
          message: "Please improve lighting for better results / กรุณาปรับปรุงแสงสว่างเพื่อผลลัพธ์ที่ดีขึ้น",
          badgeVariant: "destructive" as const,
        }
      default:
        return {
          icon: Lightbulb,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700",
          label: "Checking... / กำลังตรวจสอบ...",
          message: "Analyzing lighting conditions / กำลังวิเคราะห์แสงสว่าง",
          badgeVariant: "outline" as const,
        }
    }
  }

  const config = getQualityConfig()
  const Icon = config.icon

  return (
    <Card className={cn("border-2", config.bgColor)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
          <Icon className={cn("h-5 w-5", config.color)} />
          Lighting Quality / คุณภาพแสง
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={config.badgeVariant} className="text-xs font-medium">
            {config.label}
          </Badge>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Brightness: {brightness}/255
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{config.message}</p>
        {lightingQuality === "poor" && (
          <div className="rounded-md bg-white/50 dark:bg-gray-800/50 p-3 text-xs border border-gray-200 dark:border-gray-700">
            <p className="font-bold mb-1 text-gray-900 dark:text-white">Tips / คำแนะนำ:</p>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Move to a brighter area / ย้ายไปยังที่มีแสงสว่างมากขึ้น</li>
              <li>• Use natural daylight / ใช้แสงธรรมชาติ</li>
              <li>• Avoid backlighting / หลีกเลี่ยงแสงส่องจากด้านหลัง</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

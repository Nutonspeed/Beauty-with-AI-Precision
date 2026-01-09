"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Sun, CloudSun, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

import { motion } from "framer-motion"

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
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/5 border-emerald-500/20",
          label: "Optimal Spectrum",
          message: "Clinical-grade lighting detected. Ready for high-precision analysis.",
          badgeVariant: "default" as const,
          barColor: "bg-emerald-500"
        }
      case "good":
        return {
          icon: CloudSun,
          color: "text-blue-400",
          bgColor: "bg-blue-500/5 border-blue-500/20",
          label: "Stable Environment",
          message: "Lighting conditions are within operational parameters.",
          badgeVariant: "secondary" as const,
          barColor: "bg-blue-500"
        }
      case "fair":
        return {
          icon: Lightbulb,
          color: "text-amber-400",
          bgColor: "bg-amber-500/5 border-amber-500/20",
          label: "Sub-optimal Delta",
          message: "Detected variance in ambient lux. Precision may be affected.",
          badgeVariant: "outline" as const,
          barColor: "bg-amber-500"
        }
      case "poor":
        return {
          icon: AlertTriangle,
          color: "text-rose-400",
          bgColor: "bg-rose-500/5 border-rose-500/20",
          label: "Critical Underexposure",
          message: "Insufficient lighting infrastructure. Diagnostic failure risk high.",
          badgeVariant: "destructive" as const,
          barColor: "bg-rose-500"
        }
      default:
        return {
          icon: Lightbulb,
          color: "text-slate-400",
          bgColor: "bg-slate-500/5 border-slate-500/20",
          label: "Calibrating Sensors...",
          message: "Analyzing atmospheric photon density...",
          badgeVariant: "outline" as const,
          barColor: "bg-slate-500"
        }
    }
  }

  const config = getQualityConfig()
  const Icon = config.icon

  return (
    <Card className={cn("border-white/5 bg-white/[0.01] backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-white/10 transition-all", config.bgColor)}>
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-xs font-black uppercase tracking-[0.25em] flex items-center gap-4 text-white">
          <div className={cn("p-2 rounded-lg bg-white/5 border border-white/5 shadow-inner", config.color)}>
            <Icon className="h-5 w-5" />
          </div>
          Lighting Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("px-3 py-1 rounded-full border-none bg-white/5 text-[10px] font-bold uppercase tracking-widest", config.color)}>
              {config.label}
            </Badge>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
              Luminance: {brightness} LUX
            </span>
          </div>
          
          <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(brightness / 255) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("absolute inset-y-0 left-0 rounded-full shadow-lg", config.barColor)}
            />
          </div>
        </div>

        <p className="text-sm text-slate-400 font-light leading-relaxed">{config.message}</p>
        
        {lightingQuality === "poor" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl bg-rose-500/5 p-4 text-[13px] border border-rose-500/10 space-y-3"
          >
            <p className="font-bold text-rose-400 uppercase tracking-widest text-[10px]">Recommended Optimization:</p>
            <ul className="space-y-2 text-slate-400 font-light">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-rose-500/40" />
                Increase ambient light intensity
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-rose-500/40" />
                Utilize natural daylight spectrum
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-rose-500/40" />
                Eliminate high-contrast backlighting
              </li>
            </ul>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

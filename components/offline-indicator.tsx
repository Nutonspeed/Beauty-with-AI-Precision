"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// @ts-ignore
import { WifiOff, Wifi, CloudOff, RefreshCw } from "lucide-react"
import { offlineManager, type OfflineStatus } from "@/lib/offline-manager"

export function OfflineIndicator() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    queuedMessages: 0,
    queuedUpdates: 0,
    lastSyncTime: null
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Get initial status
    offlineManager.getStatus().then(setStatus)

    // Subscribe to status changes
    const unsubscribe = offlineManager.subscribe(setStatus)

    return () => unsubscribe()
  }, [])

  // Don't show anything if online and no queued items
  if (status.isOnline && status.queuedMessages === 0 && status.queuedUpdates === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* Compact indicator */}
      {!showDetails && (
        <Button
          variant={status.isOnline ? "outline" : "destructive"}
          size="sm"
          onClick={() => setShowDetails(true)}
          className="shadow-lg"
        >
          {status.isOnline ? (
            <>
              <Wifi className="h-4 w-4 mr-2" />
              <span>ออนไลน์</span>
              {(status.queuedMessages > 0 || status.queuedUpdates > 0) && (
                <Badge variant="secondary" className="ml-2">
                  {status.queuedMessages + status.queuedUpdates}
                </Badge>
              )}
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 mr-2 animate-pulse" />
              <span>ออฟไลน์</span>
            </>
          )}
        </Button>
      )}

      {/* Detailed panel */}
      {showDetails && (
        <div className={`bg-background border rounded-lg shadow-xl p-4 ${
          status.isOnline ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {status.isOnline ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    เชื่อมต่ออินเทอร์เน็ตแล้ว
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-medium text-red-700 dark:text-red-400">
                    ไม่มีการเชื่อมต่อ
                  </span>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(false)}
            >
              ✕
            </Button>
          </div>

          {/* Status details */}
          <div className="space-y-2 text-sm">
            {!status.isOnline && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <CloudOff className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-200">
                    โหมดออฟไลน์
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    คุณยังสามารถส่งข้อความและอัพเดทข้อมูลได้ ระบบจะซิงค์อัตโนมัติเมื่อกลับมาออนไลน์
                  </p>
                </div>
              </div>
            )}

            {/* Queued items */}
            {(status.queuedMessages > 0 || status.queuedUpdates > 0) && (
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground">
                  รอการซิงค์:
                </p>
                
                {status.queuedMessages > 0 && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-xs">ข้อความ</span>
                    <Badge variant="secondary">{status.queuedMessages}</Badge>
                  </div>
                )}

                {status.queuedUpdates > 0 && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-xs">การอัพเดท</span>
                    <Badge variant="secondary">{status.queuedUpdates}</Badge>
                  </div>
                )}

                {status.isOnline && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      // Trigger manual sync
                      globalThis.window.location.reload()
                    }}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    ซิงค์ทันที
                  </Button>
                )}
              </div>
            )}

            {status.isOnline && status.queuedMessages === 0 && status.queuedUpdates === 0 && (
              <p className="text-xs text-muted-foreground">
                ✓ ทุกอย่างซิงค์แล้ว
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

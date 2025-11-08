"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, Clock, Package } from "lucide-react"
import type { ConnectionStatus } from "@/lib/reconnection-manager"

interface ConnectionStatusIndicatorProps {
  onStatusChange?: (callback: (status: ConnectionStatus) => void) => (() => void);
}

export function ConnectionStatusIndicator({ onStatusChange }: ConnectionStatusIndicatorProps) {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    queueSize: 0
  })

  useEffect(() => {
    if (!onStatusChange) return

    const unsubscribe = onStatusChange((newStatus) => {
      setStatus(newStatus)
    })

    return unsubscribe
  }, [onStatusChange])

  if (status.connected) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Connected</span>
            <Badge variant="outline" className="ml-auto text-green-700 border-green-300">
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status.reconnecting) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-900">Reconnecting...</div>
              {status.attempt && status.maxAttempts && (
                <div className="text-xs text-yellow-700">
                  Attempt {status.attempt} of {status.maxAttempts}
                  {status.nextAttemptIn && (
                    <span className="ml-1">
                      ({(status.nextAttemptIn / 1000).toFixed(0)}s)
                    </span>
                  )}
                </div>
              )}
            </div>
            {status.queueSize > 0 && (
              <Badge variant="outline" className="text-yellow-700 border-yellow-300 gap-1">
                <Package className="h-3 w-3" />
                {status.queueSize}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status.offline) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-orange-900">Offline</div>
              <div className="text-xs text-orange-700">
                Check your internet connection
              </div>
            </div>
            {status.queueSize > 0 && (
              <Badge variant="outline" className="text-orange-700 border-orange-300 gap-1">
                <Package className="h-3 w-3" />
                {status.queueSize} queued
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status.error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-red-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-900">Connection Error</div>
              <div className="text-xs text-red-700">{status.error}</div>
            </div>
            {status.queueSize > 0 && (
              <Badge variant="outline" className="text-red-700 border-red-300 gap-1">
                <Package className="h-3 w-3" />
                {status.queueSize}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Connecting...</span>
        </div>
      </CardContent>
    </Card>
  )
}

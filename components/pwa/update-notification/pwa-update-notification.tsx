'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePWA } from '@/hooks/pwa/use-pwa'
import { 
  Download, 
  RefreshCw, 
  Zap,
  X,
  Info
} from 'lucide-react'

interface PWAUpdateNotificationProps {
  className?: string
  showClose?: boolean
  autoHide?: boolean
  hideDelay?: number
}

export function PWAUpdateNotification({ 
  className = '',
  showClose = true,
  autoHide = false,
  hideDelay = 10000
}: PWAUpdateNotificationProps) {
  const { pwaInfo, skipWaiting, reloadForUpdate } = usePWA()
  const [dismissed, setDismissed] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)

  // Auto-hide after delay
  React.useEffect(() => {
    if (autoHide && pwaInfo.updateReady && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true)
      }, hideDelay)
      
      return () => clearTimeout(timer)
    }
  }, [autoHide, hideDelay, pwaInfo.updateReady, dismissed])

  // Don't show if no update available or dismissed
  if (!pwaInfo.updateReady || dismissed) {
    return null
  }

  const handleUpdate = async () => {
    setUpdating(true)
    
    try {
      await skipWaiting()
      reloadForUpdate()
    } catch (error) {
      console.error('Failed to update app:', error)
      setUpdating(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg animate-pulse">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  App Update Available
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  A new version of Beauty AI is ready to install
                </CardDescription>
              </div>
            </div>
            {showClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>What's new:</strong> Performance improvements, bug fixes, and enhanced features.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Faster loading times</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <RefreshCw className="h-4 w-4 text-green-500" />
              <span>Improved reliability</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Latest security updates</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleUpdate}
              disabled={updating}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="text-gray-600"
              disabled={updating}
            >
              Later
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Update will install automatically when you close the app
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAUpdateNotification

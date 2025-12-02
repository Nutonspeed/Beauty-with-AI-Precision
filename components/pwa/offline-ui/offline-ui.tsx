'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePWA } from '@/hooks/pwa/use-pwa'
import { 
  WifiOff, 
  RefreshCw, 
  Database,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface OfflineUIProps {
  className?: string
  showRetry?: boolean
  customMessage?: string
}

export function OfflineUI({ 
  className = '',
  showRetry = true,
  customMessage
}: OfflineUIProps) {
  const { pwaInfo } = usePWA()
  const [retryCount, setRetryCount] = React.useState(0)

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  if (!pwaInfo.isOffline) {
    return null
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md shadow-2xl border-orange-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            You're Offline
          </CardTitle>
          <CardDescription className="text-gray-600">
            {customMessage || 'No internet connection detected. Some features may be unavailable.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>What's happening:</strong> The app is running in offline mode. 
              Cached data is still available, but real-time features are disabled.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Database className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cached Data Available</p>
                <p className="text-xs text-gray-600">Recent patient data and analysis results</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Auto-sync When Online</p>
                <p className="text-xs text-gray-600">Changes will sync automatically when connection restores</p>
              </div>
            </div>
          </div>

          {showRetry && (
            <div className="space-y-2">
              <Button
                onClick={handleRetry}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={retryCount > 2}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount > 2 ? 'Try Again Later' : 'Retry Connection'}
              </Button>
              
              {retryCount > 0 && retryCount <= 2 && (
                <p className="text-xs text-center text-gray-500">
                  Retry attempts: {retryCount}/3
                </p>
              )}
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              The app will automatically reconnect when internet is available
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OfflineUI

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePWA } from '@/hooks/pwa/use-pwa'
import { 
  Download, 
  X, 
  Smartphone, 
  Zap, 
  Shield,
  Wifi,
  Bell
} from 'lucide-react'

interface PWAInstallPromptProps {
  className?: string
  showClose?: boolean
  position?: 'top' | 'bottom' | 'center'
}

export function PWAInstallPrompt({ 
  className = '',
  showClose = true,
  position = 'bottom'
}: PWAInstallPromptProps) {
  const { installPrompt, install, pwaInfo } = usePWA()
  const [dismissed, setDismissed] = React.useState(false)

  // Don't show if already installed, not installable, or dismissed
  if (pwaInfo.isInstalled || !pwaInfo.isInstallable || dismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      setDismissed(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    // Store dismissal in localStorage
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const positionClasses = {
    top: 'top-4 left-4 right-4',
    bottom: 'bottom-4 left-4 right-4',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      <Card className="shadow-lg border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  Install Beauty AI App
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Get the full experience on your device
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
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Works Offline</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Push Notifications</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="text-gray-600"
            >
              Maybe Later
            </Button>
          </div>
          
          <div className="mt-3 flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Free • No Ads • No Tracking
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt

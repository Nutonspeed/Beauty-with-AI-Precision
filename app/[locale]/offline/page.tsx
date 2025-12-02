import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  WifiOff, 
  RefreshCw, 
  Database,
  Clock,
  Smartphone,
  Camera,
  Users
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Offline - Beauty with AI Precision',
  description: 'You are currently offline. Some features may be unavailable.',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Offline Card */}
        <Card className="shadow-xl border-orange-200 bg-white">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="h-10 w-10 text-orange-600" />
            </div>
            <CardTitle className="text-3xl text-gray-900 font-bold">
              You're Offline
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 max-w-md mx-auto">
              No internet connection detected. Don't worry - you can still access some features!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <WifiOff className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>What's happening:</strong> The app is running in offline mode using cached data. 
                Real-time features are disabled until you reconnect.
              </AlertDescription>
            </Alert>

            {/* Available Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Database className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900">Cached Data Available</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Access recent patient records, analysis results, and treatment history
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Camera className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900">Basic Analysis</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Perform skin analysis (results will sync when online)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Users className="h-6 w-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-purple-900">Patient Management</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    View and edit patient information (changes sync automatically)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Auto-Sync Queue</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    All changes will sync when connection is restored
                  </p>
                </div>
              </div>
            </div>

            {/* Limited Features */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Currently Unavailable</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time appointments and booking</li>
                <li>• Live chat and video calls</li>
                <li>• 3D AR simulator (requires internet)</li>
                <li>• Advanced AI analysis features</li>
                <li>• Push notifications</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Reconnecting
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Go Back
              </Button>
            </div>

            {/* Tips */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                <strong>💡 Pro tip:</strong> The app will automatically reconnect when internet is available
              </p>
              <p className="text-xs text-gray-500">
                Your work is saved locally and will sync to the cloud when you're back online
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PWA Install Prompt */}
        <Card className="shadow-lg border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  Install for Better Offline Experience
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Get the full PWA experience with enhanced offline capabilities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Benefits:</span> Faster loading, offline access, push notifications
              </div>
              <Button
                onClick={() => {
                  // Trigger PWA install prompt
                  const event = new CustomEvent('pwa-install-request')
                  window.dispatchEvent(event)
                }}
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Install App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

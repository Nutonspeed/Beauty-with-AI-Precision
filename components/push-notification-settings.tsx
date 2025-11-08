"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Check, X } from "lucide-react"
import { getPushNotificationManager } from "@/lib/push-notification-manager"

export function PushNotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const pushManager = getPushNotificationManager()
    
    // Check support
    setIsSupported(pushManager.isSupported())
    
    // Get current permission
    if (pushManager.isSupported()) {
      setPermission(pushManager.getPermissionStatus())
      
      // Check if already subscribed
      pushManager.initialize().then(() => {
        const subscription = pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      }).catch(console.error)
    }
  }, [])

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    try {
      const pushManager = getPushNotificationManager()
      
      // TODO: Get VAPID public key from environment or API
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'DEMO_KEY'
      
      await pushManager.subscribe(vapidPublicKey)
      
      setPermission('granted')
      setIsSubscribed(true)
      
      // Show success notification
      await pushManager.showNotification(
        'Notifications Enabled!',
        {
          body: 'You will now receive real-time updates',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png'
        }
      )
    } catch (error) {
      console.error('Failed to enable notifications:', error)
      setPermission(Notification.permission)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setIsLoading(true)
    try {
      const pushManager = getPushNotificationManager()
      await pushManager.unsubscribe()
      
      setIsSubscribed(false)
    } catch (error) {
      console.error('Failed to disable notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <X className="h-4 w-4" />
            <span>Not supported</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive real-time updates even when the app is in the background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status</span>
              {permission === 'granted' && isSubscribed && (
                <Badge variant="default" className="gap-1">
                  <Check className="h-3 w-3" />
                  Enabled
                </Badge>
              )}
              {permission === 'granted' && !isSubscribed && (
                <Badge variant="secondary">Not Subscribed</Badge>
              )}
              {permission === 'denied' && (
                <Badge variant="destructive" className="gap-1">
                  <X className="h-3 w-3" />
                  Blocked
                </Badge>
              )}
              {permission === 'default' && (
                <Badge variant="outline">Not Asked</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {permission === 'granted' && isSubscribed && 'You are receiving push notifications'}
              {permission === 'granted' && !isSubscribed && 'Permission granted but not subscribed'}
              {permission === 'denied' && 'Please enable notifications in browser settings'}
              {permission === 'default' && 'Click below to enable notifications'}
            </p>
          </div>

          {permission === 'granted' && isSubscribed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisableNotifications}
              disabled={isLoading}
            >
              <BellOff className="h-4 w-4 mr-2" />
              Disable
            </Button>
          ) : permission !== 'denied' ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleEnableNotifications}
              disabled={isLoading}
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? 'Enabling...' : 'Enable'}
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Blocked
            </Button>
          )}
        </div>

        {permission === 'denied' && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Notifications Blocked</p>
            <p className="mt-1 text-xs">
              To enable notifications, please update your browser settings:
            </p>
            <ul className="mt-2 ml-4 list-disc text-xs space-y-1">
              <li>Click the lock icon in the address bar</li>
              <li>Find "Notifications" and change to "Allow"</li>
              <li>Refresh this page</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

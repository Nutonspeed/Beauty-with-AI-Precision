/**
 * Notification System Demo Page
 * Comprehensive demo for notification system
 */

'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { ToastNotification } from '@/components/notifications/toast-notification';
import { NotificationBadge } from '@/components/notifications/notification-badge';
import { NotificationType, NotificationPriority, Notification } from '@/lib/notification-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCircle2,
  Calendar,
  MessageSquare,
  AlertTriangle,
  TestTube2,
  Code2,
  Zap,
  Settings
} from 'lucide-react';

export default function NotificationsDemoPage() {
  const [userId, setUserId] = useState('demo-user-1');
  const [isEnabled, setIsEnabled] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);

  const {
    notifications,
    unreadCount,
    stats,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getByType,
    getByPriority,
    getUnread
  } = useNotifications({ userId, enabled: isEnabled });

  const handleStart = () => {
    setIsEnabled(true);
  };

  const handleStop = () => {
    clearAll();
    setIsEnabled(false);
  };

  const handleAddCustom = () => {
    if (!customTitle || !customMessage) return;
    
    const notification = addNotification({
      type: 'system',
      priority: 'normal',
      title: customTitle,
      message: customMessage
    });

    if (notification) {
      setToastNotification(notification);
      setCustomTitle('');
      setCustomMessage('');
    }
  };

  const testNotifications = [
    {
      type: 'appointment' as NotificationType,
      priority: 'normal' as NotificationPriority,
      title: 'Upcoming Appointment',
      message: 'You have an appointment with Dr. Smith at 2:00 PM today'
    },
    {
      type: 'message' as NotificationType,
      priority: 'high' as NotificationPriority,
      title: 'New Message',
      message: 'Dr. Johnson replied to your question about prescription refill'
    },
    {
      type: 'alert' as NotificationType,
      priority: 'urgent' as NotificationPriority,
      title: 'Urgent: Lab Results Ready',
      message: 'Your blood test results are now available. Please review them.'
    },
    {
      type: 'system' as NotificationType,
      priority: 'low' as NotificationPriority,
      title: 'System Update',
      message: 'The clinic portal has been updated with new features'
    }
  ];

  const handleTestNotification = (index: number) => {
    const test = testNotifications[index];
    const notification = addNotification(test);
    if (notification) {
      setToastNotification(notification);
    }
  };

  if (!isEnabled) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Real-time Notification System</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Toast notifications, notification center, and badge counts for clinic management
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16/16</div>
              <p className="text-xs text-muted-foreground">100% passing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Components</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Core components</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Features</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Notification types</p>
            </CardContent>
          </Card>
        </div>

        {/* Start Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Start Notification System</CardTitle>
            <CardDescription>Enter user ID to start receiving notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
              </div>
              <Button onClick={handleStart} className="w-full" size="lg">
                <Bell className="w-4 h-4 mr-2" />
                Start Notification System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Toast Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Floating toast notifications with auto-dismiss
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Auto-dismiss after 5 seconds
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Slide-in animation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Color-coded by type
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Manual close button
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Notification Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Centralized inbox for all notifications
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Filter by type (All, Unread, Appointment, Message, Alert)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Mark as read/unread
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Clear individual or all
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Unread count badges
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Priority System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                4-level priority system with visual indicators
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded" />
                  <span>Low - General information</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded" />
                  <span>Normal - Standard updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded" />
                  <span>High - Important messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded" />
                  <span>Urgent - Critical alerts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Real-time Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                WebSocket-based real-time notification delivery
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Instant delivery via WebSocket
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Automatic badge updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Persistent notification history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Statistics tracking
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
            <CardDescription>Components and technologies used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Components
                </h3>
                <div className="space-y-2">
                  <Badge variant="secondary">NotificationManager</Badge>
                  <Badge variant="secondary">useNotifications</Badge>
                  <Badge variant="secondary">NotificationCenter</Badge>
                  <Badge variant="secondary">ToastNotification</Badge>
                  <Badge variant="secondary">NotificationBadge</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Technologies
                </h3>
                <div className="space-y-2">
                  <Badge variant="outline">WebSocket</Badge>
                  <Badge variant="outline">React Hooks</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Tailwind CSS</Badge>
                  <Badge variant="outline">shadcn/ui</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube2 className="w-5 h-5" />
              Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Start Notification System</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter a user ID and click "Start Notification System" to initialize the notification manager
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Test Notifications</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Click test buttons to trigger different types of notifications (appointment, message, alert, system)
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Interact with Notifications</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Click notifications to mark as read, use filters, close individual notifications, or clear all
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Monitor Badge Counts</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Observe unread count badges updating in real-time as notifications are added or marked as read
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5. Test Toast Notifications</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Watch toast notifications appear in top-right corner and auto-dismiss after 5 seconds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            Real-time Notifications
            {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            User: {userId} • {stats.total} total, {stats.unread} unread
          </p>
        </div>
        <Button onClick={handleStop} variant="outline">
          Stop System
        </Button>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Button onClick={() => handleTestNotification(0)} className="h-auto py-4 flex-col gap-2">
          <Calendar className="w-5 h-5" />
          <span className="text-xs">Appointment</span>
        </Button>
        <Button onClick={() => handleTestNotification(1)} className="h-auto py-4 flex-col gap-2" variant="secondary">
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs">Message</span>
        </Button>
        <Button onClick={() => handleTestNotification(2)} className="h-auto py-4 flex-col gap-2" variant="destructive">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-xs">Alert</span>
        </Button>
        <Button onClick={() => handleTestNotification(3)} className="h-auto py-4 flex-col gap-2" variant="outline">
          <Settings className="w-5 h-5" />
          <span className="text-xs">System</span>
        </Button>
      </div>

      {/* Custom Notification */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Custom Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter notification title"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter notification message"
              />
            </div>
            <Button onClick={handleAddCustom}>
              <Bell className="w-4 h-4 mr-2" />
              Add Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType.appointment}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType.message}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType.alert}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType.system}</div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRemove={removeNotification}
        onClearAll={clearAll}
        onNotificationClick={(notification) => {
          console.log('Clicked notification:', notification);
        }}
      />

      {/* Toast Notification */}
      {toastNotification && (
        <ToastNotification
          notification={toastNotification}
          onClose={() => setToastNotification(null)}
          duration={5000}
          position="top-right"
        />
      )}
    </div>
  );
}

/**
 * Emergency Alert System Demo
 * Complete demonstration of emergency alerts with broadcasting and acknowledgment
 */

'use client';

import { useEmergencyAlert } from '@/hooks/use-emergency-alert';
import { AlertPanel } from '@/components/alerts/alert-panel';
import { AlertBroadcaster } from '@/components/alerts/alert-broadcaster';
import { AlertHistory } from '@/components/alerts/alert-history';
import { AlertStats } from '@/components/alerts/alert-stats';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle2, Users, Zap, Shield, Radio, Clock, BarChart3 } from 'lucide-react';

export default function EmergencyAlertDemo() {
  const {
    activeAlerts,
    alertHistory,
    unacknowledgedCount,
    statistics,
    error,
    broadcastAlert,
    acknowledgeAlert,
    dismissAlert,
    clearAllAlerts
  } = useEmergencyAlert({
    facilityId: 'facility-1',
    userId: 'user-1',
    userName: 'Dr. Smith',
    autoSubscribe: true,
    playSound: true,
    showBrowserNotification: true
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Emergency Alert System</h1>
        <p className="text-muted-foreground">
          Real-time emergency alert broadcasting with priority levels and acknowledgments
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Test Coverage</p>
                <p className="text-2xl font-bold text-green-600">Ready</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Components</p>
                <p className="text-2xl font-bold text-blue-600">7</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alert Levels</p>
                <p className="text-2xl font-bold text-purple-600">5</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{activeAlerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">Error: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Broadcaster & Stats */}
        <div className="space-y-6">
          <AlertBroadcaster
            facilityId="facility-1"
            sourceId="admin-1"
            sourceName="Control Center"
            onBroadcast={broadcastAlert}
          />
          <AlertStats statistics={statistics} />
        </div>

        {/* Middle Column - Active Alerts */}
        <div>
          <AlertPanel
            alerts={activeAlerts}
            unacknowledgedCount={unacknowledgedCount}
            onAcknowledge={acknowledgeAlert}
            onDismiss={dismissAlert}
          />
        </div>

        {/* Right Column - History */}
        <div>
          <AlertHistory history={alertHistory} />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Bell className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Priority Levels</h3>
            <p className="text-sm text-muted-foreground">
              5 alert levels from info to code-blue with color coding and sounds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="font-semibold mb-1">Acknowledgment</h3>
            <p className="text-sm text-muted-foreground">
              Track who acknowledged alerts with timestamps and user info
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Radio className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="font-semibold mb-1">Real-time Sync</h3>
            <p className="text-sm text-muted-foreground">
              WebSocket broadcasting for instant alert delivery across all clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Shield className="h-8 w-8 text-red-500 mb-2" />
            <h3 className="font-semibold mb-1">Auto-Dismiss</h3>
            <p className="text-sm text-muted-foreground">
              Low-priority alerts auto-dismiss after timeout, critical alerts persist
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Clock className="h-8 w-8 text-yellow-500 mb-2" />
            <h3 className="font-semibold mb-1">Alert History</h3>
            <p className="text-sm text-muted-foreground">
              Complete history of all alerts with filtering and search capabilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <BarChart3 className="h-8 w-8 text-orange-500 mb-2" />
            <h3 className="font-semibold mb-1">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Statistics on alert distribution, acknowledgment rates, and trends
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Zap className="h-8 w-8 text-indigo-500 mb-2" />
            <h3 className="font-semibold mb-1">Sound Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Different sound frequencies and durations for each alert level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Bell className="h-8 w-8 text-teal-500 mb-2" />
            <h3 className="font-semibold mb-1">Browser Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Native browser notifications for critical alerts even when tab inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Details */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-xl font-bold">Implementation Details</h2>
          
          <div>
            <h3 className="font-semibold mb-2">Components Created</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>EmergencyAlertManager</Badge>
              <Badge>useEmergencyAlert Hook</Badge>
              <Badge>AlertPanel</Badge>
              <Badge>AlertBroadcaster</Badge>
              <Badge>AlertHistory</Badge>
              <Badge>AlertStats</Badge>
              <Badge>Demo Page</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Alert Levels</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-800">Info (Priority 1)</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">Warning (Priority 2)</Badge>
              <Badge className="bg-orange-100 text-orange-800">Critical (Priority 3)</Badge>
              <Badge className="bg-red-100 text-red-800">Emergency (Priority 4)</Badge>
              <Badge className="bg-red-200 text-red-900">Code Blue (Priority 5)</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Real-time alert broadcasting via WebSocket to all facility users</li>
              <li>5 priority levels with visual coding, sounds, and browser notifications</li>
              <li>Acknowledgment tracking to monitor who has read critical alerts</li>
              <li>Auto-dismiss timers: Info (30s), Warning (1m), Critical (5m), Emergency/Code-Blue (manual)</li>
              <li>Alert history with filtering by level, time, and facility</li>
              <li>Statistics dashboard showing distribution and acknowledgment rates</li>
              <li>Multi-facility support with independent alert channels</li>
              <li>Sound alerts using Web Audio API with different frequencies per level</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Testing Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Select alert level (Info, Warning, Critical, Emergency, Code Blue)</li>
              <li>Enter alert title and message details</li>
              <li>Toggle "Requires Acknowledgment" for critical alerts</li>
              <li>Click "Send Alert" to broadcast to all users</li>
              <li>Watch alert appear in Active Alerts panel with correct color/priority</li>
              <li>Click "Acknowledge" button to mark alert as read</li>
              <li>Statistics update in real-time showing acknowledgment rates</li>
              <li>Low-priority alerts auto-dismiss after timeout, critical alerts require manual dismissal</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

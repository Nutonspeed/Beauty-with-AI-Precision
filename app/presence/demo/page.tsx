'use client';

import { usePresence } from '@/hooks/use-presence';
import { OnlineUsersList } from '@/components/presence/online-users-list';
import { PresenceIndicator } from '@/components/presence/presence-indicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PresenceDemoPage() {
  // Simulate current user
  const currentUserId = 'demo-user-1';
  const currentUserName = 'Demo User';

  const {
    presenceMap,
    onlineCount,
    isTracking,
    allUsers
  } = usePresence({
    userId: currentUserId,
    userName: currentUserName,
    enabled: true
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Presence System Demo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time online/offline status tracking with heartbeat and activity monitoring
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <PresenceIndicator status={isTracking ? 'online' : 'offline'} size="lg" />
                <span className="text-2xl font-bold">
                  {isTracking ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Online Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{onlineCount}</div>
              <p className="text-sm text-gray-500">{allUsers.length} total tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{currentUserName}</p>
              <p className="text-sm text-gray-500">ID: {currentUserId}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Online Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Online Users</CardTitle>
              <CardDescription>
                Users currently online and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OnlineUsersList
                users={allUsers}
                currentUserId={currentUserId}
                onUserClick={(userId) => {
                  console.log('Clicked user:', userId);
                }}
              />
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Presence system capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">🔴 Heartbeat System</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sends heartbeat every 30 seconds to maintain online status
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">⏰ Activity Monitoring</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Detects user activity (mouse, keyboard, touch) and updates away status after 5 minutes of inactivity
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">📡 Stale Detection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Marks users offline if no heartbeat received for 1 minute
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">⏱️ Last Seen</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Human-readable last seen timestamps ("5 minutes ago")
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">🔄 Real-time Updates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instant presence updates via WebSocket channel
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Components</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">PresenceManager</Badge>
                    <span className="text-gray-600">Core presence tracking logic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">usePresence</Badge>
                    <span className="text-gray-600">React hook for presence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">PresenceIndicator</Badge>
                    <span className="text-gray-600">Status dot component</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">OnlineUsersList</Badge>
                    <span className="text-gray-600">User list component</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Test Coverage</h3>
                <div className="space-y-2 text-sm">
                  <div>✅ Initialization (1 test)</div>
                  <div>✅ Tracking (3 tests)</div>
                  <div>✅ Presence Updates (5 tests)</div>
                  <div>✅ Activity Monitoring (2 tests)</div>
                  <div>✅ Stale Detection (2 tests)</div>
                  <div>✅ Utility Methods (6 tests)</div>
                  <div>✅ Cleanup (2 tests)</div>
                  <div className="font-bold text-green-600 mt-2">Total: 21/21 tests passing</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">1. Multi-Tab Testing</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Open this page in multiple browser tabs to simulate multiple users online
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">2. Activity Testing</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Leave a tab inactive for 5 minutes to see the away status trigger
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">3. Offline Testing</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Close a tab and wait 1 minute to see it marked offline
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">4. WebSocket Integration</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check the browser console for presence-related WebSocket messages
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

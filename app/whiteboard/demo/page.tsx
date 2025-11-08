/**
 * Collaborative Whiteboard Demo Page
 */

'use client';

import React from 'react';
import { WhiteboardRoom } from '@/components/whiteboard/whiteboard-room';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Palette, 
  Users, 
  Zap, 
  Lock,
  Share2,
  Download
} from 'lucide-react';

export default function WhiteboardDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Collaborative Whiteboard System</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time shared canvas for medical diagrams and explanations
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Test Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">16/16</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">All tests passing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              Drawing Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">7</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pen, Eraser, Shapes, Text</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">8</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Real-time collaboration</p>
          </CardContent>
        </Card>
      </div>

      {/* Whiteboard */}
      <WhiteboardRoom
        whiteboardId="demo-board-1"
        userId="demo-user-1"
        userName="Dr. Demo"
      />

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Drawing Tools
            </CardTitle>
            <CardDescription>Complete set of medical diagram tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Pen</Badge>
              <span className="text-sm">Freehand drawing</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Eraser</Badge>
              <span className="text-sm">Remove elements</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Shapes</Badge>
              <span className="text-sm">Line, Rectangle, Circle</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Text</Badge>
              <span className="text-sm">Add annotations</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Colors</Badge>
              <span className="text-sm">7 colors available</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Width</Badge>
              <span className="text-sm">5 brush sizes (1-8px)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Real-time Collaboration
            </CardTitle>
            <CardDescription>Multi-user drawing capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Live Sync</Badge>
              <span className="text-sm">Instant element updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Cursors</Badge>
              <span className="text-sm">See other users' positions</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Active Users</Badge>
              <span className="text-sm">Color-coded participants</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">WebSocket</Badge>
              <span className="text-sm">Real-time communication</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">No Lag</Badge>
              <span className="text-sm">Optimized for performance</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Event-driven</Badge>
              <span className="text-sm">Efficient updates</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Board Locking
            </CardTitle>
            <CardDescription>Control drawing permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Lock</Badge>
              <span className="text-sm">Restrict to one user</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Unlock</Badge>
              <span className="text-sm">Allow all users to draw</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Indicator</Badge>
              <span className="text-sm">Visual lock status</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Alerts</Badge>
              <span className="text-sm">Notify when locked</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Auto-unlock</Badge>
              <span className="text-sm">When user leaves</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Permission</Badge>
              <span className="text-sm">Only locker can unlock</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export & Import
            </CardTitle>
            <CardDescription>Save and share your work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">PNG Export</Badge>
              <span className="text-sm">Save as image</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">JSON Export</Badge>
              <span className="text-sm">Backup drawings</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">JSON Import</Badge>
              <span className="text-sm">Restore from file</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Quality</Badge>
              <span className="text-sm">High-res images</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Metadata</Badge>
              <span className="text-sm">Preserve timestamps</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Sharing</Badge>
              <span className="text-sm">Share via files</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Implementation Details
          </CardTitle>
          <CardDescription>Architecture and components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Components:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Badge variant="secondary">WhiteboardManager</Badge>
              <Badge variant="secondary">useWhiteboard</Badge>
              <Badge variant="secondary">DrawingCanvas</Badge>
              <Badge variant="secondary">Toolbar</Badge>
              <Badge variant="secondary">ActiveUsersPanel</Badge>
              <Badge variant="secondary">WhiteboardRoom</Badge>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Technologies:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge>WebSocket</Badge>
              <Badge>Canvas API</Badge>
              <Badge>React Hooks</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Tailwind CSS</Badge>
              <Badge>Real-time Sync</Badge>
              <Badge>Event Handlers</Badge>
              <Badge>Vitest</Badge>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Key Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Real-time element synchronization via WebSocket</li>
              <li>Canvas-based drawing with HTML5 Canvas API</li>
              <li>Multi-user cursor tracking (throttled to 20 updates/sec)</li>
              <li>7 drawing tools: pen, eraser, line, rectangle, circle, text, select</li>
              <li>7 colors and 5 brush widths</li>
              <li>Board locking for single-user drawing mode</li>
              <li>PNG and JSON export/import functionality</li>
              <li>Active user panel with color-coded indicators</li>
              <li>Comprehensive test coverage (16/16 tests)</li>
              <li>Event-driven architecture with handlers</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>How to test the whiteboard features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold mb-1">Drawing Tools:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Select different tools from the toolbar (pen, eraser, shapes, text)</li>
              <li>Try different colors and brush widths</li>
              <li>Draw freehand with pen tool</li>
              <li>Create shapes by clicking and dragging</li>
              <li>Add text annotations by clicking and entering text</li>
              <li>Use eraser to remove parts of drawings</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Collaboration (requires multiple tabs/users):</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Open this page in multiple browser tabs</li>
              <li>Draw on one tab and see updates in others</li>
              <li>Watch user cursors move in real-time</li>
              <li>Check active users panel for participants</li>
              <li>Test board locking from different tabs</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Export/Import:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Create some drawings on the canvas</li>
              <li>Click "Export PNG" to download as image</li>
              <li>Click "Export JSON" to save data</li>
              <li>Clear the board and click "Import JSON"</li>
              <li>Select the saved JSON file to restore</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Board Controls:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Click "Lock Board" to restrict drawing</li>
              <li>Notice the lock indicator appears</li>
              <li>Try drawing from another tab (should be disabled)</li>
              <li>Click "Unlock Board" to re-enable</li>
              <li>Click "Clear All" to remove all elements</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Healthcare Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Use Cases</CardTitle>
          <CardDescription>Real-world medical applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold mb-1">Medical Consultations:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Doctors can draw anatomical diagrams to explain conditions, procedures, or treatment plans to patients during telemedicine sessions.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Medical Education:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use for teaching medical students or residents, allowing instructors to illustrate concepts while multiple learners observe in real-time.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Surgical Planning:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Surgical teams can collaborate on procedure planning, marking incision points, organ positions, or discussing approaches before operations.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Patient Education:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Healthcare providers can draw simple diagrams to help patients understand their conditions, medications, or home care instructions.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Diagnostic Collaboration:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Multiple specialists can review and annotate medical images or test results together, marking areas of concern for discussion.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

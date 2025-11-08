/**
 * Queue Management Page
 * Complete queue management interface
 */

'use client';

import React, { useState } from 'react';
import { useQueue } from '@/hooks/use-queue';
import { QueueDisplay } from '@/components/queue/queue-display';
import { QueueStatsPanel } from '@/components/queue/queue-stats-panel';
import { QueueControls } from '@/components/queue/queue-controls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QueuePriority, QueueStatus } from '@/lib/queue-manager';
import { Plus, RefreshCw } from 'lucide-react';

export default function QueueManagementPage() {
  const {
    entries,
    stats,
    joinQueue,
    callNext,
    callPatient,
    startService,
    completeService,
    cancelEntry,
    markNoShow,
    getEntriesByStatus
  } = useQueue({
    clinicId: 'clinic-1',
    enabled: true
  });

  const [newPatient, setNewPatient] = useState({
    patientName: '',
    patientId: '',
    appointmentType: '',
    priority: 'normal' as QueuePriority
  });

  /**
   * Handle join queue
   */
  const handleJoinQueue = () => {
    if (!newPatient.patientName || !newPatient.patientId) {
      alert('Please fill in patient name and ID');
      return;
    }

    joinQueue({
      patientId: newPatient.patientId,
      patientName: newPatient.patientName,
      clinicId: 'clinic-1',
      appointmentType: newPatient.appointmentType || 'General Consultation',
      priority: newPatient.priority
    });

    // Reset form
    setNewPatient({
      patientName: '',
      patientId: '',
      appointmentType: '',
      priority: 'normal'
    });
  };

  /**
   * Handle call next
   */
  const handleCallNext = () => {
    const entry = callNext('doctor-1');
    if (entry) {
      alert(`Called: ${entry.patientName} (Queue #${entry.queueNumber})`);
    } else {
      alert('No patients waiting');
    }
  };

  /**
   * Handle cancel with reason
   */
  const handleCancel = (entryId: string) => {
    const reason = prompt('Reason for cancellation:');
    if (reason !== null) {
      cancelEntry(entryId, reason);
    }
  };

  const waitingEntries = getEntriesByStatus('waiting');
  const calledEntries = getEntriesByStatus('called');
  const inServiceEntries = getEntriesByStatus('in-service');
  const completedEntries = getEntriesByStatus('completed');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Queue Management System</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time patient queue tracking and management
        </p>
      </div>

      {/* Statistics */}
      <QueueStatsPanel stats={stats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Patient Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add to Queue
            </CardTitle>
            <CardDescription>Register new patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={newPatient.patientName}
                onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={newPatient.patientId}
                onChange={(e) => setNewPatient({ ...newPatient, patientId: e.target.value })}
                placeholder="P12345"
              />
            </div>

            <div>
              <Label htmlFor="appointmentType">Appointment Type</Label>
              <Input
                id="appointmentType"
                value={newPatient.appointmentType}
                onChange={(e) => setNewPatient({ ...newPatient, appointmentType: e.target.value })}
                placeholder="General Consultation"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newPatient.priority}
                onValueChange={(value) => setNewPatient({ ...newPatient, priority: value as QueuePriority })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleJoinQueue} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add to Queue
            </Button>

            <div className="pt-4 border-t">
              <QueueControls onCallNext={handleCallNext} />
            </div>
          </CardContent>
        </Card>

        {/* Queue Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Queue Status</CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="waiting">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="waiting">
                  Waiting ({waitingEntries.length})
                </TabsTrigger>
                <TabsTrigger value="called">
                  Called ({calledEntries.length})
                </TabsTrigger>
                <TabsTrigger value="in-service">
                  In Service ({inServiceEntries.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedEntries.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="waiting" className="mt-4">
                <QueueDisplay entries={waitingEntries} showEstimatedTime />
                {waitingEntries.map(entry => (
                  <div key={entry.id} className="mt-2">
                    <QueueControls
                      entryId={entry.id}
                      status={entry.status}
                      onCallPatient={callPatient}
                      onCancelEntry={handleCancel}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="called" className="mt-4">
                <QueueDisplay entries={calledEntries} showEstimatedTime={false} />
                {calledEntries.map(entry => (
                  <div key={entry.id} className="mt-2">
                    <QueueControls
                      entryId={entry.id}
                      status={entry.status}
                      onStartService={startService}
                      onMarkNoShow={markNoShow}
                      onCancelEntry={handleCancel}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="in-service" className="mt-4">
                <QueueDisplay entries={inServiceEntries} showEstimatedTime={false} />
                {inServiceEntries.map(entry => (
                  <div key={entry.id} className="mt-2">
                    <QueueControls
                      entryId={entry.id}
                      status={entry.status}
                      onCompleteService={completeService}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <QueueDisplay entries={completedEntries} showEstimatedTime={false} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

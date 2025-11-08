/**
 * Patient Queue Ticket
 * Shows patient their queue status
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useQueue } from '@/hooks/use-queue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { QueueEntry } from '@/lib/queue-manager';

interface PatientQueueTicketProps {
  clinicId: string;
  patientId: string;
}

export function PatientQueueTicket({ clinicId, patientId }: PatientQueueTicketProps) {
  const { getEntryByPatientId, getPosition, entries } = useQueue({
    clinicId,
    enabled: true
  });

  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [position, setPosition] = useState<number>(-1);

  useEffect(() => {
    const patientEntry = getEntryByPatientId(patientId);
    setEntry(patientEntry);

    if (patientEntry) {
      setPosition(getPosition(patientEntry.id));
    }
  }, [patientId, entries, getEntryByPatientId, getPosition]);

  if (!entry) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            You are not in the queue
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
  };

  const getStatusColor = () => {
    switch (entry.status) {
      case 'waiting':
        return 'bg-blue-500';
      case 'called':
        return 'bg-yellow-500';
      case 'in-service':
        return 'bg-green-500';
      case 'completed':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusMessage = () => {
    switch (entry.status) {
      case 'waiting':
        return 'Please wait for your turn';
      case 'called':
        return 'You have been called! Please proceed to the consultation room';
      case 'in-service':
        return 'You are currently being served';
      case 'completed':
        return 'Your consultation is complete';
      default:
        return '';
    }
  };

  const progress = entry.status === 'waiting' && position > 0
    ? Math.max(0, 100 - (position / Math.max(1, entries.filter(e => e.status === 'waiting').length) * 100))
    : entry.status === 'called'
    ? 80
    : entry.status === 'in-service'
    ? 90
    : 100;

  return (
    <div className="space-y-6">
      {/* Queue Number Card */}
      <Card className="text-center">
        <CardContent className="py-8">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Queue Number</p>
            <div className="text-8xl font-bold text-blue-600">
              {entry.queueNumber}
            </div>
          </div>
          <Badge className={`${getStatusColor()} text-white text-lg px-6 py-2`}>
            {entry.status.toUpperCase().replace('-', ' ')}
          </Badge>
        </CardContent>
      </Card>

      {/* Status Message */}
      {entry.status === 'called' && (
        <Card className="border-yellow-500 border-2 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold text-lg">It's your turn!</p>
                <p className="text-sm">Please proceed to the consultation room</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {getStatusMessage()}
          </p>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Position */}
        {entry.status === 'waiting' && position > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                Position in Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{position}</div>
              <p className="text-xs text-gray-500 mt-1">
                {position === 1 ? 'Next in line' : `${position - 1} patient${position - 1 > 1 ? 's' : ''} ahead`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Estimated Wait */}
        {entry.status === 'waiting' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                Estimated Wait
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(entry.estimatedWaitTime)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Approximate time remaining
              </p>
            </CardContent>
          </Card>
        )}

        {/* Appointment Details */}
        <Card className={entry.status === 'waiting' ? '' : 'md:col-span-2'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <CheckCircle2 className="w-4 h-4" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Patient:</span>
              <span className="text-sm font-medium">{entry.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
              <span className="text-sm font-medium">{entry.appointmentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
              <Badge variant="outline" className={
                entry.priority === 'emergency' ? 'border-red-500 text-red-500' :
                entry.priority === 'urgent' ? 'border-orange-500 text-orange-500' :
                'border-blue-500 text-blue-500'
              }>
                {entry.priority.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Check-in:</span>
              <span className="text-sm font-medium">
                {new Date(entry.checkInTime).toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Text */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {entry.status === 'waiting' && 'Please stay nearby. You will be notified when it\'s your turn.'}
            {entry.status === 'called' && 'Please proceed to the consultation room immediately.'}
            {entry.status === 'in-service' && 'You are currently being served.'}
            {entry.status === 'completed' && 'Thank you for your visit!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

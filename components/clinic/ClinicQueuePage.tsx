"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Clock } from 'lucide-react';
import { ChannelSubscriber } from '@/components/realtime/ChannelSubscriber';
import { channels } from '@/lib/realtime/channels';

interface QueueItem {
  id: string;
  patientName: string;
  service: string;
  waitTime: number;
  status: 'waiting' | 'in-progress' | 'completed';
}

interface ClinicQueueProps {
  clinicId: string;
  initialQueue?: QueueItem[];
}

export function ClinicQueuePage({ clinicId, initialQueue = [] }: ClinicQueueProps) {
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleQueueUpdate = (msg: { type: string; data?: any }) => {
    if (msg.type === 'QUEUE_UPDATE') {
      setQueue(msg.data?.queue || []);
      setLastUpdate(new Date());
    } else if (msg.type === 'QUEUE_ADD') {
      setQueue((prev) => [...prev, msg.data]);
      setLastUpdate(new Date());
    } else if (msg.type === 'QUEUE_REMOVE') {
      setQueue((prev) => prev.filter((item) => item.id !== msg.data?.id));
      setLastUpdate(new Date());
    }
  };

  const getStatusBadge = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Waiting</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <ChannelSubscriber
        channels={[channels.clinic.queue(clinicId)]}
        onMessage={handleQueueUpdate}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clinic Queue
              </CardTitle>
              <CardDescription>
                Live queue for clinic {clinicId}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLastUpdate(new Date())}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No patients in queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.patientName}</p>
                      <p className="text-sm text-muted-foreground">{item.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Wait time</p>
                      <p className="font-medium">{item.waitTime} min</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { channels } from '@/lib/realtime/channels';

export default function AdminBroadcastPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<string>(channels.system.announcements);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            type: 'ANNOUNCEMENT',
            data: { message: message.trim(), at: new Date().toISOString() }
          },
          filter: {
            channels: [channel]
          }
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Broadcast failed');
      }

      toast.success('Announcement sent successfully!');
      setMessage('');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>System Broadcast</CardTitle>
          <CardDescription>
            Send announcements to connected clients via WebSocket
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="channel" className="text-sm font-medium">Channel</label>
            <select
              id="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={sending}
            >
              <option value={channels.system.announcements}>System Announcements</option>
              <option value={channels.system.maintenance}>System Maintenance</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">Message</label>
            <Textarea
              id="message"
              placeholder="Enter your announcement message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              disabled={sending}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={sending || !message.trim()}>
              {sending ? 'Sending...' : 'Send Broadcast'}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

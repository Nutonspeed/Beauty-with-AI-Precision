/**
 * Alert Broadcaster - Admin interface to send emergency alerts
 */

'use client';

import { useState } from 'react';
import { AlertLevel } from '@/lib/emergency-alert-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Send } from 'lucide-react';

interface AlertBroadcasterProps {
  facilityId: string;
  sourceId: string;
  sourceName?: string;
  onBroadcast: (alert: any) => void;
  className?: string;
}

const ALERT_LEVELS: { value: AlertLevel; label: string; description: string }[] = [
  { value: 'info', label: 'ข้อมูล', description: 'ข้อมูลทั่วไป ไม่เร่งด่วน' },
  { value: 'warning', label: 'คำเตือน', description: 'สถานการณ์ต้องระวัง' },
  { value: 'critical', label: 'วิกฤติ', description: 'สถานการณ์ร้ายแรง ต้องดำเนินการ' },
  { value: 'emergency', label: 'ฉุกเฉิน', description: 'ภาวะฉุกเฉินสูงสุด' },
  { value: 'code-blue', label: 'Code Blue', description: 'หัวใจหยุด ต้องช่วยเหลือทันที' }
];

export function AlertBroadcaster({
  facilityId,
  sourceId,
  sourceName = 'Admin',
  onBroadcast,
  className = ''
}: AlertBroadcasterProps) {
  const [level, setLevel] = useState<AlertLevel>('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [requiresAck, setRequiresAck] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    try {
      await onBroadcast({
        level,
        title: title.trim(),
        message: message.trim(),
        sourceId,
        sourceName,
        facilityId,
        requiresAck
      });

      // Reset form
      setTitle('');
      setMessage('');
      setLevel('info');
      setRequiresAck(false);
    } catch (error) {
      console.error('Broadcast error:', error);
    } finally {
      setSending(false);
    }
  };

  const selectedLevel = ALERT_LEVELS.find(l => l.value === level);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>ส่งการแจ้งเตือนฉุกเฉิน</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alert Level */}
          <div className="space-y-2">
            <Label>ระดับความสำคัญ</Label>
            <div className="grid grid-cols-1 gap-2">
              {ALERT_LEVELS.map((levelOption) => (
                <button
                  key={levelOption.value}
                  type="button"
                  onClick={() => setLevel(levelOption.value)}
                  className={`
                    text-left p-3 rounded-lg border-2 transition-all
                    ${level === levelOption.value
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-semibold">{levelOption.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {levelOption.description}
                  </div>
                </button>
              ))}
            </div>
            {selectedLevel && (
              <p className="text-sm text-muted-foreground">
                เลือก: {selectedLevel.label} - {selectedLevel.description}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">หัวข้อ</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น หัวใจหยุดที่ห้อง 302"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">รายละเอียด</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม..."
              rows={4}
              required
            />
          </div>

          {/* Requires Acknowledgment */}
          <label htmlFor="requiresAck" className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="requiresAck"
              checked={requiresAck}
              onChange={(e) => setRequiresAck(e.target.checked)}
              className="h-4 w-4"
            />
            <span>ต้องการการรับทราบจากผู้รับ</span>
          </label>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={sending || !title.trim() || !message.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'กำลังส่ง...' : 'ส่งการแจ้งเตือน'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

'use client';

/**
 * Messaging Integration - WhatsApp/LINE
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Copy, Check, User } from 'lucide-react';

interface Customer {
  name: string;
  phone?: string;
  lineId?: string;
  treatment?: string;
}

interface MessagingProps {
  customer: Customer;
  onMessageSent?: (platform: string, message: string) => void;
  className?: string;
}

const TEMPLATES = [
  { id: 'greeting', name: 'ทักทาย', template: 'สวัสดีค่ะ คุณ{name} ขอบคุณที่สนใจ {treatment} ค่ะ สะดวกคุยตอนไหนคะ?' },
  { id: 'followup', name: 'ติดตาม', template: 'สวัสดีค่ะ คุณ{name} ติดตามเรื่อง {treatment} ค่ะ มีโปรลด 15% วันนี้ค่ะ' },
  { id: 'promo', name: 'โปรโมชั่น', template: '🎉 คุณ{name} โปรพิเศษ! {treatment} ลด 30% วันนี้วันเดียว!' },
  { id: 'appointment', name: 'นัดหมาย', template: '✅ ยืนยันนัดหมาย คุณ{name} วัน [วันที่] เวลา [เวลา] บริการ {treatment}' },
  { id: 'thankyou', name: 'ขอบคุณ', template: 'ขอบคุณค่ะ คุณ{name} ดีใจที่ได้ให้บริการ {treatment} ค่ะ 💕' },
];

export function MessagingIntegration({ customer, onMessageSent, className = '' }: MessagingProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<'line' | 'whatsapp'>('line');

  const fillTemplate = (template: string) => {
    return template.replace(/{name}/g, customer.name).replace(/{treatment}/g, customer.treatment || 'treatment');
  };

  const handleSelectTemplate = (template: string) => {
    setMessage(fillTemplate(template));
    setSelectedTemplate(template);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    const encoded = encodeURIComponent(message);
    if (platform === 'whatsapp') {
      const phone = customer.phone?.replace(/[^0-9]/g, '') || '';
      const intl = phone.startsWith('0') ? '66' + phone.slice(1) : phone;
      window.open(`https://wa.me/${intl}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://line.me/R/msg/text/?${encoded}`, '_blank');
    }
    onMessageSent?.(platform, message);
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-white">Quick Message</CardTitle>
            <p className="text-sm text-gray-400">ส่งข้อความถึงลูกค้า</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-white">{customer.name}</p>
            <p className="text-xs text-gray-400">{customer.phone || customer.lineId}</p>
          </div>
        </div>

        {/* Platform */}
        <div className="flex gap-2">
          <Button
            className={`flex-1 ${platform === 'line' ? 'bg-[#00B900]' : 'bg-white/10'}`}
            onClick={() => setPlatform('line')}
          >
            LINE
          </Button>
          <Button
            className={`flex-1 ${platform === 'whatsapp' ? 'bg-[#25D366]' : 'bg-white/10'}`}
            onClick={() => setPlatform('whatsapp')}
          >
            WhatsApp
          </Button>
        </div>

        {/* Templates */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map(t => (
            <Badge
              key={t.id}
              variant="outline"
              className={`cursor-pointer ${selectedTemplate === t.template ? 'bg-purple-500/20 border-purple-500' : 'border-white/20'} text-white`}
              onClick={() => handleSelectTemplate(t.template)}
            >
              {t.name}
            </Badge>
          ))}
        </div>

        {/* Message */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="พิมพ์ข้อความ..."
          className="bg-white/5 border-white/20 text-white min-h-[120px]"
        />

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 text-white" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button 
            className={`flex-1 ${platform === 'line' ? 'bg-[#00B900]' : 'bg-[#25D366]'}`}
            onClick={handleSend}
            disabled={!message}
          >
            <Send className="w-4 h-4 mr-2" />
            ส่งผ่าน {platform === 'line' ? 'LINE' : 'WhatsApp'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default MessagingIntegration;

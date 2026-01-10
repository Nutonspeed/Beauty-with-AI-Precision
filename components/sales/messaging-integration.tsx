'use client';

/**
 * Messaging Integration - WhatsApp/LINE
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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

const TEMPLATES = (t: any) => [
  { id: 'greeting', name: t('messagingIntegration.templateNames.greeting'), template: t('messagingIntegration.templates.greeting') },
  { id: 'followup', name: t('messagingIntegration.templateNames.followup'), template: t('messagingIntegration.templates.followup') },
  { id: 'promo', name: t('messagingIntegration.templateNames.promo'), template: t('messagingIntegration.templates.promo') },
  { id: 'appointment', name: t('messagingIntegration.templateNames.appointment'), template: t('messagingIntegration.templates.appointment') },
  { id: 'thankyou', name: t('messagingIntegration.templateNames.thankyou'), template: t('messagingIntegration.templates.thankyou') },
];

export function MessagingIntegration({ customer, onMessageSent, className = '' }: MessagingProps) {
  const t = useTranslations();
  const templates = TEMPLATES(t);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<'line' | 'whatsapp'>('line');

  const fillTemplate = (template: string) => {
    return template.replace(/{name}/g, customer.name).replace(/{treatment}/g, customer.treatment || t('common.treatment') || 'treatment');
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
            <CardTitle className="text-white">{t('messagingIntegration.title')}</CardTitle>
            <p className="text-sm text-gray-400">{t('messagingIntegration.subtitle')}</p>
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
          {templates.map(tmp => (
            <Badge
              key={tmp.id}
              variant="outline"
              className={`cursor-pointer ${selectedTemplate === tmp.template ? 'bg-purple-500/20 border-purple-500' : 'border-white/20'} text-white`}
              onClick={() => handleSelectTemplate(tmp.template)}
            >
              {tmp.name}
            </Badge>
          ))}
        </div>

        {/* Message */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('messagingIntegration.placeholder')}
          className="bg-white/5 border-white/20 text-white min-h-[120px]"
        />

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 text-white" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? t('messagingIntegration.copied') : t('messagingIntegration.copy')}
          </Button>
          <Button 
            className={`flex-1 ${platform === 'line' ? 'bg-[#00B900]' : 'bg-[#25D366]'}`}
            onClick={handleSend}
            disabled={!message}
          >
            <Send className="w-4 h-4 mr-2" />
            {t('messagingIntegration.sendVia', { platform: platform.toUpperCase() })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default MessagingIntegration;

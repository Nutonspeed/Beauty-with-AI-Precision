"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScanResult {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  skin_age: number;
  concerns: Array<{
    name: string;
    severity: number;
    description: string;
  }>;
  recommendations: Array<{
    program: string;
    price: number;
    duration: string;
    expectedOutcome: string;
  }>;
}

interface ShareResultsProps {
  scanResult: ScanResult;
  leadId?: string;
  onShared?: (method: 'email' | 'chat') => void;
}

import { useTranslations } from 'next-intl';

export default function ShareResults({ scanResult, leadId, onShared }: ShareResultsProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [chatSent, setChatSent] = useState(false);

  const handleSendEmail = async () => {
    if (!scanResult.customer_email) {
      toast({
        title: t('shareResults.email.required'),
        description: t('shareResults.email.requiredDesc'),
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    try {
      // Send email via email templates API
      const response = await fetch('/api/sales/email-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId || null,
          template_id: null, // Will use custom template
          subject: `${t('shareResults.email.yourResults')} - ${scanResult.customer_name}`,
          recipient_email: scanResult.customer_email,
          recipient_name: scanResult.customer_name,
          content: generateEmailContent(),
          metadata: {
            scan_result_id: scanResult.id,
            skin_age: scanResult.skin_age
          }
        })
      });

      if (!response.ok) {
        throw new Error(t('shareResults.email.error'));
      }

      // Update scan result
      await fetch(`/api/sales/scan-results/${scanResult.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          status: 'sent_to_customer'
        })
      });

      setEmailSent(true);
      toast({
        title: t('shareResults.email.sent'),
        description: t('shareResults.email.sentDesc', { email: scanResult.customer_email }),
        variant: 'default'
      });

      if (onShared) {
        onShared('email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: t('shareResults.email.error'),
        description: t('shareResults.email.errorDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendChat = async () => {
    if (!leadId) {
      toast({
        title: t('shareResults.chat.required'),
        description: t('shareResults.chat.requiredDesc'),
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    try {
      // Send via chat messages API
      const response = await fetch('/api/sales/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          message: generateChatMessage(),
          sender_type: 'sales',
          metadata: {
            scan_result_id: scanResult.id,
            message_type: 'scan_results'
          }
        })
      });

      if (!response.ok) {
        throw new Error(t('shareResults.chat.error'));
      }

      // Update scan result
      await fetch(`/api/sales/scan-results/${scanResult.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_sent: true,
          chat_sent_at: new Date().toISOString(),
          status: 'sent_to_customer'
        })
      });

      setChatSent(true);
      toast({
        title: t('shareResults.chat.sent'),
        description: t('shareResults.chat.sentDesc'),
        variant: 'default'
      });

      if (onShared) {
        onShared('chat');
      }
    } catch (error) {
      console.error('Error sending chat:', error);
      toast({
        title: t('shareResults.chat.error'),
        description: t('shareResults.chat.errorDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const generateEmailContent = () => {
    return `
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb;">${t('shareResults.email.yourResults')}</h1>
  
  <p>${t('shareResults.chat.dear', { name: scanResult.customer_name })}</p>
  
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">${t('analysis.summary.title')}</h2>
    <p><strong>${t('analysis.summary.skinAge')}:</strong> ${scanResult.skin_age} ${t('analysis.summary.years')}</p>
  </div>
  
  <h3 style="color: #1f2937;">${t('shareResults.chat.concerns')}</h3>
  <ul>
    ${scanResult.concerns.map(c => `
      <li style="margin: 10px 0;">
        <strong>${c.name}</strong> (${t('skinHeatmap.avgSeverity')}: ${c.severity}/10)
        <br>
        <span style="color: #6b7280;">${c.description}</span>
      </li>
    `).join('')}
  </ul>
  
  <h3 style="color: #1f2937;">${t('shareResults.chat.recommendations')}</h3>
  <div style="margin: 20px 0;">
    ${scanResult.recommendations.map(r => `
      <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <h4 style="margin: 0 0 10px 0; color: #2563eb;">${r.program}</h4>
        <p style="margin: 5px 0;"><strong>${t('treatmentComparison.table.price')}:</strong> ฿${r.price.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>${t('treatmentComparison.table.duration')}:</strong> ${r.duration}</p>
        <p style="margin: 5px 0;"><strong>${t('presentationMode.expectedResults')}:</strong> ${r.expectedOutcome}</p>
      </div>
    `).join('')}
  </div>
  
  <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;"><strong>${t('common.nextSteps')}:</strong></p>
    <p>${t('shareResults.chat.nextSteps')}</p>
  </div>
  
  <p>${t('common.contactUsPrompt')}</p>
  
  <p>${t('common.bestRegards')},<br>${t('common.centerTeam')}</p>
</body>
</html>
    `.trim();
  };

  const generateChatMessage = () => {
    return `
🔍 **${t('shareResults.email.yourResults')}**

${t('shareResults.chat.dear', { name: scanResult.customer_name })}

**${t('shareResults.chat.age', { age: scanResult.skin_age })}**

**${t('shareResults.chat.concerns')}**
${scanResult.concerns.map((c, i) => `${i + 1}. ${c.name} - ${t('skinHeatmap.avgSeverity')}: ${c.severity}/10\n   ${c.description}`).join('\n')}

**${t('shareResults.chat.recommendations')}**
${scanResult.recommendations.map((r, i) => `${i + 1}. **${r.program}**\n   💰 ${t('treatmentComparison.table.price')}: ฿${r.price.toLocaleString()}\n   ⏱️ ${t('treatmentComparison.table.duration')}: ${r.duration}\n   ✨ ${t('presentationMode.expectedResults')}: ${r.expectedOutcome}`).join('\n\n')}

${t('shareResults.chat.nextSteps')}
    `.trim();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-green-500" />
          {t('shareResults.title')}
        </CardTitle>
        <CardDescription>
          {t('shareResults.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">{t('shareResults.tabs.email')}</TabsTrigger>
            <TabsTrigger value="chat">{t('shareResults.tabs.chat')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            {emailSent ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">{t('shareResults.email.sent')}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('shareResults.email.sentDesc', { email: scanResult.customer_email ?? '' })}
                </p>
              </div>
            ) : (
              <>
                {scanResult.customer_email ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">{t('shareResults.email.preview')}</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <div><strong>{t('shareResults.email.to')}:</strong> {scanResult.customer_email}</div>
                        <div><strong>{t('shareResults.email.subject')}:</strong> {t('shareResults.email.yourResults')}</div>
                        <div className="pt-2 border-t">
                          <p className="text-muted-foreground">
                            {t('shareResults.email.summary', { 
                              concernCount: scanResult.concerns.length,
                              recommendationCount: scanResult.recommendations.length
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSendEmail}
                      disabled={isSending}
                      className="w-full"
                      size="lg"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('shareResults.email.sending')}
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          {t('shareResults.email.send')}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <h4 className="font-semibold">{t('shareResults.email.required')}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('shareResults.email.requiredDesc')}
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-4 mt-4">
            {chatSent ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">{t('shareResults.chat.sent')}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('shareResults.chat.sentDesc')}
                </p>
              </div>
            ) : (
              <>
                {leadId ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm">{t('shareResults.chat.preview')}</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <div><strong>{t('shareResults.email.to')}:</strong> {scanResult.customer_name}</div>
                        <div className="pt-2 border-t">
                          <div className="bg-white p-3 rounded border text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {generateChatMessage()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSendChat}
                      disabled={isSending}
                      className="w-full"
                      size="lg"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('shareResults.chat.sending')}
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {t('shareResults.chat.send')}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <h4 className="font-semibold">{t('shareResults.chat.required')}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('shareResults.chat.requiredDesc')}
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Status Badges */}
        <div className="flex gap-2 pt-4 border-t">
          {emailSent && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {t('shareResults.status.emailSent')}
            </Badge>
          )}
          {chatSent && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {t('shareResults.status.chatSent')}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

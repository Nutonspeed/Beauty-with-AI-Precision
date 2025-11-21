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
    treatment: string;
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

export default function ShareResults({ scanResult, leadId, onShared }: ShareResultsProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [chatSent, setChatSent] = useState(false);

  const handleSendEmail = async () => {
    if (!scanResult.customer_email) {
      toast({
        title: 'Email Required',
        description: 'Please add an email address for the customer first.',
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
          subject: `Your Skin Analysis Results - ${scanResult.customer_name}`,
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
        throw new Error('Failed to send email');
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
        title: 'Email Sent Successfully',
        description: `Analysis results sent to ${scanResult.customer_email}`,
        variant: 'default'
      });

      if (onShared) {
        onShared('email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error Sending Email',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendChat = async () => {
    if (!leadId) {
      toast({
        title: 'Lead Required',
        description: 'Please convert to lead first before sending via chat.',
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
        throw new Error('Failed to send chat message');
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
        title: 'Message Sent Successfully',
        description: 'Analysis results sent via chat',
        variant: 'default'
      });

      if (onShared) {
        onShared('chat');
      }
    } catch (error) {
      console.error('Error sending chat:', error);
      toast({
        title: 'Error Sending Message',
        description: 'Failed to send chat message. Please try again.',
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
  <h1 style="color: #2563eb;">Your Skin Analysis Results</h1>
  
  <p>Dear ${scanResult.customer_name},</p>
  
  <p>Thank you for your consultation with us. Here are your personalized skin analysis results:</p>
  
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Analysis Summary</h2>
    <p><strong>Skin Age:</strong> ${scanResult.skin_age} years</p>
  </div>
  
  <h3 style="color: #1f2937;">Identified Concerns:</h3>
  <ul>
    ${scanResult.concerns.map(c => `
      <li style="margin: 10px 0;">
        <strong>${c.name}</strong> (Severity: ${c.severity}/10)
        <br>
        <span style="color: #6b7280;">${c.description}</span>
      </li>
    `).join('')}
  </ul>
  
  <h3 style="color: #1f2937;">Recommended Treatments:</h3>
  <div style="margin: 20px 0;">
    ${scanResult.recommendations.map(r => `
      <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <h4 style="margin: 0 0 10px 0; color: #2563eb;">${r.treatment}</h4>
        <p style="margin: 5px 0;"><strong>Price:</strong> ฿${r.price.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>Duration:</strong> ${r.duration}</p>
        <p style="margin: 5px 0;"><strong>Expected Outcome:</strong> ${r.expectedOutcome}</p>
      </div>
    `).join('')}
  </div>
  
  <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Next Steps:</strong></p>
    <p>We recommend scheduling a consultation to discuss these treatments in detail and create a personalized treatment plan for you.</p>
  </div>
  
  <p>If you have any questions, please don't hesitate to contact us.</p>
  
  <p>Best regards,<br>Your Beauty Clinic Team</p>
</body>
</html>
    `.trim();
  };

  const generateChatMessage = () => {
    return `
🔍 **Your Skin Analysis Results**

Hi ${scanResult.customer_name}! Here are your personalized skin analysis results:

**Skin Age:** ${scanResult.skin_age} years

**Identified Concerns:**
${scanResult.concerns.map((c, i) => `${i + 1}. ${c.name} - Severity: ${c.severity}/10\n   ${c.description}`).join('\n')}

**Recommended Treatments:**
${scanResult.recommendations.map((r, i) => `${i + 1}. **${r.treatment}**\n   💰 Price: ฿${r.price.toLocaleString()}\n   ⏱️ Duration: ${r.duration}\n   ✨ Expected: ${r.expectedOutcome}`).join('\n\n')}

Would you like to schedule a consultation to discuss these treatments?
    `.trim();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-green-500" />
          Share Analysis Results
        </CardTitle>
        <CardDescription>
          Send scan results to customer via email or chat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            {emailSent ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">Email Sent!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Results sent to {scanResult.customer_email}
                </p>
              </div>
            ) : (
              <>
                {scanResult.customer_email ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">Email Preview</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <div><strong>To:</strong> {scanResult.customer_email}</div>
                        <div><strong>Subject:</strong> Your Skin Analysis Results</div>
                        <div className="pt-2 border-t">
                          <p className="text-muted-foreground">
                            Personalized analysis with {scanResult.concerns.length} concerns identified 
                            and {scanResult.recommendations.length} treatment recommendations.
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
                          Sending Email...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Email Address Required</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please add an email address to the customer profile first.
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
                <h4 className="font-semibold">Message Sent!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Results sent via chat to the customer
                </p>
              </div>
            ) : (
              <>
                {leadId ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm">Chat Message Preview</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <div><strong>To:</strong> {scanResult.customer_name}</div>
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
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Chat Message
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Lead Required</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please convert to lead first before sending via chat.
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
              Email Sent
            </Badge>
          )}
          {chatSent && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Chat Sent
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

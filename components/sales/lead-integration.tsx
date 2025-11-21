"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
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
  }>;
}

interface LeadIntegrationProps {
  scanResult: ScanResult;
  onLeadCreated?: (leadId: string) => void;
}

export default function LeadIntegration({ scanResult, onLeadCreated }: LeadIntegrationProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [leadCreated, setLeadCreated] = useState(false);
  const [email, setEmail] = useState(scanResult.customer_email || '');
  const [notes, setNotes] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(
    scanResult.recommendations.reduce((sum, rec) => sum + rec.price, 0)
  );

  const handleCreateLead = async () => {
    setIsCreating(true);
    try {
      // Create lead in CRM
      const response = await fetch('/api/sales/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scanResult.customer_name,
          phone: scanResult.customer_phone,
          email: email || null,
          source: 'quick_scan',
          status: 'new',
          estimated_value: estimatedValue,
          notes: `
Skin Analysis Results:
- Skin Age: ${scanResult.skin_age} years
- Concerns: ${scanResult.concerns.map(c => c.name).join(', ')}
- Recommended Treatments: ${scanResult.recommendations.map(r => r.treatment).join(', ')}

${notes || ''}
          `.trim(),
          metadata: {
            scan_result_id: scanResult.id,
            skin_age: scanResult.skin_age,
            concerns: scanResult.concerns,
            recommendations: scanResult.recommendations
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create lead');
      }

      const { data: lead } = await response.json();

      // Update scan result with lead_id
      await fetch(`/api/sales/scan-results/${scanResult.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          status: 'converted_to_lead',
          customer_email: email || scanResult.customer_email
        })
      });

      setLeadCreated(true);
      toast({
        title: 'Lead Created Successfully',
        description: `${scanResult.customer_name} has been added to your leads pipeline.`,
        variant: 'default'
      });

      if (onLeadCreated) {
        onLeadCreated(lead.id);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error Creating Lead',
        description: 'Failed to create lead. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (leadCreated) {
    return (
      <Card className="w-full border-green-200 bg-green-50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <h3 className="font-semibold text-lg">Lead Created Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              {scanResult.customer_name} has been added to your pipeline.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-500" />
          Convert to Lead
        </CardTitle>
        <CardDescription>
          Add this customer to your sales pipeline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div className="font-medium">{scanResult.customer_name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Phone</div>
              <div className="font-medium">{scanResult.customer_phone}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">Skin Concerns</div>
            <div className="flex flex-wrap gap-2">
              {scanResult.concerns.map((concern, idx) => (
                <Badge key={idx} variant={concern.severity >= 7 ? 'destructive' : 'secondary'}>
                  {concern.name} ({concern.severity}/10)
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">Recommended Treatments</div>
            <div className="flex flex-wrap gap-2">
              {scanResult.recommendations.map((rec, idx) => (
                <Badge key={idx} variant="outline">
                  {rec.treatment} - ฿{rec.price.toLocaleString()}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Details Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated-value">Estimated Deal Value (฿)</Label>
            <Input
              id="estimated-value"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Auto-calculated from recommended treatments
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about the customer or consultation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        {/* Lead Preview */}
        <div className="p-4 border rounded-lg space-y-3 bg-blue-50/50">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Lead Preview</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Source: Quick Scan Analysis</li>
                <li>• Status: New Lead</li>
                <li>• Priority: {scanResult.concerns.some(c => c.severity >= 7) ? 'High' : 'Medium'}</li>
                <li>• Follow-up: Recommended within 24 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCreateLead}
            disabled={isCreating}
            className="flex-1"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Lead...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Lead
              </>
            )}
          </Button>
        </div>

        {/* Info Notice */}
        <p className="text-xs text-muted-foreground">
          Creating a lead will save this scan result to the customer's profile and add them to your sales pipeline for follow-up.
        </p>
      </CardContent>
    </Card>
  );
}

'use client';

import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function PaymentConfirmationPage() {
  const t = useTranslations('paymentConfirmation');

  // Mock payment data
  const payment = {
    id: 'PAY-2024-001',
    amount: 2900,
    method: 'พร้อมเพย์',
    status: 'success',
    timestamp: new Date().toISOString(),
    plan: 'Professional',
    features: [
      'unlimited_ai',
      'unlimited_history',
      'detailed_report',
      'special_features',
      'priority_support'
    ]
  };

  const handleDownloadReceipt = () => {
    // Mock download
    const link = document.createElement('a');
    link.href = '/receipts/sample-receipt.pdf';
    link.download = `receipt-${payment.id}.pdf`;
    link.click();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{t('successTitle')}</h1>
          <p className="text-gray-600">{t('successSubtitle')}</p>
        </div>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('cardTitle')}</span>
              <Badge variant="secondary" className="text-green-600">
                {payment.status === 'success' ? t('status.success') : t('status.pending')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('paymentId')}:</span>
                <span className="font-mono">{payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('package')}:</span>
                <span>{payment.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('method')}:</span>
                <span>{payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('amount')}:</span>
                <span className="text-2xl font-bold text-green-600">
                  ฿{payment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('timestamp')}:</span>
                <span>{new Date(payment.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('featuresTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {payment.features.map((featureKey, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{t(`features.${featureKey}`)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleDownloadReceipt} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            {t('downloadReceipt')}
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/analysis">
              {t('goToDashboard')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-center text-sm text-gray-600">
            {t('stillHaveQuestions')}
            <Link href="/contact" className="text-blue-600 hover:underline ml-1">
              {t('contactSupport')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
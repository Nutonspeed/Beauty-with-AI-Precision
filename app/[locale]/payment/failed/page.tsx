'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Phone, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function PaymentFailedPage() {
  const t = useTranslations('paymentFailed');
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';

  const getErrorMessage = (reason: string) => {
    switch (reason) {
      case 'timeout':
        return t('errors.timeout');
      case 'cancelled':
        return t('errors.cancelled');
      case 'insufficient':
        return t('errors.insufficient');
      case 'technical':
        return t('errors.technical');
      default:
        return t('errors.default');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Error Message */}
        <div className="text-center mb-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{t('errorTitle')}</h1>
          <p className="text-gray-600">{getErrorMessage(reason)}</p>
        </div>

        {/* Error Details */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>{t('errorCode')}</strong> PAY_FAILED_{reason.toUpperCase()} <br />
            <strong>{t('time')}</strong> {new Date().toLocaleString()}
          </AlertDescription>
        </Alert>

        {/* What to do */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('whatToDo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium">{t('step1Title')}</p>
                  <p className="text-sm text-gray-600">
                    {t('step1Desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium">{t('step2Title')}</p>
                  <p className="text-sm text-gray-600">
                    {t('step2Desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium">{t('step3Title')}</p>
                  <p className="text-sm text-gray-600">
                    {t('step3Desc')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button asChild className="flex-1">
            <Link href="/pricing">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('retryButton')}
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/support">{t('contactButton')}</Link>
          </Button>
        </div>

        {/* Support Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('contactInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{t('phone')} 02-XXX-XXXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{t('email')} support@beauty-with-ai.com</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
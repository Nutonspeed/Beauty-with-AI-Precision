'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, ArrowLeft, Loader2 } from 'lucide-react';
import BulkCustomerImport from '@/components/sales/bulk-customer-import';
import Link from 'next/link';

export default function CustomerImportPage() {
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !['sales_staff', 'clinic_admin', 'clinic_owner', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }
  }, [user, authLoading, router, lp]);

  const downloadTemplate = () => {
    const csv = `email,name,phone\ncustomer1@example.com,${t('socialProof.reviews.names.somsri')},0812345678\ncustomer2@example.com,${t('socialProof.reviews.names.wipa')},0898765432\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={lp('/sales/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('salesImport.title')}</h1>
            <p className="text-muted-foreground">
              {t('salesImport.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('salesImport.instructions.title')}</CardTitle>
          <CardDescription>
            {t('salesImport.instructions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>{t('salesImport.instructions.step1')}</li>
            <li>{t('salesImport.instructions.step2')}</li>
            <li>{t('salesImport.instructions.step3')}</li>
            <li>{t('salesImport.instructions.step4')}</li>
            <li>{t('salesImport.instructions.step5')}</li>
          </ol>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-2">{t('salesImport.instructions.formatLabel')}</p>
            <code className="text-sm">
              email,name,phone<br />
              customer@example.com,{t('patient.name')},0812345678
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t('salesImport.download.title')}
            </CardTitle>
            <CardDescription>
              {t('salesImport.download.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {t('salesImport.download.button')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('salesImport.upload.title')}
            </CardTitle>
            <CardDescription>
              {t('salesImport.upload.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setImportOpen(true)} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {t('salesImport.upload.button')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">💡 {t('salesImport.tips.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
            <li>• {t('salesImport.tips.item1')}</li>
            <li>• {t('salesImport.tips.item2')}</li>
            <li>• {t('salesImport.tips.item3')}</li>
            <li>• {t('salesImport.tips.item4')}</li>
            <li>• {t('salesImport.tips.item5')}</li>
            <li>• {t('salesImport.tips.item6')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <BulkCustomerImport 
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={() => {
          setImportOpen(false);
          router.push(lp('/sales/dashboard'));
        }}
      />
    </div>
  );
}

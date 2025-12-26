'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, ArrowLeft, Loader2 } from 'lucide-react';
import BulkCustomerImport from '@/components/sales/bulk-customer-import';
import Link from 'next/link';

export default function CustomerImportPage() {
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
    const csv = 'email,name,phone\ncustomer1@example.com,สมชาย ใจดี,0812345678\ncustomer2@example.com,สมหญิง สวยงาม,0898765432\n';
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
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Import Customers</h1>
            <p className="text-muted-foreground">
              นำเข้าลูกค้าจำนวนมากผ่าน CSV
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Import Customers</CardTitle>
          <CardDescription>
            Follow these steps to import your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Download the CSV template below</li>
            <li>Fill in your customer information (email, name, phone)</li>
            <li>Save the file and upload it</li>
            <li>Review the preview and confirm</li>
            <li>Invitation emails will be sent automatically</li>
          </ol>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-2">CSV Format:</p>
            <code className="text-sm">
              email,name,phone<br />
              customer@example.com,Customer Name,0812345678
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
              Step 1: Download Template
            </CardTitle>
            <CardDescription>
              Get the CSV template with correct format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Step 2: Upload Customers
            </CardTitle>
            <CardDescription>
              Upload your filled CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setImportOpen(true)} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV File
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">💡 Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
            <li>• Maximum 100 customers per import</li>
            <li>• Email addresses must be valid and unique</li>
            <li>• Phone numbers are optional</li>
            <li>• Customers will receive invitation emails automatically</li>
            <li>• They have 30 days to accept the invitation</li>
            <li>• You can track their status in your dashboard</li>
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

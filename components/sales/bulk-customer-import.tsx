'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Download, Loader2, Phone, Mail } from 'lucide-react';
import { parseCustomerCSV, type CSVParseResult, type CustomerCSVRow } from '@/lib/utils/csv-parser';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function BulkCustomerImport({ open, onOpenChange, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult<CustomerCSVRow> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      const text = await selectedFile.text();
      const result = parseCustomerCSV(text);
      setParseResult(result);
      
      if (result.errors.length === 0 && result.data.length > 0) {
        setStep('preview');
      }
    } catch (error) {
      console.error('Failed to parse CSV:', error);
    }
  };

  const handleUpload = async () => {
    if (!parseResult || parseResult.data.length === 0) return;

    setUploading(true);
    try {
      const response = await fetch('/api/sales/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customers: parseResult.data }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);
      setStep('result');

      if (result.summary.successful > 0) {
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParseResult(null);
    setUploadResult(null);
    setStep('upload');
    onOpenChange(false);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Customer Import</DialogTitle>
          <DialogDescription>
            Upload a CSV file to invite multiple customers at once
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                CSV must have columns: <strong>email</strong>, <strong>name</strong>, <strong>phone</strong> (optional)
                <br />
                Maximum 100 customers per upload
              </AlertDescription>
            </Alert>

            <Button variant="outline" onClick={downloadTemplate} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>

            <Card>
              <CardContent className="pt-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop or click to upload CSV file
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload-customer"
                  />
                  <Button asChild>
                    <label htmlFor="csv-upload-customer" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {parseResult && parseResult.errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">Found {parseResult.errors.length} errors:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {parseResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i} className="text-sm">
                        Row {err.row}: {err.message}
                      </li>
                    ))}
                    {parseResult.errors.length > 5 && (
                      <li className="text-sm">...and {parseResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && parseResult && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Found {parseResult.validRows} valid customers
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {parseResult.data.slice(0, 10).map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{row.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {row.email}
                          </span>
                          {row.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {row.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">Customer</Badge>
                    </div>
                  ))}
                  {parseResult.data.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      ...and {parseResult.data.length - 10} more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Invitations...
                  </>
                ) : (
                  <>Send {parseResult.data.length} Invitations</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && uploadResult && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{uploadResult.summary.successful}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold">{uploadResult.summary.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{uploadResult.summary.duplicate}</p>
                  <p className="text-sm text-muted-foreground">Duplicate</p>
                </CardContent>
              </Card>
            </div>

            {uploadResult.results.failed.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">Failed invitations:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {uploadResult.results.failed.map((f: any, i: number) => (
                      <li key={i} className="text-sm">
                        {f.email}: {f.reason}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {uploadResult.summary.successful > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Successfully imported {uploadResult.summary.successful} customers!
                  Invitation emails have been sent. Customers have 30 days to accept.
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

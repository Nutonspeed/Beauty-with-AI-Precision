/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  locale?: 'en' | 'th';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const TRANSLATIONS = {
  en: {
    title: 'Oops! Something went wrong',
    description: 'We apologize for the inconvenience. An unexpected error has occurred.',
    technicalDetails: 'Technical Details',
    errorMessage: 'Error Message',
    stackTrace: 'Stack Trace',
    actions: {
      retry: 'Try Again',
      home: 'Go to Home',
      report: 'Report Issue'
    },
    timestamp: 'Time',
    browserInfo: 'Browser',
    tips: {
      title: 'What you can do',
      refresh: 'Refresh the page',
      clearCache: 'Clear your browser cache',
      tryLater: 'Try again later',
      contact: 'Contact support if the problem persists'
    }
  },
  th: {
    title: 'เกิดข้อผิดพลาด',
    description: 'ขออภัยในความไม่สะดวก เกิดข้อผิดพลาดที่ไม่คาดคิด',
    technicalDetails: 'รายละเอียดทางเทคนิค',
    errorMessage: 'ข้อความแสดงข้อผิดพลาด',
    stackTrace: 'Stack Trace',
    actions: {
      retry: 'ลองอีกครั้ง',
      home: 'กลับหน้าแรก',
      report: 'รายงานปัญหา'
    },
    timestamp: 'เวลา',
    browserInfo: 'เบราว์เซอร์',
    tips: {
      title: 'สิ่งที่คุณสามารถทำได้',
      refresh: 'รีเฟรชหน้าเว็บ',
      clearCache: 'ล้างแคชของเบราว์เซอร์',
      tryLater: 'ลองอีกครั้งในภายหลัง',
      contact: 'ติดต่อฝ่ายสนับสนุนหากปัญหายังคงอยู่'
    }
  }
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error tracking service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // Prepare error data
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    // Log to API endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(err => {
        console.error('Failed to log error to service:', err);
      });
    }
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleReportIssue = (): void => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    // Copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          alert('Error details copied to clipboard. Please send this to support.');
        })
        .catch(() => {
          alert('Failed to copy error details.');
        });
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false, locale = 'th' } = this.props;
    const t = TRANSLATIONS[locale];

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    // Default error UI
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950">
        <Card className="max-w-2xl w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                  {t.title}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {t.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertTitle>{t.errorMessage}</AlertTitle>
                <AlertDescription className="mt-2 font-mono text-sm">
                  {error.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Helpful Tips */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-900 dark:text-blue-100">
                  {t.tips.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    {t.tips.refresh}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    {t.tips.clearCache}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    {t.tips.tryLater}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    {t.tips.contact}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Technical Details (Collapsible) */}
            {showDetails && error && (
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {t.technicalDetails}
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t.timestamp}
                    </p>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {new Date().toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')}
                    </p>
                  </div>

                  {typeof navigator !== 'undefined' && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {t.browserInfo}
                      </p>
                      <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                        {navigator.userAgent}
                      </p>
                    </div>
                  )}

                  {error.stack && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {t.stackTrace}
                      </p>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48 font-mono">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Component Stack
                      </p>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48 font-mono">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={this.handleRetry} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {t.actions.retry}
            </Button>
            <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              {t.actions.home}
            </Button>
            <Button onClick={this.handleReportIssue} variant="ghost" className="gap-2">
              <Bug className="w-4 h-4" />
              {t.actions.report}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
}

// Functional component wrapper for easier use
export function ErrorBoundaryWrapper({
  children,
  locale = 'th',
  showDetails = process.env.NODE_ENV === 'development'
}: {
  children: ReactNode;
  locale?: 'en' | 'th';
  showDetails?: boolean;
}) {
  return (
    <ErrorBoundary locale={locale} showDetails={showDetails}>
      {children}
    </ErrorBoundary>
  );
}

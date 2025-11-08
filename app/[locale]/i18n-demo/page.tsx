/**
 * Multi-language Demo Page
 * สาธิตการใช้งานระบบหลายภาษา
 */

'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/language-switcher';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  getDatePattern,
} from '@/lib/i18n/locale-utils';
import { Globe, Calendar, DollarSign, Clock, Percent, TrendingUp } from 'lucide-react';

export default function I18nDemoPage() {
  const t = useTranslations();
  const locale = useLocale() as 'th' | 'en' | 'zh';

  // Sample data for demonstration
  const sampleDate = new Date('2024-11-04T14:30:00');
  const sampleAmount = 15000;
  const sampleNumber = 123456.789;
  const samplePercentage = 23.5;
  const pastDate = new Date('2024-11-02T10:00:00');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Multi-language Support Demo
            </h1>
            <p className="text-muted-foreground mt-2">
              ระบบรองรับ 3 ภาษา: ไทย (Thai), English, 中文 (Chinese)
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Current Locale Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Current Locale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Locale Code</p>
                <p className="text-2xl font-bold">{locale.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Language</p>
                <p className="text-2xl font-bold">
                  {locale === 'th' && '🇹🇭 ไทย'}
                  {locale === 'en' && '🇬🇧 English'}
                  {locale === 'zh' && '🇨🇳 中文'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Pattern</p>
                <p className="text-2xl font-bold">{getDatePattern(locale)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Translation Examples</CardTitle>
            <CardDescription>Common phrases translated to current locale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">App Name</p>
                <p className="font-semibold">{t('common.appName')}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Loading</p>
                <p className="font-semibold">{t('common.loading')}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Success</p>
                <p className="font-semibold">{t('common.success')}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Save</p>
                <p className="font-semibold">{t('common.save')}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Cancel</p>
                <p className="font-semibold">{t('common.cancel')}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Search</p>
                <p className="font-semibold">{t('common.search')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Translations */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Menu</CardTitle>
            <CardDescription>Menu items in current language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{t('nav.home')}</Badge>
              <Badge variant="outline">{t('nav.features')}</Badge>
              <Badge variant="outline">{t('nav.about')}</Badge>
              <Badge variant="outline">{t('nav.contact')}</Badge>
              <Badge variant="outline">{t('nav.booking')}</Badge>
              <Badge variant="outline">{t('nav.dashboard')}</Badge>
              <Badge variant="outline">{t('nav.admin')}</Badge>
              <Badge variant="outline">{t('nav.profile')}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Number & Currency Formatting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Currency Formatting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Raw Value</p>
                <p className="text-2xl font-bold text-muted-foreground">{sampleAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Formatted Currency</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(sampleAmount, locale)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Small Amount</p>
                  <p className="font-semibold">{formatCurrency(500, locale)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Large Amount</p>
                  <p className="font-semibold">{formatCurrency(999999, locale)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Number Formatting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Raw Value</p>
                <p className="text-2xl font-bold text-muted-foreground">{sampleNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Formatted Number</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatNumber(sampleNumber, locale)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Integer</p>
                  <p className="font-semibold">{formatNumber(12345, locale)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Decimal</p>
                  <p className="font-semibold">{formatNumber(9876.54, locale)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date & Time Formatting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date & Time Formatting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Long Date</p>
                <p className="font-semibold">{formatDate(sampleDate, locale)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Time</p>
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatTime(sampleDate, locale)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Date & Time</p>
                <p className="font-semibold text-sm">{formatDateTime(sampleDate, locale)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Relative Time</p>
                <p className="font-semibold">{formatRelativeTime(pastDate, locale)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Current Date</p>
                <p className="font-semibold">{formatDate(new Date(), locale)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Current Time</p>
                <p className="font-semibold">{formatTime(new Date(), locale)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Percentage Formatting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Percentage Formatting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPercentage(samplePercentage, locale)}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Discount</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatPercentage(15, locale)}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPercentage(95.5, locale)}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPercentage(100, locale)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking System Translations */}
        <Card>
          <CardHeader>
            <CardTitle>Booking System</CardTitle>
            <CardDescription>Treatment names and status labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Treatment Types:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{t('booking.treatments.botox')}</Badge>
                  <Badge>{t('booking.treatments.filler')}</Badge>
                  <Badge>{t('booking.treatments.laser')}</Badge>
                  <Badge>{t('booking.treatments.facial')}</Badge>
                  <Badge>{t('booking.treatments.peeling')}</Badge>
                  <Badge>{t('booking.treatments.mesotherapy')}</Badge>
                  <Badge>{t('booking.treatments.acne_treatment')}</Badge>
                  <Badge>{t('booking.treatments.anti_aging')}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Booking Status:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{t('booking.status.pending')}</Badge>
                  <Badge variant="default">{t('booking.status.confirmed')}</Badge>
                  <Badge variant="secondary">{t('booking.status.completed')}</Badge>
                  <Badge variant="destructive">{t('booking.status.cancelled')}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Dashboard Translations */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Administrative terms and labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="p-2 border rounded text-center">
                <p className="text-xs text-muted-foreground">Dashboard</p>
                <p className="font-medium">{t('admin.dashboard')}</p>
              </div>
              <div className="p-2 border rounded text-center">
                <p className="text-xs text-muted-foreground">Patients</p>
                <p className="font-medium">{t('admin.patients')}</p>
              </div>
              <div className="p-2 border rounded text-center">
                <p className="text-xs text-muted-foreground">Staff</p>
                <p className="font-medium">{t('admin.staff')}</p>
              </div>
              <div className="p-2 border rounded text-center">
                <p className="text-xs text-muted-foreground">Inventory</p>
                <p className="font-medium">{t('admin.inventory')}</p>
              </div>
              <div className="p-2 border rounded text-center">
                <p className="text-xs text-muted-foreground">Analytics</p>
                <p className="font-medium">{t('admin.analytics')}</p>
              </div>
              <div className="p-2 border rounded text-center">
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="font-medium">{t('admin.totalRevenue')}</p>
              </div>
              <div className="p-2 border rounded text-center">
                <p className="text-xs text-muted-foreground">Add Patient</p>
                <p className="font-medium">{t('admin.addPatient')}</p>
              </div>
              <div className="p-2 border rounded text-center">
                <p className="text-xs text-muted-foreground">Export Report</p>
                <p className="font-medium">{t('admin.exportReport')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ 3 Languages</h3>
                <p className="text-sm text-muted-foreground">
                  Thai (ไทย), English, Chinese (中文)
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ Auto-detect</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic browser language detection
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ Format Utils</h3>
                <p className="text-sm text-muted-foreground">
                  Date, time, currency, number formatting
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ Next-intl</h3>
                <p className="text-sm text-muted-foreground">
                  Industry-standard i18n library
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ Type-safe</h3>
                <p className="text-sm text-muted-foreground">
                  Full TypeScript support
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ SEO Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Locale-based URLs (/th/, /en/, /zh/)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

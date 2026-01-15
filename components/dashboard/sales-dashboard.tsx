"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Target,
  ArrowRight,
  Flame,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useLocalizePath } from '@/lib/i18n/locale-link';

import { useTranslations } from 'next-intl';

export default function SalesDashboard() {
  const t = useTranslations('dashboard.sales');
  const lp = useLocalizePath();
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.hotLeadsToday')}</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.fromYesterday', { count: 3 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.revenueMonth')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿245,000</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.fromLastMonth', { percent: '18%' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.conversionRate')}</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34%</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.fromLastMonth', { percent: '2%' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pendingMessages')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.respondWithin')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-600" />
              <CardTitle>{t('actions.hotLeads')}</CardTitle>
            </div>
            <CardDescription>
              {t('actions.hotLeadsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">
                {t('actions.hotLeadsCount', { count: 12 })}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href={lp('/sales/dashboard')}>
                {t('actions.viewAllHotLeads')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <CardTitle>{t('actions.messages')}</CardTitle>
            </div>
            <CardDescription>
              {t('actions.messagesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">
                {t('actions.messagesCount', { count: 8 })}
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href={lp('/chat')}>
                {t('actions.openChat')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Features */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle className="text-lg">{t('actions.customerList')}</CardTitle>
            <CardDescription>
              {t('actions.customerListDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={lp('/customer')}>
                {t('actions.viewList')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle className="text-lg">{t('actions.salesReport')}</CardTitle>
            <CardDescription>
              {t('actions.salesReportDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={lp('/reports')}>
                {t('actions.viewReport')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Target className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle className="text-lg">{t('actions.monthlyGoal')}</CardTitle>
            <CardDescription>
              {t('actions.monthlyGoalDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('actions.progress')}:</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>{t('tips.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>{t('tips.item1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>{t('tips.item2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>{t('tips.item3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>{t('tips.item4')}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

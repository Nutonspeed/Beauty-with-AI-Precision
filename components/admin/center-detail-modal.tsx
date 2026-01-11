'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import {
  Users,
  UserCheck,
  Activity,
  TrendingUp,
  Calendar,
  CreditCard,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Loader2,
  Heart,
  BarChart3,
} from 'lucide-react';

interface CenterDetailModalProps {
  centerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CenterDetail {
  center: {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    address: string;
    is_active: boolean;
    created_at: string;
    healthScore: number;
  };
  subscription: {
    status: string;
    mrr: number;
    current_period_end: string;
    plan: {
      name: string;
      price: number;
    } | null;
  } | null;
  users: {
    list: Array<{
      id: string;
      email: string;
      full_name: string;
      role: string;
      is_active: boolean;
      last_seen_at: string;
      created_at: string;
    }>;
    total: number;
    activeLastWeek: number;
    activeLastMonth: number;
  };
  customers: {
    list: Array<{
      id: string;
      full_name: string;
      email: string;
      phone: string;
      created_at: string;
      last_visit_at: string;
    }>;
    total: number;
  };
  analyses: {
    list: Array<{
      id: string;
      user_id: string;
      overall_score: number;
      created_at: string;
      skin_type: string;
    }>;
    total: number;
  };
  bookings: {
    list: Array<{
      id: string;
      status: string;
      program_type: string;
      scheduled_at: string;
      created_at: string;
    }>;
    totalThisMonth: number;
  };
  revenue: {
    total: number;
    monthly: Array<{ month: string; amount: number }>;
    mrr: number;
  };
}

export default function CenterDetailModal({
  centerId,
  open,
  onOpenChange,
}: CenterDetailModalProps) {
  const t = useTranslations();
  const [data, setData] = useState<CenterDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenterDetail = useCallback(async () => {
    if (!centerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/centers/${centerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch center details');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    if (open && centerId) {
      fetchCenterDetail();
    }
  }, [open, centerId, fetchCenterDetail]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      trial: 'secondary',
      past_due: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      center_owner: 'bg-purple-100 text-purple-800',
      center_manager: 'bg-blue-100 text-blue-800',
      center_staff: 'bg-green-100 text-green-800',
      sales_staff: 'bg-yellow-100 text-yellow-800',
      customer: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {loading ? t('centerDetail.loading') : data?.center.name || t('centerDetail.title')}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-destructive">
            <p>{error}</p>
          </div>
        )}

        {data && !loading && (
          <ScrollArea className="flex-1">
            <div className="space-y-6 pr-4">
              {/* Header Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Heart className={`w-8 h-8 p-1.5 rounded-full ${getHealthScoreColor(data.center.healthScore)}`} />
                      <div>
                        <p className="text-2xl font-bold">{data.center.healthScore}</p>
                        <p className="text-xs text-muted-foreground">{t('centerDetail.healthScore')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-8 h-8 p-1.5 rounded-full bg-blue-100 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{data.users.total}</p>
                        <p className="text-xs text-muted-foreground">{t('centerDetail.users')} ({data.users.activeLastWeek} {t('centerDetail.active')})</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-8 h-8 p-1.5 rounded-full bg-green-100 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{data.customers.total}</p>
                        <p className="text-xs text-muted-foreground">{t('centerDetail.customers')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-8 h-8 p-1.5 rounded-full bg-purple-100 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(data.revenue.mrr)}</p>
                        <p className="text-xs text-muted-foreground">{t('centerDetail.mrr')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Center Info Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('centerDetail.info')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{data.center.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{data.center.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{data.center.address || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{t('centerDetail.created')}: {formatDate(data.center.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span>{t('centerDetail.plan')}: {data.subscription?.plan?.name || 'None'}</span>
                      {data.subscription && getStatusBadge(data.subscription.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span>{t('centerDetail.status')}: </span>
                      <Badge variant={data.center.is_active ? 'default' : 'destructive'}>
                        {data.center.is_active ? t('centerDetail.activeStatus') : t('centerDetail.inactiveStatus')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for detailed data */}
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="users" className="gap-1">
                    <Users className="w-4 h-4" />
                    {t('centerDetail.tabs.users')} ({data.users.total})
                  </TabsTrigger>
                  <TabsTrigger value="customers" className="gap-1">
                    <UserCheck className="w-4 h-4" />
                    {t('centerDetail.tabs.customers')} ({data.customers.total})
                  </TabsTrigger>
                  <TabsTrigger value="analyses" className="gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {t('centerDetail.tabs.analyses')} ({data.analyses.total})
                  </TabsTrigger>
                  <TabsTrigger value="bookings" className="gap-1">
                    <Calendar className="w-4 h-4" />
                    {t('centerDetail.tabs.bookings')} ({data.bookings.totalThisMonth})
                  </TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users">
                  <Card>
                    <CardContent className="pt-4">
                      {data.users.list.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">{t('centerDetail.noUsers')}</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('centerDetail.table.name')}</TableHead>
                              <TableHead>{t('centerDetail.table.email')}</TableHead>
                              <TableHead>{t('centerDetail.table.role')}</TableHead>
                              <TableHead>{t('centerDetail.table.lastSeen')}</TableHead>
                              <TableHead>{t('centerDetail.table.status')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.users.list.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell>{formatDateTime(user.last_seen_at)}</TableCell>
                                <TableCell>
                                  <Badge variant={user.is_active ? 'default' : 'outline'}>
                                    {user.is_active ? t('centerDetail.activeStatus') : t('centerDetail.inactiveStatus')}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers">
                  <Card>
                    <CardContent className="pt-4">
                      {data.customers.list.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">{t('centerDetail.noCustomers')}</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('centerDetail.table.name')}</TableHead>
                              <TableHead>{t('centerDetail.table.email')}</TableHead>
                              <TableHead>{t('centerDetail.table.phone')}</TableHead>
                              <TableHead>{t('centerDetail.table.lastVisit')}</TableHead>
                              <TableHead>{t('centerDetail.table.joined')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.customers.list.map((customer) => (
                              <TableRow key={customer.id}>
                                <TableCell className="font-medium">{customer.full_name || '-'}</TableCell>
                                <TableCell>{customer.email || '-'}</TableCell>
                                <TableCell>{customer.phone || '-'}</TableCell>
                                <TableCell>{formatDate(customer.last_visit_at)}</TableCell>
                                <TableCell>{formatDate(customer.created_at)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analyses Tab */}
                <TabsContent value="analyses">
                  <Card>
                    <CardContent className="pt-4">
                      {data.analyses.list.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">{t('centerDetail.noAnalyses')}</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('centerDetail.table.id')}</TableHead>
                              <TableHead>{t('centerDetail.table.skinType')}</TableHead>
                              <TableHead>{t('centerDetail.table.overallScore')}</TableHead>
                              <TableHead>{t('centerDetail.table.date')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.analyses.list.map((analysis) => (
                              <TableRow key={analysis.id}>
                                <TableCell className="font-mono text-xs">{analysis.id.slice(0, 8)}...</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{analysis.skin_type || 'Unknown'}</Badge>
                                </TableCell>
                                <TableCell>
                                  <span className={`font-semibold ${
                                    analysis.overall_score >= 80 ? 'text-green-600' :
                                    analysis.overall_score >= 60 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {analysis.overall_score || 0}
                                  </span>
                                </TableCell>
                                <TableCell>{formatDateTime(analysis.created_at)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  <Card>
                    <CardContent className="pt-4">
                      {data.bookings.list.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">{t('centerDetail.noBookings')}</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('centerDetail.table.program')}</TableHead>
                              <TableHead>{t('centerDetail.table.status')}</TableHead>
                              <TableHead>{t('centerDetail.table.scheduled')}</TableHead>
                              <TableHead>{t('centerDetail.table.created')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.bookings.list.map((booking) => (
                              <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.program_type || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    booking.status === 'completed' ? 'default' :
                                    booking.status === 'cancelled' ? 'destructive' :
                                    'secondary'
                                  }>
                                    {booking.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDateTime(booking.scheduled_at)}</TableCell>
                                <TableCell>{formatDate(booking.created_at)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Revenue Chart */}
              {data.revenue.monthly.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {t('centerDetail.revenueTrend')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 h-32">
                      {data.revenue.monthly.map((item, idx) => {
                        const maxAmount = Math.max(...data.revenue.monthly.map(m => m.amount), 1);
                        const height = (item.amount / maxAmount) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div 
                              className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                              style={{ height: `${Math.max(height, 4)}%` }}
                              title={formatCurrency(item.amount)}
                            />
                            <span className="text-xs text-muted-foreground">{item.month.slice(5)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-lg font-semibold">
                        {t('centerDetail.total')}: {formatCurrency(data.revenue.total)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

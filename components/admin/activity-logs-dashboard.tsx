'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  Brain,
  Calendar,
  Building2,
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  type: string;
  action: string;
  description: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  clinicId: string | null;
  clinicName: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface Stats {
  totalActivities: number;
  todayActivities: number;
  weekActivities: number;
  byType: {
    ai_analysis: number;
    booking: number;
    user: number;
    clinic: number;
  };
}

interface Clinic {
  id: string;
  name: string;
}

export default function ActivityLogsDashboard() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [clinicFilter, setClinicFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (typeFilter !== 'all') params.append('action', typeFilter);
      if (clinicFilter !== 'all') params.append('clinicId', clinicFilter);

      const res = await fetch(`/api/admin/activity-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setActivities(data.activities || []);
      setStats(data.stats || null);
      setClinics(data.clinics || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, clinicFilter, offset]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_analysis': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'booking': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'user': return <Users className="h-4 w-4 text-green-500" />;
      case 'clinic': return <Building2 className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      ai_analysis: 'bg-purple-100 text-purple-700',
      booking: 'bg-blue-100 text-blue-700',
      user: 'bg-green-100 text-green-700',
      clinic: 'bg-orange-100 text-orange-700',
    };
    return variants[type] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredActivities = activities.filter(a =>
    searchTerm === '' ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.clinicName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalActivities || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.todayActivities || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.weekActivities || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Analyses</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.byType?.ai_analysis || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.byType?.ai_analysis || 0}</div>
                <div className="text-sm text-muted-foreground">AI Analyses</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.byType?.booking || 0}</div>
                <div className="text-sm text-muted-foreground">Bookings</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.byType?.user || 0}</div>
                <div className="text-sm text-muted-foreground">User Registrations</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Building2 className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.byType?.clinic || 0}</div>
                <div className="text-sm text-muted-foreground">Clinics Created</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="text-lg">Activity Log</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[200px]"
                />
              </div>

              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setOffset(0); }}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ai_analysis">AI Analysis</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>

              <Select value={clinicFilter} onValueChange={(v) => { setClinicFilter(v); setOffset(0); }}>
                <SelectTrigger className="w-[180px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Clinic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clinics</SelectItem>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={fetchActivities}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Type</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No activities found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredActivities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>{getTypeIcon(activity.type)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{activity.description}</span>
                              <Badge className={`w-fit ${getTypeBadge(activity.type)}`}>
                                {activity.action.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{activity.userName}</span>
                              {activity.userEmail && (
                                <span className="text-xs text-muted-foreground">{activity.userEmail}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{activity.clinicName}</span>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {formatDate(activity.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= total}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

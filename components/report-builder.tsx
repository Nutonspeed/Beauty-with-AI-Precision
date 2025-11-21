'use client';

/**
 * Report Builder Component
 * Custom report generation with filters and export
 */

import { useState } from 'react';
import { useReport } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  Users,
  Package,
  Target,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export function ReportBuilder() {
  const { report, loading, generateReport, exportReport } = useReport('current-user');
  
  const [reportType, setReportType] = useState<'revenue' | 'appointments' | 'customers' | 'inventory' | 'performance'>('revenue');
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [branch, setBranch] = useState<string>('all');
  const [service, _setService] = useState<string>('all');

  const handleGenerateReport = async () => {
    await generateReport(reportType, {
      startDate,
      endDate,
      period,
      branchId: branch !== 'all' ? branch : undefined,
      serviceType: service !== 'all' ? service : undefined,
    });
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'json') => {
    await exportReport(format);
  };

  const reportTypeIcons: Record<string, React.ReactNode> = {
    revenue: <DollarSign className="w-5 h-5" />,
    appointments: <CalendarIcon className="w-5 h-5" />,
    customers: <Users className="w-5 h-5" />,
    inventory: <Package className="w-5 h-5" />,
    performance: <Target className="w-5 h-5" />,
  };

  const renderReportData = () => {
    if (!report) return null;

    switch (report.type) {
      case 'revenue':
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ฿{report.data.totalRevenue?.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Period Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ฿{report.data.periodRevenue?.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Top Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">
                    {report.data.revenueByService?.[0]?.service}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {report.data.revenueByService?.[0]?.percentage}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Service */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.data.revenueByService?.map((item: any) => (
                    <div key={item.service} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.service}</div>
                        <div className="w-full bg-secondary h-2 rounded-full mt-1">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="font-semibold">฿{item.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Branch */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Branch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.data.revenueByBranch?.map((item: any) => (
                    <div key={item.branch} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.branch}</div>
                        <div className="w-full bg-secondary h-2 rounded-full mt-1">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="font-semibold">฿{item.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.data.totalAppointments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {report.data.completedAppointments}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Canceled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {report.data.canceledAppointments}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.data.completionRate}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Appointments by Service */}
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.data.appointmentsByService?.map((item: any) => (
                    <div key={item.service} className="flex items-center justify-between">
                      <span className="font-medium">{item.service}</span>
                      <div className="flex items-center space-x-2">
                        <Badge>{item.count}</Badge>
                        <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.data.peakHours?.map((item: any, index: number) => (
                    <div key={item.hour} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{item.hour}</span>
                      </div>
                      <span className="text-sm">{item.count} appointments</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.data.totalCustomers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {report.data.newCustomers}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.data.retentionRate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ฿{report.data.averageLifetimeValue?.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customers by Age</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.data.customersByAge?.map((item: any) => (
                      <div key={item.range} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.range}</div>
                          <div className="w-full bg-secondary h-2 rounded-full mt-1">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="font-semibold">{item.count}</div>
                          <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customers by Gender</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.data.customersByGender?.map((item: any) => (
                      <div key={item.gender} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.gender}</div>
                          <div className="w-full bg-secondary h-2 rounded-full mt-1">
                            <div
                              className="bg-pink-500 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="font-semibold">{item.count}</div>
                          <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'inventory':
      case 'performance':
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                Report data will be displayed here
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Report Builder</h2>
        <p className="text-muted-foreground">Generate custom reports with advanced filters</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Select report type and filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Report Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            {(['revenue', 'appointments', 'customers', 'inventory', 'performance'] as const).map((type) => (
              <Button
                key={type}
                variant={reportType === type ? 'default' : 'outline'}
                onClick={() => setReportType(type)}
                className="justify-start"
              >
                <span className="mr-2">{reportTypeIcons[type]}</span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, 'PPP', { locale: th })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, 'PPP', { locale: th })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Period */}
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="bangkok">Bangkok Central</SelectItem>
                  <SelectItem value="chiangmai">Chiang Mai</SelectItem>
                  <SelectItem value="phuket">Phuket</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
            {report && (
              <>
                <Button variant="outline" onClick={() => handleExport('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button variant="outline" onClick={() => handleExport('excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {report && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{report.name}</h3>
              <p className="text-sm text-muted-foreground">
                Generated on {format(report.generatedAt, 'PPpp', { locale: th })}
              </p>
            </div>
          </div>

          {renderReportData()}
        </div>
      )}
    </div>
  );
}

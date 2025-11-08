/**
 * Progress Tracking Chart Component
 * Displays skin analysis metrics over time with line/bar charts
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  LineChart as LineChartIcon,
  Download,
  Calendar
} from 'lucide-react';

interface AnalysisDataPoint {
  id: string;
  date: string;
  sessionNumber: number;
  scores: {
    spots: number;
    pores: number;
    wrinkles: number;
    texture: number;
    redness: number;
    overall: number;
  };
  imageUrl?: string;
  thumbnailUrl?: string;
}

interface ProgressTrackingChartProps {
  data: AnalysisDataPoint[];
  locale?: 'en' | 'th';
  onAnalysisClick?: (analysisId: string) => void;
}

const TRANSLATIONS = {
  en: {
    title: 'Progress Tracking',
    description: 'View your skin improvement over time',
    lineChart: 'Line Chart',
    barChart: 'Bar Chart',
    download: 'Download Report',
    noData: 'No analysis data available',
    needMoreData: 'Need at least 2 analyses to track progress',
    parameters: {
      spots: 'Dark Spots',
      pores: 'Pore Size',
      wrinkles: 'Wrinkles',
      texture: 'Skin Texture',
      redness: 'Redness',
      overall: 'Overall Score'
    },
    session: 'Session',
    date: 'Date',
    score: 'Score',
    change: 'Change',
    improving: 'Improving',
    declining: 'Declining',
    stable: 'Stable',
    trend: 'Trend',
    averageImprovement: 'Average Improvement',
    totalSessions: 'Total Sessions',
    timeSpan: 'Time Span',
    days: 'days',
    selectParameter: 'Select Parameter'
  },
  th: {
    title: 'ติดตามความคืบหน้า',
    description: 'ดูการปรับปรุงผิวของคุณเมื่อเวลาผ่านไป',
    lineChart: 'กราฟเส้น',
    barChart: 'กราฟแท่ง',
    download: 'ดาวน์โหลดรายงาน',
    noData: 'ไม่มีข้อมูลการวิเคราะห์',
    needMoreData: 'ต้องการอย่างน้อย 2 การวิเคราะห์เพื่อติดตามความคืบหน้า',
    parameters: {
      spots: 'จุดด่างดำ',
      pores: 'ขนาดรูขุมขน',
      wrinkles: 'ริ้วรอย',
      texture: 'พื้นผิวผิว',
      redness: 'ความแดง',
      overall: 'คะแนนรวม'
    },
    session: 'เซสชัน',
    date: 'วันที่',
    score: 'คะแนน',
    change: 'การเปลี่ยนแปลง',
    improving: 'ดีขึ้น',
    declining: 'แย่ลง',
    stable: 'คงที่',
    trend: 'แนวโน้ม',
    averageImprovement: 'การปรับปรุงโดยเฉลี่ย',
    totalSessions: 'เซสชันทั้งหมด',
    timeSpan: 'ช่วงเวลา',
    days: 'วัน',
    selectParameter: 'เลือกพารามิเตอร์'
  }
};

export function ProgressTrackingChart({ 
  data, 
  locale = 'en',
  onAnalysisClick 
}: ProgressTrackingChartProps) {
  const t = TRANSLATIONS[locale];
  const [selectedParameter, setSelectedParameter] = useState<keyof typeof t.parameters>('overall');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t.noData}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t.needMoreData}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const calculateTrend = (param: keyof typeof t.parameters) => {
    const values = data.map(d => d.scores[param]);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const changePercent = first !== 0 ? (change / first) * 100 : 0;

    // For concerns (spots, pores, wrinkles, redness), lower is better
    const concernParams = ['spots', 'pores', 'wrinkles', 'redness'];
    let trend: 'improving' | 'declining' | 'stable';

    if (Math.abs(changePercent) < 5) {
      trend = 'stable';
    } else if (concernParams.includes(param)) {
      trend = change < 0 ? 'improving' : 'declining';
    } else {
      trend = change > 0 ? 'improving' : 'declining';
    }

    return { change, changePercent, trend };
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend: 'improving' | 'declining' | 'stable') => {
    if (trend === 'improving') return 'bg-green-500';
    if (trend === 'declining') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getTrendLabel = (trend: 'improving' | 'declining' | 'stable') => {
    return t[trend];
  };

  const stats = calculateTrend(selectedParameter);

  // Calculate time span
  const firstDate = new Date(data[0].date);
  const lastDate = new Date(data[data.length - 1].date);
  const timeSpanDays = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

  // Get values for selected parameter
  const values = data.map(d => d.scores[selectedParameter]);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;

  const handleDownloadReport = () => {
    // Generate CSV report
    const headers = ['Session', 'Date', ...Object.keys(t.parameters)];
    const rows = data.map(d => [
      d.sessionNumber,
      new Date(d.date).toLocaleDateString(locale),
      ...Object.keys(t.parameters).map(key => d.scores[key as keyof typeof d.scores])
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            {t.download}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">{t.totalSessions}</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">{t.timeSpan}</p>
            <p className="text-2xl font-bold">{timeSpanDays} {t.days}</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">{t.averageImprovement}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                {stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%
              </p>
              <Badge className={getTrendColor(stats.trend)}>
                {getTrendIcon(stats.trend)}
                <span className="ml-1">{getTrendLabel(stats.trend)}</span>
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Parameter Tabs */}
        <Tabs value={selectedParameter} onValueChange={(v) => setSelectedParameter(v as any)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
              {(Object.keys(t.parameters) as Array<keyof typeof t.parameters>).map(param => (
                <TabsTrigger key={param} value={param}>
                  {t.parameters[param]}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Chart Type Toggle */}
            <div className="flex gap-2 ml-4">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-6">
            {chartType === 'line' ? (
              <LineChart
                data={data}
                parameter={selectedParameter}
                minValue={minValue}
                maxValue={maxValue}
                locale={locale}
                onPointClick={(id) => onAnalysisClick?.(id)}
              />
            ) : (
              <BarChartComponent
                data={data}
                parameter={selectedParameter}
                maxValue={maxValue}
                locale={locale}
                onBarClick={(id) => onAnalysisClick?.(id)}
              />
            )}
          </div>

          {/* Data Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">{t.parameters[selectedParameter]}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">{t.session}</th>
                    <th className="text-left py-2 px-4">{t.date}</th>
                    <th className="text-right py-2 px-4">{t.score}</th>
                    <th className="text-right py-2 px-4">{t.change}</th>
                    <th className="text-center py-2 px-4">{t.trend}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const prevValue = index > 0 ? data[index - 1].scores[selectedParameter] : null;
                    const currentValue = item.scores[selectedParameter];
                    const change = prevValue !== null ? currentValue - prevValue : 0;
                    const changePercent = prevValue !== null && prevValue !== 0 
                      ? (change / prevValue) * 100 
                      : 0;

                    // Determine trend for this row
                    let rowTrend: 'improving' | 'declining' | 'stable' = 'stable';
                    if (index > 0) {
                      const concernParams = ['spots', 'pores', 'wrinkles', 'redness'];
                      if (Math.abs(changePercent) < 5) {
                        rowTrend = 'stable';
                      } else if (concernParams.includes(selectedParameter)) {
                        rowTrend = change < 0 ? 'improving' : 'declining';
                      } else {
                        rowTrend = change > 0 ? 'improving' : 'declining';
                      }
                    }

                    return (
                      <tr 
                        key={item.id} 
                        className="border-b hover:bg-secondary cursor-pointer"
                        onClick={() => onAnalysisClick?.(item.id)}
                      >
                        <td className="py-3 px-4">{item.sessionNumber}</td>
                        <td className="py-3 px-4">
                          {new Date(item.date).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {currentValue.toFixed(1)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {index > 0 ? (
                            <span className={
                              rowTrend === 'improving' ? 'text-green-600' :
                              rowTrend === 'declining' ? 'text-red-600' :
                              'text-gray-600'
                            }>
                              {change > 0 ? '+' : ''}{change.toFixed(1)}
                              {' '}({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {index > 0 && (
                            <Badge className={getTrendColor(rowTrend)} variant="outline">
                              {getTrendIcon(rowTrend)}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Line Chart Component
interface ChartProps {
  data: AnalysisDataPoint[];
  parameter: keyof AnalysisDataPoint['scores'];
  minValue: number;
  maxValue: number;
  locale: 'en' | 'th';
  onPointClick?: (id: string) => void;
}

function LineChart({ data, parameter, minValue, maxValue, locale, onPointClick }: ChartProps) {
  const height = 300;
  const width = 800;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const range = maxValue - minValue;
  const xStep = chartWidth / (data.length - 1);

  // Calculate points for line
  const points = data.map((item, index) => {
    const value = item.scores[parameter];
    const x = padding.left + (index * xStep);
    const y = padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
    return { x, y, id: item.id, value, date: item.date, session: item.sessionNumber };
  });

  // Create path for line
  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  // Create area path (fill under line)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
          const y = padding.top + chartHeight * (1 - fraction);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 5}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {(minValue + range * fraction).toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area under line */}
        <path
          d={areaPath}
          fill="url(#gradient)"
          opacity="0.2"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, i) => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="white"
              stroke="#3b82f6"
              strokeWidth="3"
              className="cursor-pointer hover:r-8 transition-all"
              onClick={() => onPointClick?.(point.id)}
            />
            {/* X-axis labels */}
            <text
              x={point.x}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              S{point.session}
            </text>
            <text
              x={point.x}
              y={height - padding.bottom + 35}
              textAnchor="middle"
              fontSize="10"
              fill="#9ca3af"
            >
              {new Date(point.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Bar Chart Component
function BarChartComponent({ data, parameter, maxValue, locale, onBarClick }: Omit<ChartProps, 'minValue'>) {
  const height = 300;
  const width = 800;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const barWidth = Math.min(50, chartWidth / data.length - 10);
  const gap = (chartWidth - (barWidth * data.length)) / (data.length - 1 || 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
          const y = padding.top + chartHeight * (1 - fraction);
          const value = maxValue * fraction;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 5}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const value = item.scores[parameter];
          const barHeight = (value / maxValue) * chartHeight;
          const x = padding.left + (index * (barWidth + gap));
          const y = padding.top + chartHeight - barHeight;

          // Color based on improvement
          const prevValue = index > 0 ? data[index - 1].scores[parameter] : value;
          const change = value - prevValue;
          const isImproving = change > 0;
          const color = index === 0 ? '#3b82f6' : isImproving ? '#10b981' : '#ef4444';

          return (
            <g key={item.id}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onBarClick?.(item.id)}
                rx="4"
              />
              {/* Value label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#374151"
              >
                {value.toFixed(1)}
              </text>
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#6b7280"
              >
                S{item.sessionNumber}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 35}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
              >
                {new Date(item.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

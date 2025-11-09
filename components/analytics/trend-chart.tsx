/**
 * Trend Chart Component
 * Phase 2 Week 4 Task 4.3
 * 
 * Line chart displaying metric trends over time
 * Using recharts library for visualization
 */

'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricTrend, METRIC_CONFIGS } from '@/types/analytics';

// =============================================
// Types
// =============================================

interface TrendChartProps {
  metrics: Record<string, MetricTrend>;
  selectedMetrics?: string[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}

// =============================================
// Custom Tooltip
// =============================================

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="mb-2 text-sm font-medium">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
          </div>
          <span className="text-sm font-semibold">
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// =============================================
// Component
// =============================================

export default function TrendChart({
  metrics,
  selectedMetrics = ['overall', 'spots', 'wrinkles', 'texture'],
  height = 400,
  showLegend = true,
  showGrid = true,
}: TrendChartProps) {
  // Transform data for recharts
  const chartData = useMemo(() => {
    // Get all unique dates from all metrics
    const datesSet = new Set<string>();
    Object.values(metrics).forEach((metric) => {
      metric.data.forEach((point) => {
        datesSet.add(point.date);
      });
    });

    const dates = Array.from(datesSet).sort();

    // Create data points
    return dates.map((date) => {
      const point: Record<string, any> = { date };

      selectedMetrics.forEach((metricKey) => {
        const metric = metrics[metricKey];
        if (metric) {
          const dataPoint = metric.data.find((d) => d.date === date);
          if (dataPoint) {
            point[metricKey] = dataPoint.value;
          }
        }
      });

      return point;
    });
  }, [metrics, selectedMetrics]);

  // Check if we have data
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            )}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}

            {selectedMetrics.map((metricKey) => {
              const config = METRIC_CONFIGS.find((c) => c.key === metricKey);
              if (!config) return null;

              return (
                <Line
                  key={metricKey}
                  type="monotone"
                  dataKey={metricKey}
                  name={config.label}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

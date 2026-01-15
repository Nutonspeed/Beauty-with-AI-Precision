// @ts-nocheck
'use client';

import { ProgressPhoto } from '@/types/progress';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgramTimelineChartProps {
  photos: ProgressPhoto[];
}

type MetricKey = 'spots' | 'pores' | 'wrinkles' | 'redness' | 'acne';

import { useTranslations, useLocale } from 'next-intl';

export default function ProgramTimelineChart({ photos }: ProgramTimelineChartProps) {
  const t = useTranslations('progress.timelineChart');
  const locale = useLocale();
  const dateLocale = locale === 'th' ? require('date-fns/locale').th : require('date-fns/locale').enUS;

  if (photos.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{t('insufficientData')}</p>
      </div>
    );
  }

  const metricLabels: Record<MetricKey, string> = {
    spots: t('metrics.spots'),
    pores: t('metrics.pores'),
    wrinkles: t('metrics.wrinkles'),
    redness: t('metrics.redness'),
    acne: t('metrics.acne'),
  };

  const chartData = photos
    .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime())
    .map(photo => {
        const analysis = photo.analysis_results || {};
        return {
            date: new Date(photo.taken_at),
            name: format(new Date(photo.taken_at), 'd MMM yy', { locale: dateLocale }),
            ...analysis,
        }
    });

  const activeMetrics = Object.keys(metricLabels).filter(key => 
    chartData.some(d => d[key as MetricKey] !== undefined && d[key as MetricKey]! > 0)
  ) as MetricKey[];


  return (
    <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4 text-lg">{t('title')}</h3>
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
            data={chartData}
            margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
            />
            <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: t('yAxisLabel'), angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle', fontSize: 14 } }}
            />
            <Tooltip
                formatter={(value: number, name: string) => [value.toFixed(2), metricLabels[name as MetricKey]]}
                labelFormatter={(label: string) => `${t('dateLabel')}: ${label}`}
            />
            <Legend formatter={(value) => metricLabels[value as MetricKey]} />
            {activeMetrics.map(metric => (
                <Line 
                    key={metric}
                    type="monotone" 
                    dataKey={metric} 
                    stroke={metricColors[metric]} 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                />
            ))}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
}

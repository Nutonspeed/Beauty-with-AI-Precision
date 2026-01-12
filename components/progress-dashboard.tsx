/**
 * Progress Dashboard Component
 * Displays comprehensive progress tracking with charts
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

// Static imports for better performance and cleaner code structure
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { Milestone } from '@/lib/progress/progress-tracker';

/**
 * Progress Dashboard Component
 */
export const ProgressDashboard: React.FC = () => {
  const {
    dataPoints,
    comparison,
    stats,
    timeline,
    milestones,
    isLoading,
    error,
    exportToPDF,
    exportToJSON,
    generateMilestones,
    getImprovementRates,
  } = useProgressTracking();

  const [_selectedMetric, _setSelectedMetric] = useState<string>('overallHealth');
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  // Prepare data for timeline chart
  const timelineChartData = React.useMemo(() => {
    if (!timeline || timeline.dates.length === 0) return [];

    return timeline.dates.map((date, index) => ({
      date: date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
      spots: timeline.metrics.spots[index],
      pores: timeline.metrics.pores[index],
      wrinkles: timeline.metrics.wrinkles[index],
      texture: timeline.metrics.texture[index],
      redness: timeline.metrics.redness[index],
      hydration: timeline.metrics.hydration[index],
      skinTone: timeline.metrics.skinTone[index],
      elasticity: timeline.metrics.elasticity[index],
      overall: timeline.metrics.overallHealth[index],
    }));
  }, [timeline]);

  // Prepare data for comparison bar chart
  const comparisonChartData = React.useMemo(() => {
    if (!comparison) return [];

    return [
      { metric: 'Spots', change: comparison.improvements.spots },
      { metric: 'Pores', change: comparison.improvements.pores },
      { metric: 'Wrinkles', change: comparison.improvements.wrinkles },
      { metric: 'Texture', change: comparison.improvements.texture },
      { metric: 'Redness', change: comparison.improvements.redness },
      { metric: 'Hydration', change: comparison.improvements.hydration },
      { metric: 'Skin Tone', change: comparison.improvements.skinTone },
      { metric: 'Elasticity', change: comparison.improvements.elasticity },
    ];
  }, [comparison]);

  // Prepare data for radar chart (latest metrics)
  const radarChartData = React.useMemo(() => {
    if (dataPoints.length === 0) return [];

    const latest = dataPoints[dataPoints.length - 1];
    return [
      { metric: 'Spots', value: latest.metrics.spots.score },
      { metric: 'Pores', value: latest.metrics.pores.score },
      { metric: 'Wrinkles', value: latest.metrics.wrinkles.score },
      { metric: 'Texture', value: latest.metrics.texture.score },
      { metric: 'Redness', value: latest.metrics.redness.score },
      { metric: 'Hydration', value: latest.metrics.hydration.score },
      { metric: 'Skin Tone', value: latest.metrics.skinTone.score },
      { metric: 'Elasticity', value: latest.metrics.elasticity.score },
    ];
  }, [dataPoints]);

  // Handle PDF export
  const handleExportPDF = async () => {
    await exportToPDF({
      title: 'Skin Progress Report',
      customerName: 'Demo Customer',
      centerName: 'AI Beauty Center',
      language: 'th',
    });
  };

  // Handle JSON export
  const handleExportJSON = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progress-data-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <p className="text-red-800 font-semibold">เกิดข้อผิดพลาด:</p>
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  if (dataPoints.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          ยังไม่มีข้อมูลความก้าวหน้า
        </h3>
        <p className="text-gray-600 mb-6">
          เริ่มต้นติดตามความก้าวหน้าโดยทำการวิเคราะห์ผิวครั้งแรก
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Progress Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            ติดตามความก้าวหน้าการรักษาผิวของคุณ
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportJSON} variant="outline" size="sm">
            📄 Export JSON
          </Button>
          <Button onClick={handleExportPDF} variant="default" size="sm">
            📑 Export PDF
          </Button>
        </div>
      </div>

      {/* Statistics Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">จำนวนครั้งที่ตรวจ</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDataPoints}</p>
            <p className="text-xs text-gray-500 mt-1">ครั้ง</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">ระยะเวลา</p>
            <p className="text-3xl font-bold text-gray-900">{stats.timeSpanDays}</p>
            <p className="text-xs text-gray-500 mt-1">วัน</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">ค่าเฉลี่ยการปรับปรุง</p>
            <p className={`text-3xl font-bold ${stats.averageImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.averageImprovement > 0 ? '+' : ''}{stats.averageImprovement.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">คะแนน</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">ความสม่ำเสมอ</p>
            <p className="text-3xl font-bold text-gray-900">{stats.consistencyScore.toFixed(0)}%</p>
            <Progress value={stats.consistencyScore} className="mt-2" />
          </Card>
        </div>
      )}

      {/* Overall Comparison */}
      {comparison && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📈 Overall Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">ระยะเวลา</p>
              <p className="text-2xl font-bold">{comparison.durationDays} วัน</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">แนวโน้ม</p>
              <Badge
                className={
                  comparison.trend === 'improving'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : comparison.trend === 'declining'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                }
              >
                {comparison.trend === 'improving' ? '📈 ดีขึ้น' : comparison.trend === 'declining' ? '📉 แย่ลง' : '➡️ คงที่'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">การเปลี่ยนแปลง</p>
              <p className={`text-2xl font-bold ${comparison.percentageChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.percentageChange > 0 ? '+' : ''}{comparison.percentageChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline Chart */}
      {timelineChartData.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              📉 Timeline Progress
            </h2>
            <div className="flex gap-2">
              <Button
                variant={showAllMetrics ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowAllMetrics(!showAllMetrics)}
              >
                {showAllMetrics ? 'แสดงสรุป' : 'แสดงทั้งหมด'}
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timelineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {showAllMetrics ? (
                <>
                  <Line type="monotone" dataKey="spots" stroke="#8b5cf6" name="Spots" />
                  <Line type="monotone" dataKey="pores" stroke="#ec4899" name="Pores" />
                  <Line type="monotone" dataKey="wrinkles" stroke="#f59e0b" name="Wrinkles" />
                  <Line type="monotone" dataKey="texture" stroke="#3b82f6" name="Texture" />
                  <Line type="monotone" dataKey="redness" stroke="#ef4444" name="Redness" />
                  <Line type="monotone" dataKey="hydration" stroke="#06b6d4" name="Hydration" />
                  <Line type="monotone" dataKey="skinTone" stroke="#84cc16" name="Skin Tone" />
                  <Line type="monotone" dataKey="elasticity" stroke="#14b8a6" name="Elasticity" />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Overall Health"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Comparison Bar Chart */}
      {comparisonChartData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 Metric Improvements
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="change"
                fill="#8b5cf6"
                name="Change"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Radar Chart - Current Status */}
      {radarChartData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Current Status
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              🎯 Milestones
            </h2>
            <Button variant="outline" size="sm" onClick={generateMilestones}>
              สร้างเป้าหมายใหม่
            </Button>
          </div>
          <div className="space-y-4">
            {milestones.map(milestone => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </Card>
      )}

      {/* Improvement Rates */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          📈 Improvement Rates
        </h2>
        <ImprovementRatesDisplay getImprovementRates={getImprovementRates} />
      </Card>
    </div>
  );
};

/**
 * Milestone Card Component
 */
const MilestoneCard: React.FC<{ milestone: Milestone }> = ({ milestone }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-gray-900">{milestone.title}</h3>
          <p className="text-sm text-gray-600">{milestone.description}</p>
        </div>
        {milestone.achieved && (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            ✓ สำเร็จ
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">ความก้าวหน้า</span>
          <span className="font-semibold">{milestone.progress.toFixed(0)}%</span>
        </div>
        <Progress value={milestone.progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>ปัจจุบัน: {milestone.currentValue.toFixed(1)}</span>
          <span>เป้าหมาย: {milestone.targetValue.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Improvement Rates Display Component
 */
const ImprovementRatesDisplay: React.FC<{
  getImprovementRates: () => Record<string, number> | null;
}> = ({ getImprovementRates }) => {
  const rates = getImprovementRates();

  if (!rates) {
    return <p className="text-gray-500">ไม่มีข้อมูลเพียงพอในการคำนวณ</p>;
  }

  const metricLabels: Record<string, string> = {
    spots: 'จุดด่างดำ',
    pores: 'รูขุมขน',
    wrinkles: 'ริ้วรอย',
    texture: 'เนื้อผิว',
    redness: 'ความแดง',
    hydration: 'ความชุ่มชื้น',
    skinTone: 'สีผิว',
    elasticity: 'ความยืดหยุ่น',
    overallHealth: 'สุขภาพรวม',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(rates).map(([key, rate]) => (
        <div key={key} className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{metricLabels[key]}</p>
          <p className={`text-lg font-bold ${rate > 0 ? 'text-green-600' : rate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {rate > 0 ? '+' : ''}{rate.toFixed(3)} / วัน
          </p>
        </div>
      ))}
    </div>
  );
};

export default ProgressDashboard;

'use client';

/**
 * Analysis Comparison Component
 * Side-by-side comparison of 2-4 VISIA analysis sessions
 * Features: Parameter change highlighting, synchronized zoom/pan, timeline slider
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';

type TrendType = 'improvement' | 'decline' | 'stable';

interface ComparisonSession {
  id: string;
  analysis: HybridSkinAnalysis;
  date: Date;
  label?: string;
}

interface AnalysisComparisonProps {
  sessions: ComparisonSession[];
  locale?: 'th' | 'en';
  onSelectSession?: (sessionId: string) => void;
  maxSessions?: 2 | 3 | 4;
}

// Translation dictionary
const TRANSLATIONS = {
  en: {
    title: 'Analysis Comparison',
    description: 'Compare multiple analysis sessions side-by-side',
    selectSessions: 'Select Sessions to Compare',
    timeline: 'Timeline',
    viewMode: 'View Mode',
    sideBySide: 'Side by Side',
    overlay: 'Overlay',
    difference: 'Difference Map',
    parameters: 'Parameters',
    overall: 'Overall',
    spots: 'Spots',
    pores: 'Pores',
    wrinkles: 'Wrinkles',
    texture: 'Texture',
    redness: 'Redness',
    score: 'Score',
    percentile: 'Percentile',
    severity: 'Severity',
    count: 'Count',
    change: 'Change',
    improvement: 'Improvement',
    decline: 'Decline',
    noChange: 'No Change',
    session: 'Session',
    date: 'Date',
    zoomLevel: 'Zoom Level',
    syncZoom: 'Sync Zoom',
    resetView: 'Reset View',
    grid: 'Grid View',
    detailedComparison: 'Detailed Comparison',
    summary: 'Summary',
    parameterChanges: 'Parameter Changes',
    overallProgress: 'Overall Progress',
    timeRange: 'Time Range',
    days: 'days',
    selectAtLeast2: 'Select at least 2 sessions to compare',
    comparing: 'Comparing',
    of: 'of',
    selected: 'selected',
    improved: 'Improved',
    worsened: 'Worsened',
    stable: 'Stable',
    trendAnalysis: 'Trend Analysis',
    ascending: 'Ascending',
    descending: 'Descending',
    fluctuating: 'Fluctuating',
  },
  th: {
    title: 'เปรียบเทียบการวิเคราะห์',
    description: 'เปรียบเทียบการวิเคราะห์หลายครั้งแบบเคียงข้าง',
    selectSessions: 'เลือกการวิเคราะห์ที่ต้องการเปรียบเทียบ',
    timeline: 'ไทม์ไลน์',
    viewMode: 'โหมดการแสดงผล',
    sideBySide: 'เคียงข้าง',
    overlay: 'ซ้อนทับ',
    difference: 'แผนที่ความแตกต่าง',
    parameters: 'พารามิเตอร์',
    overall: 'โดยรวม',
    spots: 'จุดด่างดำ',
    pores: 'รูขุมขน',
    wrinkles: 'ริ้วรอย',
    texture: 'เนื้อผิว',
    redness: 'รอยแดง',
    score: 'คะแนน',
    percentile: 'เปอร์เซ็นไทล์',
    severity: 'ความรุนแรง',
    count: 'จำนวน',
    change: 'การเปลี่ยนแปลง',
    improvement: 'ดีขึ้น',
    decline: 'แย่ลง',
    noChange: 'ไม่เปลี่ยนแปลง',
    session: 'ครั้งที่',
    date: 'วันที่',
    zoomLevel: 'ระดับการซูม',
    syncZoom: 'ซิงค์การซูม',
    resetView: 'รีเซ็ตมุมมอง',
    grid: 'มุมมองตาราง',
    detailedComparison: 'เปรียบเทียบรายละเอียด',
    summary: 'สรุป',
    parameterChanges: 'การเปลี่ยนแปลงของพารามิเตอร์',
    overallProgress: 'ความคืบหน้าโดยรวม',
    timeRange: 'ช่วงเวลา',
    days: 'วัน',
    selectAtLeast2: 'เลือกอย่างน้อย 2 การวิเคราะห์เพื่อเปรียบเทียบ',
    comparing: 'กำลังเปรียบเทียบ',
    of: 'จาก',
    selected: 'ที่เลือก',
    improved: 'ดีขึ้น',
    worsened: 'แย่ลง',
    stable: 'คงที่',
    trendAnalysis: 'การวิเคราะห์แนวโน้ม',
    ascending: 'เพิ่มขึ้น',
    descending: 'ลดลง',
    fluctuating: 'ผันผวน',
  },
};

type ParameterKey = 'spots' | 'pores' | 'wrinkles' | 'texture' | 'redness' | 'overall';

export default function AnalysisComparison({
  sessions,
  locale = 'en',
  onSelectSession,
  maxSessions = 4,
}: Readonly<AnalysisComparisonProps>) {
  const t = TRANSLATIONS[locale];
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'sideBySide' | 'overlay'>('grid');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Sort sessions by date
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sessions]);

  // Auto-select first sessions if none selected
  useEffect(() => {
    if (selectedSessions.length === 0 && sortedSessions.length >= 2) {
      const initialSelection = sortedSessions
        .slice(0, Math.min(maxSessions, sortedSessions.length))
        .map((s) => s.id);
      setSelectedSessions(initialSelection);
    }
  }, [sortedSessions, maxSessions, selectedSessions.length]);

  // Get selected session objects
  const comparisonSessions = useMemo(() => {
    return selectedSessions
      .map((id) => sortedSessions.find((s) => s.id === id))
      .filter((s): s is ComparisonSession => s !== undefined);
  }, [selectedSessions, sortedSessions]);

  // Calculate parameter changes
  const parameterChanges = useMemo(() => {
    if (comparisonSessions.length < 2) return null;

    const first = comparisonSessions[0];
    const last = comparisonSessions.at(-1)!;

    const parameters: ParameterKey[] = ['spots', 'pores', 'wrinkles', 'texture', 'redness', 'overall'];
    
    return parameters.map((param) => {
      const firstValue = first.analysis.percentiles[param];
      const lastValue = last.analysis.percentiles[param];
      const change = lastValue - firstValue;
      const percentChange = firstValue > 0 ? (change / firstValue) * 100 : 0;

      let trend: TrendType;
      if (change > 2) {
        trend = 'improvement';
      } else if (change < -2) {
        trend = 'decline';
      } else {
        trend = 'stable';
      }

      return {
        parameter: param,
        firstValue,
        lastValue,
        change,
        percentChange,
        trend,
      };
    });
  }, [comparisonSessions]);

  // Calculate time range
  const timeRange = useMemo(() => {
    if (comparisonSessions.length < 2) return 0;
    const first = comparisonSessions[0].date.getTime();
    const last = comparisonSessions.at(-1)!.date.getTime();
    return Math.floor((last - first) / (1000 * 60 * 60 * 24));
  }, [comparisonSessions]);

  // Toggle session selection
  const toggleSession = (sessionId: string) => {
    setSelectedSessions((prev) => {
      if (prev.includes(sessionId)) {
        return prev.filter((id) => id !== sessionId);
      } else if (prev.length < maxSessions) {
        return [...prev, sessionId];
      }
      return prev;
    });
  };

  // Get trend icon
  const getTrendIcon = (trend: 'improvement' | 'decline' | 'stable') => {
    switch (trend) {
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decline':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get trend color
  const getTrendColor = (trend: 'improvement' | 'decline' | 'stable') => {
    switch (trend) {
      case 'improvement':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'decline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (sessions.length < 2) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t.selectAtLeast2}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ArrowUpDown className="h-6 w-6" />
          {t.title}
        </h2>
        <p className="text-muted-foreground mt-1">{t.description}</p>
      </div>

      {/* Session Selection Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.selectSessions}</CardTitle>
          <CardDescription>
            {t.comparing} {selectedSessions.length} {t.of} {sessions.length} {t.selected}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Timeline slider */}
            <div className="relative">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex-1 space-y-2">
                  <Slider
                    value={[currentIndex]}
                    max={sortedSessions.length - 1}
                    step={1}
                    onValueChange={(value) => setCurrentIndex(value[0])}
                    className="flex-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-2">
                    {sortedSessions.map((session, idx) => (
                      <span key={session.id} className={idx === currentIndex ? 'font-bold' : ''}>
                        {session.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentIndex(Math.min(sortedSessions.length - 1, currentIndex + 1))
                  }
                  disabled={currentIndex === sortedSessions.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Session cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sortedSessions.map((session, idx) => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-all ${
                    selectedSessions.includes(session.id)
                      ? 'ring-2 ring-primary shadow-md'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  onClick={() => toggleSession(session.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold">
                        {t.session} {idx + 1}
                      </div>
                      {selectedSessions.includes(session.id) && (
                        <Badge variant="default" className="text-xs">
                          {selectedSessions.indexOf(session.id) + 1}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {session.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {session.analysis.percentiles.overall}
                    </div>
                    <div className="text-xs text-muted-foreground">{t.score}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {comparisonSessions.length >= 2 && (
        <>
          {/* Controls */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* View Mode */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    {t.grid}
                  </Button>
                  <Button
                    variant={viewMode === 'sideBySide' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('sideBySide')}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {t.sideBySide}
                  </Button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                    disabled={zoomLevel <= 50}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium w-16 text-center">
                    {zoomLevel}%
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                    disabled={zoomLevel >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(100)}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    {t.resetView}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t.timeRange}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeRange}</div>
                <p className="text-xs text-muted-foreground">{t.days}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t.overallProgress}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {(() => {
                      const lastScore = comparisonSessions.at(-1)?.analysis.percentiles.overall || 0;
                      const firstScore = comparisonSessions[0].analysis.percentiles.overall;
                      const change = lastScore - firstScore;
                      return `${change > 0 ? '+' : ''}${change}`;
                    })()}
                  </div>
                  {(() => {
                    const lastScore = comparisonSessions.at(-1)?.analysis.percentiles.overall || 0;
                    const firstScore = comparisonSessions[0].analysis.percentiles.overall;
                    const change = lastScore - firstScore;
                    let trend: TrendType;
                    if (change > 2) {
                      trend = 'improvement';
                    } else if (change < -2) {
                      trend = 'decline';
                    } else {
                      trend = 'stable';
                    }
                    return getTrendIcon(trend);
                  })()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {comparisonSessions[0].analysis.percentiles.overall} →{' '}
                  {comparisonSessions.at(-1)?.analysis.percentiles.overall}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t.parameterChanges}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>
                      {parameterChanges?.filter((p) => p.trend === 'improvement').length || 0}{' '}
                      {t.improved}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span>
                      {parameterChanges?.filter((p) => p.trend === 'decline').length || 0}{' '}
                      {t.worsened}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Minus className="h-3 w-3 text-gray-400" />
                    <span>
                      {parameterChanges?.filter((p) => p.trend === 'stable').length || 0}{' '}
                      {t.stable}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison */}
          <Tabs defaultValue="parameters" className="space-y-4">
            <TabsList>
              <TabsTrigger value="parameters">{t.parameters}</TabsTrigger>
              <TabsTrigger value="summary">{t.summary}</TabsTrigger>
              <TabsTrigger value="trend">{t.trendAnalysis}</TabsTrigger>
            </TabsList>

            <TabsContent value="parameters" className="space-y-4">
              {/* Parameter Comparison Cards */}
              {parameterChanges?.map((paramChange) => (
                <Card key={paramChange.parameter}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{t[paramChange.parameter]}</span>
                      <Badge className={getTrendColor(paramChange.trend)}>
                        {getTrendIcon(paramChange.trend)}
                        <span className="ml-2">
                          {paramChange.change > 0 && '+'}
                          {paramChange.change.toFixed(1)}
                        </span>
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Session Values */}
                      <div
                        className={`grid gap-4 ${
                          viewMode === 'grid'
                            ? `grid-cols-${Math.min(comparisonSessions.length, 4)}`
                            : 'grid-cols-2'
                        }`}
                      >
                        {comparisonSessions.map((session, idx) => (
                          <div
                            key={session.id}
                            className="p-4 bg-muted rounded-lg"
                            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
                          >
                            <div className="text-xs text-muted-foreground mb-2">
                              {t.session} {idx + 1}
                            </div>
                            <div className="text-2xl font-bold mb-1">
                              {session.analysis.percentiles[paramChange.parameter]}
                              <span className="text-sm font-normal">th</span>
                            </div>
                            <Progress
                              value={session.analysis.percentiles[paramChange.parameter]}
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground mt-2">
                              {session.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Change Indicator */}
                      <div className="flex items-center justify-center gap-4 py-2">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">{t.change}</div>
                          <div className="text-lg font-bold">
                            {paramChange.change > 0 && '+'}
                            {paramChange.change.toFixed(1)} ({paramChange.percentChange > 0 && '+'}
                            {paramChange.percentChange.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>{t.detailedComparison}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">{t.parameters}</th>
                          {comparisonSessions.map((session, idx) => (
                            <th key={session.id} className="text-center py-3 px-4">
                              {t.session} {idx + 1}
                            </th>
                          ))}
                          <th className="text-center py-3 px-4">{t.change}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parameterChanges?.map((paramChange) => (
                          <tr key={paramChange.parameter} className="border-b">
                            <td className="py-3 px-4 font-medium">{t[paramChange.parameter]}</td>
                            {comparisonSessions.map((session) => (
                              <td key={session.id} className="text-center py-3 px-4">
                                {session.analysis.percentiles[paramChange.parameter]}
                              </td>
                            ))}
                            <td className="text-center py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                {getTrendIcon(paramChange.trend)}
                                <span
                                  className={
                                    (() => {
                                      if (paramChange.change > 0) return 'text-green-600';
                                      if (paramChange.change < 0) return 'text-red-600';
                                      return '';
                                    })()
                                  }
                                >
                                  {paramChange.change > 0 && '+'}
                                  {paramChange.change.toFixed(1)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trend">
              <Card>
                <CardHeader>
                  <CardTitle>{t.trendAnalysis}</CardTitle>
                  <CardDescription>
                    Parameter trends over {comparisonSessions.length} sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {parameterChanges?.map((paramChange) => {
                      const values = comparisonSessions.map(
                        (s) => s.analysis.percentiles[paramChange.parameter]
                      );
                      const isAscending = values.every((v, i) => i === 0 || v >= values[i - 1]);
                      const isDescending = values.every((v, i) => i === 0 || v <= values[i - 1]);
                      let trendType: string;
                      if (isAscending) {
                        trendType = 'ascending';
                      } else if (isDescending) {
                        trendType = 'descending';
                      } else {
                        trendType = 'fluctuating';
                      }

                      return (
                        <div key={paramChange.parameter} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{t[paramChange.parameter]}</span>
                            <Badge variant="outline">{t[trendType as keyof typeof t]}</Badge>
                          </div>
                          <div className="flex items-end gap-1 h-24">
                            {values.map((value, idx) => (
                              <div
                                key={`${paramChange.parameter}-${idx}`}
                                className="flex-1 bg-primary rounded-t transition-all hover:opacity-80"
                                style={{ height: `${(value / 100) * 100}%` }}
                                title={`${value}th percentile`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            {comparisonSessions.map((session, idx) => (
                              <span key={session.id}>
                                {session.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                                  month: 'short',
                                })}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

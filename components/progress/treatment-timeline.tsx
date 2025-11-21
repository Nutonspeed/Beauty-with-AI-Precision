'use client';

import { useState } from 'react';
import { ProgressPhoto, TimelineEntry } from '@/types/progress';
import { formatTimeElapsed } from '@/lib/progress/metric-calculator';

interface TreatmentTimelineProps {
  photos: ProgressPhoto[];
  startDate: string;
}

export default function TreatmentTimeline({ photos, startDate }: TreatmentTimelineProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Sort photos by date
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime()
  );

  // Calculate timeline entries
  const timelineEntries: TimelineEntry[] = sortedPhotos.map((photo) => ({
    date: photo.taken_at,
    type: 'photo',
    photo,
  }));

  // Calculate days since start
  const calculateDaysSince = (date: string) => {
    const start = new Date(startDate);
    const current = new Date(date);
    return Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get photo by type
  const latestPhoto = sortedPhotos[sortedPhotos.length - 1];

  // Calculate metrics trend
  const metricsHistory = sortedPhotos.map((photo) => ({
    date: photo.taken_at,
    spots: photo.analysis_results?.spots || 0,
    pores: photo.analysis_results?.pores || 0,
    wrinkles: photo.analysis_results?.wrinkles || 0,
    texture_score: photo.analysis_results?.texture_score || 0,
    redness: photo.analysis_results?.redness || 0,
  }));

  // Calculate improvement over time
  const calculateTrend = (metric: 'spots' | 'pores' | 'wrinkles' | 'redness') => {
    if (metricsHistory.length < 2) return 'stable';
    const first = metricsHistory[0][metric];
    const last = metricsHistory[metricsHistory.length - 1][metric];
    const change = ((first - last) / first) * 100;
    
    if (change > 10) return 'improving';
    if (change < -10) return 'worsening';
    return 'stable';
  };

  const selectedPhoto = sortedPhotos.find((p) => p.id === selectedPhotoId);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-600 mb-1">ระยะเวลา</div>
          <div className="text-2xl font-bold text-gray-900">
            {calculateDaysSince(latestPhoto.taken_at)} วัน
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-600 mb-1">จำนวนภาพ</div>
          <div className="text-2xl font-bold text-gray-900">{sortedPhotos.length} ภาพ</div>
        </div>
      </div>

      {/* Metrics Trend */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="font-semibold mb-3">แนวโน้มการเปลี่ยนแปลง</h3>
        <div className="space-y-3">
          {[
            { label: 'ฝ้า-กระ', metric: 'spots' as const },
            { label: 'รูขุมขน', metric: 'pores' as const },
            { label: 'ริ้วรอย', metric: 'wrinkles' as const },
            { label: 'ความแดง', metric: 'redness' as const },
          ].map(({ label, metric }) => {
            const trend = calculateTrend(metric);
            const firstValue = metricsHistory[0]?.[metric] || 0;
            const lastValue = metricsHistory[metricsHistory.length - 1]?.[metric] || 0;
            const change = firstValue !== 0 ? ((firstValue - lastValue) / firstValue) * 100 : 0;

            return (
              <div key={metric} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{label}</span>
                  {trend === 'improving' && <span className="text-green-600">↓</span>}
                  {trend === 'worsening' && <span className="text-red-600">↑</span>}
                  {trend === 'stable' && <span className="text-gray-400">→</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {firstValue} → {lastValue}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      trend === 'improving'
                        ? 'text-green-600'
                        : trend === 'worsening'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {change > 0 ? '-' : '+'}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="font-semibold mb-4">เส้นเวลา</h3>
        <div className="space-y-4">
          {timelineEntries.map((entry, index) => {
            const photo = entry.photo!;
            const daysSince = calculateDaysSince(photo.taken_at);
            const isSelected = selectedPhotoId === photo.id;

            return (
              <div key={photo.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      photo.photo_type === 'baseline'
                        ? 'bg-blue-500'
                        : photo.photo_type === 'final'
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                    }`}
                  ></div>
                  {index < timelineEntries.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">
                        {photo.photo_type === 'baseline'
                          ? 'ภาพพื้นฐาน (ก่อนเริ่ม)'
                          : photo.photo_type === 'final'
                            ? 'ภาพสุดท้าย'
                            : `ติดตามผล ${photo.session_number ? `#${photo.session_number}` : ''}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(photo.taken_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{formatTimeElapsed(daysSince)}</div>
                  </div>

                  {/* Thumbnail */}
                  <button
                    onClick={() => setSelectedPhotoId(isSelected ? null : photo.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                    aria-label={isSelected ? "ยกเลิกการเลือกภาพ" : "เลือกภาพเพื่อดูรายละเอียด"}
                    title={isSelected ? "ยกเลิกการเลือกภาพ" : "เลือกภาพเพื่อดูรายละเอียด"}
                  >
                    <span className="sr-only">
                      {isSelected ? "ยกเลิกการเลือกภาพ" : "เลือกภาพเพื่อดูรายละเอียด"}
                    </span>
                    <img
                      src={photo.thumbnail_url || photo.image_url}
                      alt="Progress photo"
                      className="w-24 h-24 object-cover"
                    />
                    {photo.is_verified && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Notes */}
                  {photo.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {photo.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Photo Details */}
      {selectedPhoto && (
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">รายละเอียดภาพ</h3>
            <button
              onClick={() => setSelectedPhotoId(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Full Image */}
          <img
            src={selectedPhoto.image_url}
            alt="Selected"
            className="w-full rounded-lg mb-3"
          />

          {/* Metrics */}
          {selectedPhoto.analysis_results && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-gray-600">ฝ้า-กระ</div>
                <div className="font-medium">{selectedPhoto.analysis_results.spots || 0}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-gray-600">รูขุมขน</div>
                <div className="font-medium">{selectedPhoto.analysis_results.pores || 0}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-gray-600">ริ้วรอย</div>
                <div className="font-medium">{selectedPhoto.analysis_results.wrinkles || 0}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-gray-600">ความแดง</div>
                <div className="font-medium">{selectedPhoto.analysis_results.redness || 0}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

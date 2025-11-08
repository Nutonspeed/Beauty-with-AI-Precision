'use client';

import { useState, useEffect, useRef } from 'react';
import { ProgressPhoto } from '@/types/progress';

interface PhotoComparisonProps {
  beforePhoto?: ProgressPhoto;
  afterPhoto?: ProgressPhoto;
  showMetrics?: boolean;
}

export default function PhotoComparison({
  beforePhoto,
  afterPhoto,
  showMetrics = true,
}: PhotoComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isAligning, setIsAligning] = useState(true); // Start with aligning true
  const [alignedAfterUrl, setAlignedAfterUrl] = useState(afterPhoto?.image_url);
  const [alignmentScore, setAlignmentScore] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-align photos on mount or when photos change
  useEffect(() => {
    const performAlignment = async () => {
      if (!beforePhoto?.image_url || !afterPhoto?.image_url) {
        setIsAligning(false);
        if (afterPhoto?.image_url) {
          setAlignedAfterUrl(afterPhoto.image_url);
        }
        return;
      }

      setIsAligning(true);
      setAlignedAfterUrl(afterPhoto.image_url); // Show original while aligning
      setAlignmentScore(null);

      try {
        const response = await fetch('/api/align', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceImageUrl: afterPhoto.image_url,
            targetImageUrl: beforePhoto.image_url,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Alignment API request failed');
        }

        const result = await response.json();
        setAlignedAfterUrl(result.alignedImageUrl);
        setAlignmentScore(result.alignmentScore);
      } catch (error) {
        console.error('Alignment failed:', error);
        // Use original if alignment fails
        if (afterPhoto?.image_url) {
          setAlignedAfterUrl(afterPhoto.image_url);
        }
        setAlignmentScore(null); // Reset score on failure
      } finally {
        setIsAligning(false);
      }
    };

    performAlignment();
  }, [beforePhoto?.image_url, afterPhoto?.image_url]);

  // Handle slider drag
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  if (!beforePhoto || !afterPhoto) {
    return (
      <div className="aspect-[4/3] flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">กรุณาเลือกภาพเพื่อเปรียบเทียบ</p>
      </div>
    );
  }

  // Calculate metrics
  const beforeMetrics = beforePhoto.analysis_results || {};
  const afterMetrics = afterPhoto.analysis_results || {};

  const calculateImprovement = (before: number, after: number) => {
    if (before === 0) return after > 0 ? -100 : 0;
    return ((before - after) / before) * 100;
  };

  const metrics = [
    {
      label: 'ฝ้า-กระ',
      before: beforeMetrics.spots || 0,
      after: afterMetrics.spots || 0,
      improvement: calculateImprovement(beforeMetrics.spots || 0, afterMetrics.spots || 0),
    },
    {
      label: 'รูขุมขน',
      before: beforeMetrics.pores || 0,
      after: afterMetrics.pores || 0,
      improvement: calculateImprovement(beforeMetrics.pores || 0, afterMetrics.pores || 0),
    },
    {
      label: 'ริ้วรอย',
      before: beforeMetrics.wrinkles || 0,
      after: afterMetrics.wrinkles || 0,
      improvement: calculateImprovement(beforeMetrics.wrinkles || 0, afterMetrics.wrinkles || 0),
    },
    {
      label: 'ความแดง',
      before: beforeMetrics.redness || 0,
      after: afterMetrics.redness || 0,
      improvement: calculateImprovement(beforeMetrics.redness || 0, afterMetrics.redness || 0),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Comparison Slider */}
      <div
        ref={containerRef}
        className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-col-resize select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Before Image (Full) */}
        <div className="absolute inset-0">
          <img
            src={beforePhoto.image_url}
            alt="Before"
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
            ก่อน
          </div>
        </div>

        {/* After Image (Clipped) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          {isAligning ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 font-medium">กำลังจัดตำแหน่งภาพ...</p>
              </div>
            </div>
          ) : (
            <img
              src={alignedAfterUrl}
              alt="After"
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
            หลัง
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-10"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

        {/* Alignment Score */}
        {alignmentScore !== null && (
          <div className={`absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-xs ${alignmentScore < 0.7 ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-black/50' : ''}`}>
            {alignmentScore >= 0.7 ? '✓' : '⚠️'} Alignment: {(alignmentScore * 100).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Date Labels */}
      <div className="flex justify-between text-sm text-gray-600">
        <div>
          <div className="font-medium">วันที่ถ่ายภาพ</div>
          <div>{new Date(beforePhoto.taken_at).toLocaleDateString('th-TH')}</div>
        </div>
        <div className="text-right">
          <div className="font-medium">วันที่ถ่ายภาพ</div>
          <div>{new Date(afterPhoto.taken_at).toLocaleDateString('th-TH')}</div>
        </div>
      </div>

      {/* Metrics Comparison */}
      {showMetrics && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">การเปลี่ยนแปลง</h3>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{metric.label}</span>
                  <span
                    className={`font-medium ${
                      metric.improvement > 0
                        ? 'text-green-600'
                        : metric.improvement < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {metric.improvement > 0 ? '↓' : metric.improvement < 0 ? '↑' : '→'}{' '}
                    {Math.abs(metric.improvement).toFixed(1)}%
                  </span>
                </div>
                <div className="flex gap-2 text-xs text-gray-500">
                  <div>ก่อน: {metric.before.toFixed(0)}</div>
                  <div>หลัง: {metric.after.toFixed(0)}</div>
                  <div className={`ml-auto font-medium ${
                      metric.improvement > 0
                        ? 'text-green-600'
                        : metric.improvement < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                  }`}>
                    {metric.before - metric.after > 0 ? '-' : '+'}{Math.abs(metric.before - metric.after).toFixed(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <div className="font-medium mb-1">💡 วิธีใช้งาน</div>
        <div>ลากเส้นตรงกลางเพื่อเปรียบเทียบภาพก่อน-หลัง</div>
      </div>
    </div>
  );
}

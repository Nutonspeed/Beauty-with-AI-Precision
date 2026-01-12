'use client';

import { useState, useEffect } from 'react';
import { ProgressPhoto } from '@/types/progress';
import PhotoComparison from '@/components/progress/photo-comparison';
import ProgramTimelineChart from '@/components/progress/program-timeline-chart';
import { Upload, CheckCircle, TrendingUp as TrendingUpIcon, Camera, FileDown, AlertTriangle, Loader } from 'lucide-react';

export default function ProgressTrackingPage() {
  const [activeTab, setActiveTab] = useState<'comparison' | 'timeline'>('comparison');
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBeforeId, setSelectedBeforeId] = useState<string | null>(null);
  const [selectedAfterId, setSelectedAfterId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/progress');
        if (!response.ok) {
          throw new Error('Failed to fetch progress photos.');
        }
        const data: ProgressPhoto[] = await response.json();
        setPhotos(data);
        if (data.length >= 2) {
          setSelectedBeforeId(data[0].id);
          setSelectedAfterId(data[data.length - 1].id);
        } else if (data.length === 1) {
          setSelectedBeforeId(data[0].id);
          setSelectedAfterId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const beforePhoto = photos.find((p) => p.id === selectedBeforeId);
  const afterPhoto = photos.find((p) => p.id === selectedAfterId);

  // Calculate overall improvement
  const calculateOverallImprovement = () => {
    if (!beforePhoto?.analysis_results || !afterPhoto?.analysis_results) return 0;
    
    const beforeScore = beforePhoto.analysis_results.overall_score || 0;
    const afterScore = afterPhoto.analysis_results.overall_score || 0;
    
    if (beforeScore === 0) return afterScore > 0 ? 100 : 0;

    return ((afterScore - beforeScore) / beforeScore) * 100;
  };

  const overallImprovement = calculateOverallImprovement();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">กำลังโหลดข้อมูลความคืบหน้า...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition-colors"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">เริ่มต้นการติดตามผล</h2>
                <p className="text-gray-500 mb-6">ยังไม่มีภาพถ่ายสำหรับติดตามผลการรักษาของคุณ<br/>อัปโหลดภาพแรกเพื่อเริ่มต้นเส้นทางการมีผิวสุขภาพดี</p>
                <button className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
                    <Upload className="w-5 h-5" />
                    อัปโหลดภาพแรกของคุณ
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-2">ติดตามผลการรักษา</h1>
          <p className="text-gray-600">เปรียบเทียบภาพก่อน-หลัง และดูความคืบหน้า</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">การปรับปรุงโดยรวม</div>
                <div className="text-2xl font-bold text-green-600">
                  {overallImprovement >= 0 ? '+' : ''}
                  {overallImprovement.toFixed(1)}%
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <TrendingUpIcon className="w-6 h-6 text-green-600" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">จำนวนภาพทั้งหมด</div>
                <div className="text-2xl font-bold text-blue-600">{photos.length} ภาพ</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">ภาพที่ยืนยันแล้ว</div>
                <div className="text-2xl font-bold text-purple-600">
                  {photos.filter((p) => p.is_verified).length} ภาพ
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-8">
              <button
                onClick={() => setActiveTab('comparison')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'comparison'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                เปรียบเทียบภาพ
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                เส้นเวลา
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area */}
          <div className="lg:col-span-2">
            {activeTab === 'comparison' ? (
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">เปรียบเทียบก่อน-หลัง</h2>
                {beforePhoto && afterPhoto ? (
                  <PhotoComparison beforePhoto={beforePhoto} afterPhoto={afterPhoto} />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>เลือกภาพเพื่อทำการเปรียบเทียบ</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">เส้นเวลาการรักษา</h2>
                <ProgramTimelineChart photos={photos} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Photo Selector */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-3">เลือกภาพเปรียบเทียบ</h3>
              
              <div className="mb-4">
                <label htmlFor="before-photo-select" className="block text-sm text-gray-700 mb-2">ภาพก่อน</label>
                <select
                  id="before-photo-select"
                  value={selectedBeforeId || ''}
                  onChange={(e) => setSelectedBeforeId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  aria-label="เลือกภาพก่อน"
                >
                  {photos.map((photo) => (
                    <option key={photo.id} value={photo.id}>
                      {new Date(photo.taken_at).toLocaleDateString('th-TH')} -{' '}
                      {photo.photo_type === 'baseline'
                        ? 'พื้นฐาน'
                        : photo.photo_type === 'final'
                          ? 'สุดท้าย'
                          : `ติดตามผล #${photo.session_number}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="after-photo-select" className="block text-sm text-gray-700 mb-2">ภาพหลัง</label>
                <select
                  id="after-photo-select"
                  value={selectedAfterId || ''}
                  onChange={(e) => setSelectedAfterId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  aria-label="เลือกภาพหลัง"
                >
                  {photos.map((photo) => (
                    <option key={photo.id} value={photo.id}>
                      {new Date(photo.taken_at).toLocaleDateString('th-TH')} -{' '}
                      {photo.photo_type === 'baseline'
                        ? 'พื้นฐาน'
                        : photo.photo_type === 'final'
                          ? 'สุดท้าย'
                          : `ติดตามผล #${photo.session_number}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload New Photo */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-3">อัปโหลดภาพติดตามผล</h3>
              <button className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                เพิ่มภาพใหม่
              </button>
            </div>

            {/* Export Report */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-3">ส่งออกรายงาน</h3>
              <p className="text-sm text-gray-600 mb-3">
                ดาวน์โหลดรายงานการติดตามผลสำหรับนำไปให้แพทย์
              </p>
              <button className="w-full bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <FileDown className="w-4 h-4" />
                ดาวน์โหลด PDF
              </button>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-blue-900">💡 คำแนะนำ</h3>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li>ถ่ายภาพทุก 2-4 สัปดาห์</li>
                <li>ใช้แสงสว่างเหมือนเดิม</li>
                <li>มุมกล้องและระยะเท่าเดิม</li>
                <li>ไม่แต่งหน้าเมื่อถ่ายภาพ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

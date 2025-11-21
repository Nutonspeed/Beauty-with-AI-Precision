'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  EnhancedTreatmentSimulator,
  TreatmentDefinition,
  CombinedTreatmentPlan,
} from '@/lib/enhanced-treatment-simulator';
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  Zap,
  Calendar,
  AlertCircle,
  Check,
  Clock,
  Activity,
} from 'lucide-react';

interface Props {
  language?: 'th' | 'en';
  onTreatmentPlanSelect?: (plan: CombinedTreatmentPlan) => void;
}

const translations = {
  th: {
    title: 'จำลองการรักษาขั้นสูง',
    selectTreatments: 'เลือกการรักษา',
    availableTreatments: 'การรักษาที่มี',
    selectedTreatments: 'การรักษาที่เลือก',
    addTreatment: 'เพิ่มการรักษา',
    removeTreatment: 'ลบการรักษา',
    simulate: 'จำลอง',
    preview: 'ดูตัวอย่าง',
    stop: 'หยุด',
    reset: 'รีเซ็ต',
    treatmentPlan: 'แผนการรักษา',
    beforeAfter: 'ก่อนหลัง',
    timeline: 'ไทม์ไลน์',
    effectsOverTime: 'เอฟเฟกต์เมื่อเวลาผ่านไป',
    expectedResults: 'ผลลัพธ์ที่คาดหวัง',
    totalDuration: 'ระยะเวลารวม',
    totalCost: 'ต้นทุนรวม',
    synergies: 'การทำงานร่วมกัน',
    risks: 'ความเสี่ยง',
    sessionInfo: 'ข้อมูลเซสชั่น',
    downtime: 'เวลาหยุดตัว',
    recovery: 'เวลา회복',
    suitableFor: 'เหมาะสำหรับ',
    effects: 'เอฟเฟกต์',
    improvement: 'การปรับปรุง',
    immediateResult: 'ผลลัพธ์ทันที',
    delayedResult: 'ผลลัพธ์ที่ล่าช้า',
    days: 'วัน',
    weeks: 'สัปดาห์',
    animationProgress: 'ความคืบหน้าของแอนิเมชัน',
    noTreatmentsSelected: 'ไม่มีการรักษาที่เลือก',
    startDate: 'วันที่เริ่มต้น',
    projectedEndDate: 'วันที่สิ้นสุดที่คาดการณ์',
    months: 'เดือน',
    performanceMetrics: 'เมตริกประสิทธิภาพ',
    textureSmoothing: 'การทำให้บรรเทาเนื้อหนัง',
    radianceBoost: 'การเพิ่มความสว่าง',
    uniformity: 'ความสม่ำเสมอ',
  },
  en: {
    title: 'Enhanced Treatment Simulator',
    selectTreatments: 'Select Treatments',
    availableTreatments: 'Available Treatments',
    selectedTreatments: 'Selected Treatments',
    addTreatment: 'Add Treatment',
    removeTreatment: 'Remove Treatment',
    simulate: 'Simulate',
    preview: 'Preview',
    stop: 'Stop',
    reset: 'Reset',
    treatmentPlan: 'Treatment Plan',
    beforeAfter: 'Before & After',
    timeline: 'Timeline',
    effectsOverTime: 'Effects Over Time',
    expectedResults: 'Expected Results',
    totalDuration: 'Total Duration',
    totalCost: 'Total Cost',
    synergies: 'Synergies',
    risks: 'Risks',
    sessionInfo: 'Session Info',
    downtime: 'Downtime',
    recovery: 'Recovery',
    suitableFor: 'Suitable For',
    effects: 'Effects',
    improvement: 'Improvement',
    immediateResult: 'Immediate Result',
    delayedResult: 'Delayed Result',
    days: 'days',
    weeks: 'weeks',
    animationProgress: 'Animation Progress',
    noTreatmentsSelected: 'No treatments selected',
    startDate: 'Start Date',
    projectedEndDate: 'Projected End Date',
    months: 'months',
    performanceMetrics: 'Performance Metrics',
    textureSmoothing: 'Texture Smoothing',
    radianceBoost: 'Radiance Boost',
    uniformity: 'Uniformity',
  },
};

export const EnhancedTreatmentSimulatorComponent: React.FC<Props> = ({
  language = 'en',
  onTreatmentPlanSelect,
}) => {
  const t = translations[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [availableTreatments, setAvailableTreatments] = useState<TreatmentDefinition[]>([]);
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CombinedTreatmentPlan | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationFrameId = useRef<number | undefined>(undefined);

  // Load available treatments
  useEffect(() => {
    const treatments = EnhancedTreatmentSimulator.getTreatmentLibrary();
    setAvailableTreatments(treatments);
  }, []);

  const handleAddTreatment = (treatmentId: string) => {
    if (!selectedTreatmentIds.includes(treatmentId)) {
      setSelectedTreatmentIds([...selectedTreatmentIds, treatmentId]);
    }
  };

  const handleRemoveTreatment = (treatmentId: string) => {
    setSelectedTreatmentIds(selectedTreatmentIds.filter((id) => id !== treatmentId));
  };

  const handleSimulate = () => {
    if (selectedTreatmentIds.length === 0) return;

    try {
      const plan = EnhancedTreatmentSimulator.createCombinedPlan(selectedTreatmentIds);
      setCurrentPlan(plan);

      // Start animation
      setAnimationProgress(0);
      animateSimulation();

      onTreatmentPlanSelect?.(plan);
    } catch (error) {
      console.error('Error creating treatment plan:', error);
    }
  };

  const animateSimulation = () => {
    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / 5000) * 100);

      setAnimationProgress(progress);
      drawSimulation(progress);

      if (progress < 100) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  };

  const drawSimulation = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw before/after comparison
    const midpoint = canvas.width / 2;
    const margin = 20;

    // Before side
    ctx.fillStyle = '#333';
    ctx.font = '16px bold';
    ctx.fillText(t.beforeAfter.split(' ')[0], margin + 50, 30);

    drawSkinVisualization(ctx, margin, 50, 200, 200, progress * 0, 50);

    // After side
    ctx.fillText(t.beforeAfter.split(' ')[1], midpoint + margin + 50, 30);
    drawSkinVisualization(ctx, midpoint + margin, 50, 200, 200, progress, 50);

    // Progress bar
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(margin, canvas.height - 50, canvas.width - 2 * margin, 20);

    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(
      margin,
      canvas.height - 50,
      ((canvas.width - 2 * margin) * progress) / 100,
      20
    );

    ctx.fillStyle = '#333';
    ctx.font = '14px';
    ctx.fillText(`${Math.round(progress)}%`, canvas.width / 2 - 15, canvas.height - 30);
  };

  const drawSkinVisualization = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    improvement: number,
    _baseOpacity: number
  ) => {
    // Draw skin tone base
    ctx.fillStyle = `rgba(220, 180, 150, ${0.3 + improvement * 0.002})`;
    ctx.fillRect(x, y, width, height);

    // Draw texture (becomes smoother with improvement)
    const textureIntensity = Math.max(0.1, 1 - improvement * 0.01);
    ctx.strokeStyle = `rgba(180, 140, 110, ${textureIntensity * 0.3})`;
    ctx.lineWidth = 0.5;

    for (let i = 0; i < 30; i++) {
      const px = x + Math.random() * width;
      const py = y + Math.random() * height;
      ctx.beginPath();
      ctx.arc(px, py, 1, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw radiance (glow effect increases with improvement)
    const glowIntensity = improvement * 0.002;
    ctx.fillStyle = `rgba(255, 255, 200, ${glowIntensity})`;
    ctx.fillRect(x, y, width, height);

    // Draw pores (become less visible with improvement)
    const poreVisibility = Math.max(0.1, 1 - improvement * 0.008);
    ctx.fillStyle = `rgba(100, 80, 70, ${poreVisibility * 0.4})`;
    for (let i = 0; i < 20; i++) {
      const px = x + Math.random() * width;
      const py = y + Math.random() * height;
      ctx.beginPath();
      ctx.arc(px, py, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleReset = () => {
    setAnimationProgress(0);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  const renderTreatmentCard = (treatment: TreatmentDefinition, isSelected: boolean) => (
    <div
      key={treatment.id}
      className={`border rounded-lg p-4 cursor-pointer transition ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{treatment.name}</h3>
          <p className="text-sm text-gray-600">{treatment.description}</p>
        </div>
        <button
          onClick={() =>
            isSelected
              ? handleRemoveTreatment(treatment.id)
              : handleAddTreatment(treatment.id)
          }
          className={`ml-2 p-2 rounded ${
            isSelected ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}
        >
          {isSelected ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{treatment.sessionDuration} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-4 h-4 text-gray-400" />
          <span>{treatment.numberOfSessions} sessions</span>
        </div>
      </div>

      {treatment.effects.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-600 mb-1">{t.effects}:</p>
          <div className="flex flex-wrap gap-1">
            {treatment.effects.slice(0, 3).map((effect) => (
              <span key={`${effect.concern}-${effect.improvement}`} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                {effect.concern}: {effect.improvement}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const getTimelineEventColor = (eventType: string): string => {
    if (eventType === 'session') return 'bg-blue-500';
    if (eventType === 'recovery') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <button
          onClick={() => {
            setSelectedTreatmentIds([]);
            setCurrentPlan(null);
            handleReset();
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {t.reset}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Treatment Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {t.selectTreatments}
            </h2>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">{t.availableTreatments}</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableTreatments.map((treatment) =>
                  renderTreatmentCard(treatment, selectedTreatmentIds.includes(treatment.id))
                )}
              </div>
            </div>

            {selectedTreatmentIds.length > 0 && (
              <button
                onClick={handleSimulate}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {t.simulate}
              </button>
            )}
          </div>
        </div>

        {/* Center: Simulation Canvas */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {t.preview}
            </h2>

            <canvas
              ref={canvasRef}
              width={300}
              height={400}
              className="w-full border border-gray-200 rounded"
            />

            <div className="space-y-2">
              <p className="text-sm text-gray-600">{t.animationProgress}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${animationProgress}%` } as React.CSSProperties}
                />
              </div>
              <p className="text-sm font-semibold text-gray-900">{Math.round(animationProgress)}%</p>
            </div>

            {currentPlan && (
              <div className="space-y-2">
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.reset}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Treatment Plan Details */}
        <div className="lg:col-span-1">
          {currentPlan ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t.treatmentPlan}
              </h2>

              {/* Duration and Cost */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600">{t.totalDuration}</p>
                  <p className="text-lg font-bold text-blue-600">
                    {Math.round(currentPlan.duration / 7)} {t.weeks || 'weeks'}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-gray-600">{t.totalCost}</p>
                  <p className="text-lg font-bold text-green-600">
                    ฿{Math.round(currentPlan.totalCost).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Expected Results */}
              {Object.entries(currentPlan.expectedImprovement).length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">{t.expectedResults}</p>
                  <div className="space-y-2">
                    {Object.entries(currentPlan.expectedImprovement)
                      .slice(0, 4)
                      .map(([concern, improvement]) => (
                        <div key={concern} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 capitalize">{concern}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-green-500 h-1.5 rounded-full"
                                style={{ width: `${improvement}%` } as React.CSSProperties}
                              />
                            </div>
                            <span className="font-semibold text-gray-900 w-8 text-right">
                              {Math.round(improvement)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Synergies */}
              {currentPlan.synergies.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-600" />
                    {t.synergies}
                  </p>
                  <ul className="space-y-1">
                    {currentPlan.synergies.map((synergy) => (
                      <li key={synergy} className="text-xs text-gray-600">
                        • {synergy}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {currentPlan.risks.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    {t.risks}
                  </p>
                  <ul className="space-y-1">
                    {currentPlan.risks.slice(0, 3).map((risk) => (
                      <li key={risk} className="text-xs text-gray-600">
                        • {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-gray-600">{t.noTreatmentsSelected}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      {currentPlan && currentPlan.timeline.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t.timeline}
          </h2>
          <div className="space-y-3">
            {currentPlan.timeline.slice(0, 8).map((event, idx) => (
              <div key={`${event.date.getTime()}-${event.event}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${getTimelineEventColor(event.type)}`}
                  />
                  {idx < currentPlan.timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-semibold text-gray-900">{event.event}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{event.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTreatmentSimulatorComponent;

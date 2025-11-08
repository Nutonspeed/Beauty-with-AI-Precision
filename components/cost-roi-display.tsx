'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  CostROICalculator,
  TreatmentCost,
  Currency,
  TreatmentType,
  ROIAnalysis,
  CostBreakdown,
} from '@/lib/cost-roi-calculator';

const translations = {
  en: {
    title: 'Cost Calculator & ROI Analyzer',
    addTreatment: 'Add Treatment',
    calculateROI: 'Calculate ROI',
    reset: 'Reset',
    treatmentName: 'Treatment Name',
    type: 'Type',
    basePrice: 'Price',
    quantity: 'Quantity',
    currency: 'Currency',
    frequency: 'Frequency',
    discount: 'Discount %',
    costBreakdown: 'Cost Breakdown',
    roiAnalysis: 'ROI Analysis',
    totalCost: 'Total Cost',
    monthlyAverage: 'Monthly Avg',
    yearlyProjection: 'Yearly Projection',
    roi: 'ROI',
    payback: 'Payback Period',
    effectiveness: 'Effectiveness',
    recommendations: 'Recommendations',
    byType: 'Cost by Type',
    timeline: 'Cost Timeline',
    noTreatments: 'No treatments added yet',
    summary: 'Summary',
  },
  th: {
    title: 'เครื่องคำนวณต้นทุน & ตัววิเคราะห์ ROI',
    addTreatment: 'เพิ่มการรักษา',
    calculateROI: 'คำนวณ ROI',
    reset: 'รีเซ็ต',
    treatmentName: 'ชื่อการรักษา',
    type: 'ประเภท',
    basePrice: 'ราคา',
    quantity: 'จำนวน',
    currency: 'สกุลเงิน',
    frequency: 'ความถี่',
    discount: 'ส่วนลด %',
    costBreakdown: 'การแยกรายละเอียดต้นทุน',
    roiAnalysis: 'การวิเคราะห์ ROI',
    totalCost: 'ต้นทุนทั้งหมด',
    monthlyAverage: 'ค่าเฉลี่ยรายเดือน',
    yearlyProjection: 'การคาดการณ์รายปี',
    roi: 'ROI',
    payback: 'ระยะเวลาคืนทุน',
    effectiveness: 'ประสิทธิผล',
    recommendations: 'คำแนะนำ',
    byType: 'ต้นทุนตามประเภท',
    timeline: 'ไทม์ไลน์ต้นทุน',
    noTreatments: 'ยังไม่มีการรักษาใด ๆ',
    summary: 'สรุป',
  },
};

type Locale = 'en' | 'th';

interface ComponentProps {
  language?: Locale;
  onCostChange?: (cost: CostBreakdown) => void;
}

export default function CostROIDisplay({
  language = 'en',
  onCostChange,
}: Readonly<ComponentProps>) {
  const t = translations[language] ?? translations.en;

  const [treatments, setTreatments] = useState<TreatmentCost[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'skincare' as TreatmentType,
    basePrice: 100,
    quantity: 1,
    currency: 'USD' as Currency,
    frequency: 'month' as const,
    discount: 0,
  });

  const [roiData, setRoiData] = useState<ROIAnalysis | null>(null);
  const [breakdown, setBreakdown] = useState<CostBreakdown | null>(null);

  const costBreakdownData = useMemo(() => {
    if (!breakdown) return [];

    return Object.entries(breakdown.byType)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => ({
        name: type,
        value: Number(value.toFixed(2)),
      }));
  }, [breakdown]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  const timelineData = useMemo(() => {
    if (treatments.length === 0) return [];

    const months = 12;
    const data: Array<{ month: string; cost: number }> = [];

    for (let i = 0; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);

      let cumulativeCost = 0;
      for (const treatment of treatments) {
        const adjustedPrice = treatment.totalPrice - (treatment.discount ?? 0);
        cumulativeCost += adjustedPrice * (i / 12);
      }

      data.push({
        month: `M${i}`,
        cost: Number(cumulativeCost.toFixed(2)),
      });
    }

    return data;
  }, [treatments]);

  const handleAddTreatment = (): void => {
    if (!formData.name) return;

    const newTreatment: TreatmentCost = {
      id: `treatment-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      basePrice: formData.basePrice,
      quantity: formData.quantity,
      totalPrice: formData.basePrice * formData.quantity,
      currency: formData.currency,
      frequency: formData.frequency,
      startDate: new Date(),
      discount: formData.discount,
    };

    const updated = [...treatments, newTreatment];
    setTreatments(updated);

    setFormData({
      name: '',
      type: 'skincare',
      basePrice: 100,
      quantity: 1,
      currency: 'USD',
      frequency: 'month',
      discount: 0,
    });
  };

  const handleCalculateROI = (): void => {
    if (treatments.length === 0) return;

    const effectivenessScores: Record<string, number> = {};
    for (const treatment of treatments) {
      effectivenessScores[treatment.id] = 65 + Math.random() * 30;
    }

    const calculatedROI = CostROICalculator.estimateROI(treatments, effectivenessScores, 1.8);
    const calculatedBreakdown = CostROICalculator.calculateTotalCost(treatments);

    setRoiData(calculatedROI);
    setBreakdown(calculatedBreakdown);

    if (onCostChange) {
      onCostChange(calculatedBreakdown);
    }
  };

  const handleReset = (): void => {
    setTreatments([]);
    setRoiData(null);
    setBreakdown(null);
    setFormData({
      name: '',
      type: 'skincare',
      basePrice: 100,
      quantity: 1,
      currency: 'USD',
      frequency: 'month',
      discount: 0,
    });
  };

  const getTypeColor = (type: TreatmentType): string => {
    const colorMap: Record<TreatmentType, string> = {
      skincare: 'bg-blue-50 border-blue-200',
      professional: 'bg-purple-50 border-purple-200',
      procedure: 'bg-red-50 border-red-200',
      supplement: 'bg-green-50 border-green-200',
      consultation: 'bg-yellow-50 border-yellow-200',
    };
    return colorMap[type];
  };

  const getTypeTextColor = (type: TreatmentType): string => {
    const colorMap: Record<TreatmentType, string> = {
      skincare: 'text-blue-700',
      professional: 'text-purple-700',
      procedure: 'text-red-700',
      supplement: 'text-green-700',
      consultation: 'text-yellow-700',
    };
    return colorMap[type];
  };

  const getRoiColor = (roi: number): string => {
    if (roi > 50) return 'text-green-600';
    if (roi > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  const getRoiBgColor = (roi: number): string => {
    if (roi > 50) return 'bg-green-50';
    if (roi > 0) return 'bg-blue-50';
    return 'bg-red-50';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">{t.title}</h1>

      {/* Input Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{t.addTreatment}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder={t.treatmentName}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            title={t.type}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as TreatmentType })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="skincare">{t.type}: Skincare</option>
            <option value="professional">Professional</option>
            <option value="procedure">Procedure</option>
            <option value="supplement">Supplement</option>
            <option value="consultation">Consultation</option>
          </select>
          <input
            type="number"
            placeholder={t.basePrice}
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: Number.parseFloat(e.target.value) || 0 })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="number"
            placeholder={t.quantity}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number.parseFloat(e.target.value) || 1 })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            title={t.currency}
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="THB">THB</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
          <input
            type="number"
            placeholder={t.discount}
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: Number.parseFloat(e.target.value) || 0 })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddTreatment}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t.addTreatment}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition"
          >
            {t.reset}
          </button>
        </div>
      </div>

      {/* Treatments List */}
      {treatments.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Treatments ({treatments.length})
          </h2>
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <div
                key={treatment.id}
                className={`p-4 rounded-lg border-2 ${getTypeColor(treatment.type)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-semibold ${getTypeTextColor(treatment.type)}`}>
                      {treatment.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {treatment.basePrice} {treatment.currency} × {treatment.quantity} = {treatment.totalPrice}
                      {treatment.discount ? ` (- ${treatment.discount}%)` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setTreatments(treatments.filter((t) => t.id !== treatment.id))}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calculate Button */}
      {treatments.length > 0 && (
        <button
          onClick={handleCalculateROI}
          className="w-full mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
        >
          {t.calculateROI}
        </button>
      )}

      {/* Results Section */}
      {breakdown && roiData && (
        <div className="space-y-6">
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600">{t.totalCost}</p>
              <p className="text-2xl font-bold text-slate-900">
                {breakdown.totalCost.toFixed(2)} {treatments[0]?.currency}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600">{t.monthlyAverage}</p>
              <p className="text-2xl font-bold text-slate-900">
                {breakdown.monthlyAverage.toFixed(2)} {treatments[0]?.currency}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600">{t.yearlyProjection}</p>
              <p className="text-2xl font-bold text-slate-900">
                {breakdown.yearlyProjection.toFixed(2)} {treatments[0]?.currency}
              </p>
            </div>
            <div className={`rounded-lg border-2 border-slate-200 p-4 ${getRoiBgColor(roiData.roi)}`}>
              <p className="text-sm text-slate-600">{t.roi}</p>
              <p className={`text-2xl font-bold ${getRoiColor(roiData.roi)}`}>
                {roiData.roi.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost Breakdown Pie Chart */}
            {costBreakdownData.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.byType}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Timeline Chart */}
            {timelineData.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.timeline}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#3b82f6"
                      dot={false}
                      name={t.totalCost}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ROI Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.roiAnalysis}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600">Payback Period</p>
                <p className="text-xl font-bold text-slate-900">
                  {roiData.paybackPeriodMonths.toFixed(1)} months
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Projected Benefit</p>
                <p className="text-xl font-bold text-green-600">
                  {roiData.projectedBenefit.toFixed(2)} {treatments[0]?.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Cost Trend</p>
                <p className={`text-xl font-bold ${roiData.costTrend === 'increasing' ? 'text-red-600' : 'text-green-600'}`}>
                  {roiData.costTrend}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {roiData.recommendations.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.recommendations}</h3>
              <ul className="space-y-2">
                {roiData.recommendations.map((rec) => (
                  <li key={rec} className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span className="text-slate-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {treatments.length === 0 && !breakdown && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-600">{t.noTreatments}</p>
        </div>
      )}
    </div>
  );
}

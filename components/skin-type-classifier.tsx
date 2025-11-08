'use client';

import React, { useState, useMemo } from 'react';
import {
  SkinTypeClassifier,
  type SkinCharacteristics,
  type ClassificationResult,
  type SkinType,
} from '@/lib/skin-type-classifier';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface SkinTypeClassifierProps {
  language?: 'th' | 'en';
  onClassificationChange?: (result: ClassificationResult) => void;
}

const translations = {
  en: {
    title: 'Skin Type Classification',
    characteristics: 'Skin Characteristics',
    analysis: 'Analysis Results',
    confidence: 'Classification Confidence',
    indicators: 'Skin Indicators',
    recommendations: 'Personalized Recommendations',
    tips: 'Skincare Tips',
    sebumLevel: 'Sebum Level',
    hydrationLevel: 'Hydration Level',
    sensitivityScore: 'Sensitivity',
    poreSize: 'Pore Size',
    textureRoughness: 'Texture Roughness',
    acneScore: 'Acne Score',
    rednessLevel: 'Redness Level',
    shininess: 'Shininess',
    classify: 'Classify Skin Type',
    skinType: 'Skin Type',
    drawerOpen: 'Open',
    normal: 'Normal',
    oily: 'Oily',
    dry: 'Dry',
    combination: 'Combination',
    sensitive: 'Sensitive',
    histogram: 'Characteristic Distribution',
    radarChart: 'Skin Profile Radar',
    lowConfidence: 'Low classification confidence',
    mediumConfidence: 'Medium classification confidence',
    highConfidence: 'High classification confidence',
    noResults: 'No classification results yet',
    scanSkin: 'Scan Your Skin',
  },
  th: {
    title: 'การจำแนกประเภทผิว',
    characteristics: 'ลักษณะเฉพาะของผิว',
    analysis: 'ผลการวิเคราะห์',
    confidence: 'ความมั่นใจในการจำแนก',
    indicators: 'ตัวบ่งชี้ของผิว',
    recommendations: 'คำแนะนำเฉพาะตัว',
    tips: 'เคล็ดลับการดูแลผิว',
    sebumLevel: 'ระดับสารสมบูรณ์',
    hydrationLevel: 'ระดับความชุ่มชื้น',
    sensitivityScore: 'ความไวแพ้',
    poreSize: 'ขนาดรูขุมขน',
    textureRoughness: 'ความหยาบของพื้นผิว',
    acneScore: 'คะแนนสิว',
    rednessLevel: 'ระดับความแดง',
    shininess: 'ความมันของผิว',
    classify: 'จำแนกประเภทผิว',
    skinType: 'ประเภทผิว',
    drawerOpen: 'เปิด',
    normal: 'ปกติ',
    oily: 'มันมาก',
    dry: 'แห้ง',
    combination: 'ผสม',
    sensitive: 'ไวแพ้',
    histogram: 'การกระจายตัวของลักษณะเฉพาะ',
    radarChart: 'แผนภูมิโปรไฟล์ผิว',
    lowConfidence: 'ความมั่นใจในการจำแนกต่ำ',
    mediumConfidence: 'ความมั่นใจในการจำแนกปานกลาง',
    highConfidence: 'ความมั่นใจในการจำแนกสูง',
    noResults: 'ยังไม่มีผลการจำแนกประเภท',
    scanSkin: 'สแกนผิวของคุณ',
  },
};

export const SkinTypeClassifierComponent: React.FC<SkinTypeClassifierProps> = ({
  language = 'en',
  onClassificationChange,
}) => {
  const t = translations[language] || translations.en;

  const [characteristics, setCharacteristics] = useState<SkinCharacteristics>({
    sebumLevel: 50,
    hydrationLevel: 50,
    sensitivityScore: 30,
    poreSize: 50,
    textureRoughness: 30,
    acneScore: 20,
    rednessLevel: 20,
    shininess: 40,
  });

  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);

  const handleCharacteristicChange = (key: keyof SkinCharacteristics, value: number) => {
    const updated = { ...characteristics, [key]: value };
    setCharacteristics(updated);
  };

  const handleClassify = () => {
    const result = SkinTypeClassifier.classify(characteristics);
    setClassificationResult(result);
    onClassificationChange?.(result);
  };

  const radarData = useMemo(() => {
    return [
      { metric: 'Sebum', value: characteristics.sebumLevel },
      { metric: 'Hydration', value: characteristics.hydrationLevel },
      { metric: 'Sensitivity', value: characteristics.sensitivityScore },
      { metric: 'Pore Size', value: characteristics.poreSize },
      { metric: 'Texture', value: characteristics.textureRoughness },
      { metric: 'Acne', value: characteristics.acneScore },
      { metric: 'Redness', value: characteristics.rednessLevel },
      { metric: 'Shine', value: characteristics.shininess },
    ];
  }, [characteristics]);

  const getCharacteristicWidthClass = (value: number): string => {
    if (value <= 10) return 'w-[10%]';
    if (value <= 20) return 'w-[20%]';
    if (value <= 30) return 'w-[30%]';
    if (value <= 40) return 'w-[40%]';
    if (value <= 50) return 'w-[50%]';
    if (value <= 60) return 'w-[60%]';
    if (value <= 70) return 'w-[70%]';
    if (value <= 80) return 'w-[80%]';
    if (value <= 90) return 'w-[90%]';
    return 'w-full';
  };

  const getSkinTypeColor = (skinType: SkinType): string => {
    const colors: Record<SkinType, string> = {
      normal: 'bg-green-50 border-green-200',
      oily: 'bg-yellow-50 border-yellow-200',
      dry: 'bg-amber-50 border-amber-200',
      combination: 'bg-purple-50 border-purple-200',
      sensitive: 'bg-red-50 border-red-200',
    };
    return colors[skinType];
  };

  const getSkinTypeBadgeColor = (skinType: SkinType): string => {
    const colors: Record<SkinType, string> = {
      normal: 'bg-green-100 text-green-800',
      oily: 'bg-yellow-100 text-yellow-800',
      dry: 'bg-amber-100 text-amber-800',
      combination: 'bg-purple-100 text-purple-800',
      sensitive: 'bg-red-100 text-red-800',
    };
    return colors[skinType];
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (confidence >= 60) return <Info className="w-5 h-5 text-blue-600" />;
    return <AlertCircle className="w-5 h-5 text-orange-600" />;
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 80) return t.highConfidence;
    if (confidence >= 60) return t.mediumConfidence;
    return t.lowConfidence;
  };

  return (
    <div className="w-full space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600">{t.scanSkin}</p>
      </div>

      {/* Characteristics Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">{t.characteristics}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(characteristics).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t[key as keyof typeof t] || key}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => handleCharacteristicChange(key as keyof SkinCharacteristics, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                title={`Adjust ${key}`}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">0</span>
                <span className="text-sm font-semibold text-blue-600">{value}</span>
                <span className="text-xs text-gray-500">100</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleClassify}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
        >
          {t.classify}
        </button>
      </div>

      {/* Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.radarChart}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.histogram}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={radarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Results Section */}
      {classificationResult ? (
        <div className={`rounded-lg shadow-md p-6 border-2 ${getSkinTypeColor(classificationResult.skinType)}`}>
          <div className="space-y-4">
            {/* Skin Type Result */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{t.analysis}</h3>
              <span className={`px-4 py-2 rounded-full font-bold text-lg ${getSkinTypeBadgeColor(classificationResult.skinType)}`}>
                {t[classificationResult.skinType as keyof typeof t]}
              </span>
            </div>

            {/* Confidence Score */}
            <div className="bg-white rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getConfidenceIcon(classificationResult.confidence)}
                <div>
                  <p className="text-sm font-semibold text-gray-600">{t.confidence}</p>
                  <p className="text-xs text-gray-500">
                    {getConfidenceLabel(classificationResult.confidence)}
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600">{classificationResult.confidence}%</div>
            </div>

            {/* Indicators */}
            {classificationResult.indicators.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">{t.indicators}</h4>
                <div className="flex flex-wrap gap-2">
                  {classificationResult.indicators.map((indicator) => (
                    <span
                      key={indicator}
                      className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200"
                    >
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {classificationResult.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">{t.recommendations}</h4>
                <ul className="space-y-2">
                  {classificationResult.recommendations.map((rec) => (
                    <li key={rec} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">{t.tips}</h4>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2">
                {SkinTypeClassifier.generateTips(
                  classificationResult.skinType,
                  classificationResult.characteristics
                ).map((tip) => (
                  <div key={tip} className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">{t.noResults}</p>
        </div>
      )}

      {/* Characteristic Details */}
      {classificationResult && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Detailed Characteristics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(classificationResult.characteristics).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase">{t[key as keyof typeof t] || key}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                  {/* Progress bar - width determined by percentage class matching */}
                  <div
                    className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${getCharacteristicWidthClass(value)}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinTypeClassifierComponent;

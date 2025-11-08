'use client';

import React, { useState } from 'react';
import {
  SeasonalSkincareEngine,
  SkinType,
  Climate,
  SeasonalEnvironment,
} from '@/lib/seasonal-skincare-engine';
import { Cloud, Droplets, Sun, Wind, AlertCircle, CheckCircle, Target } from 'lucide-react';

interface SeasonalRecommendationsProps {
  skinType: SkinType;
  environment?: SeasonalEnvironment;
  language?: 'th' | 'en';
}

const translations = {
  th: {
    title: 'คำแนะนำเกี่ยวกับการดูแลผิวตามฤดูกาล',
    currentSeason: 'ฤดูกาลปัจจุบัน',
    climate: 'สภาพอากาศ',
    temperature: 'อุณหภูมิ',
    humidity: 'ความชื้น',
    uvIndex: 'ดัชนี UV',
    airQuality: 'คุณภาพอากาศ',
    hydrationLevel: 'ระดับความชื้น',
    sunProtection: 'การป้องกันแสงแดด',
    morningRoutine: 'รูทีนตอนเช้า',
    eveningRoutine: 'รูทีนตอนเย็น',
    weeklyRoutine: 'รูทีนรายสัปดาห์',
    duration: 'ระยะเวลา',
    minutes: 'นาที',
    products: 'ผลิตภัณฑ์',
    tips: 'เคล็ดลับ',
    precautions: 'ข้อระวัง',
    recommendations: 'คำแนะนำ',
    priorityAreas: 'พื้นที่ลำดับความสำคัญ',
    monthlyFocus: 'ความสำคัญรายเดือน',
    useFrequency: 'ความถี่การใช้',
    benefits: 'ประโยชน์',
    ingredients: 'ส่วนประกอบ',
    effectiveness: 'ประสิทธิผล',
    routineComparison: 'เปรียบเทียบรูทีน',
    climateAdvice: 'คำแนะนำเกี่ยวกับสภาพอากาศ',
    daily: 'ทุกวัน',
    twiceDaily: 'สองครั้งต่อวัน',
    weekly: 'รายสัปดาห์',
    asNeeded: 'ตามต้องการ',
  },
  en: {
    title: 'Seasonal Skincare Recommendations',
    currentSeason: 'Current Season',
    climate: 'Climate',
    temperature: 'Temperature',
    humidity: 'Humidity',
    uvIndex: 'UV Index',
    airQuality: 'Air Quality',
    hydrationLevel: 'Hydration Level',
    sunProtection: 'Sun Protection (SPF)',
    morningRoutine: 'Morning Routine',
    eveningRoutine: 'Evening Routine',
    weeklyRoutine: 'Weekly Routine',
    duration: 'Duration',
    minutes: 'minutes',
    products: 'Products',
    tips: 'Tips',
    precautions: 'Precautions',
    recommendations: 'Recommendations',
    priorityAreas: 'Priority Areas',
    monthlyFocus: 'Monthly Focus',
    useFrequency: 'Use Frequency',
    benefits: 'Benefits',
    ingredients: 'Ingredients',
    effectiveness: 'Routine Effectiveness',
    routineComparison: 'Routine Comparison',
    climateAdvice: 'Climate-Specific Advice',
    daily: 'Daily',
    twiceDaily: 'Twice Daily',
    weekly: 'Weekly',
    asNeeded: 'As Needed',
  },
};

export const SeasonalRecommendationsComponent: React.FC<SeasonalRecommendationsProps> = ({
  skinType,
  environment,
  language = 'en',
}) => {
  const t = translations[language];
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Use provided environment or generate default
  const env: SeasonalEnvironment = environment ?? {
    season: SeasonalSkincareEngine.determineSeason(),
    climate: 'temperate',
    temperature: 20,
    humidity: 50,
    uvIndex: 5,
    airQuality: 50,
  };

  // Generate recommendations
  const recommendation = SeasonalSkincareEngine.generateSeasonalRecommendation(skinType, env);
  const comparisonData = SeasonalSkincareEngine.compareSeasonalRoutines(skinType, env.climate, env);
  const climateTips = SeasonalSkincareEngine.getClimateSpecificTips(env.climate, skinType);

  const getFrequencyLabel = (frequency: string): string => {
    const frequencyMap: Record<string, string> = {
      'daily': t.daily,
      'twice-daily': t.twiceDaily,
      '2-3-times': '2-3 times weekly',
      'weekly': t.weekly,
      'as-needed': t.asNeeded,
    };
    return frequencyMap[frequency] || frequency;
  };

  const getClimateColor = (climate: Climate): string => {
    const colors: Record<Climate, string> = {
      tropical: 'from-green-600 to-yellow-500',
      temperate: 'from-blue-600 to-green-500',
      arid: 'from-orange-600 to-red-500',
      cold: 'from-blue-600 to-cyan-400',
      humid: 'from-teal-600 to-blue-400',
    };
    return colors[climate];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">
          Personalized routine for {skinType} skin in {env.season} season
        </p>
      </div>

      {/* Environment Summary Card */}
      <div className={`bg-gradient-to-r ${getClimateColor(env.climate)} rounded-lg shadow-lg p-6 text-white`}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Cloud className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90">{t.climate}</p>
            <p className="font-bold text-lg capitalize">{env.climate}</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Sun className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90">{t.temperature}</p>
            <p className="font-bold text-lg">{env.temperature}°C</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Droplets className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90">{t.humidity}</p>
            <p className="font-bold text-lg">{env.humidity}%</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90">{t.uvIndex}</p>
            <p className="font-bold text-lg">{env.uvIndex}/11</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Wind className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90">{t.airQuality}</p>
            <p className="font-bold text-lg">AQI {env.airQuality}</p>
          </div>
        </div>
      </div>

      {/* Recommendations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{t.hydrationLevel}</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{recommendation.hydrationLevel}%</p>
          <p className="text-sm text-gray-600 mt-1">Recommended hydration boost</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">{t.sunProtection}</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">SPF {recommendation.sunProtection}</p>
          <p className="text-sm text-gray-600 mt-1">Minimum recommended</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">{t.effectiveness}</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{comparisonData.currentRoutine.effectiveness}%</p>
          <p className="text-sm text-gray-600 mt-1">Routine effectiveness</p>
        </div>
      </div>

      {/* Morning Routine */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sun className="w-6 h-6 text-orange-500" />
            {t.morningRoutine}
          </h2>
          <span className="text-sm font-semibold text-gray-600">
            {comparisonData.currentRoutine.estimatedDuration.morning} {t.minutes}
          </span>
        </div>

        <div className="space-y-3">
          {comparisonData.currentRoutine.morning.map((product, idx) => (
            <button
              key={product.id}
              onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
              className="w-full text-left bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {idx + 1}. {product.name}
                  </p>
                  <p className="text-sm text-gray-600 capitalize mt-1">{getFrequencyLabel(product.useFrequency)}</p>
                </div>
                <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  {product.type}
                </span>
              </div>

              {expandedProductId === product.id && (
                <div className="mt-4 pt-4 border-t border-orange-200 space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{t.benefits}:</p>
                    <ul className="list-disc list-inside text-gray-700 mt-1">
                      {product.benefits.map((benefit) => (
                        <li key={benefit}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.ingredients}:</p>
                    <p className="text-gray-700 mt-1">{product.ingredients.join(', ')}</p>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Evening Routine */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-500" />
            {t.eveningRoutine}
          </h2>
          <span className="text-sm font-semibold text-gray-600">
            {comparisonData.currentRoutine.estimatedDuration.evening} {t.minutes}
          </span>
        </div>

        <div className="space-y-3">
          {comparisonData.currentRoutine.evening.map((product, idx) => (
            <button
              key={product.id}
              onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
              className="w-full text-left bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:bg-indigo-100 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {idx + 1}. {product.name}
                  </p>
                  <p className="text-sm text-gray-600 capitalize mt-1">{getFrequencyLabel(product.useFrequency)}</p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                  {product.type}
                </span>
              </div>

              {expandedProductId === product.id && (
                <div className="mt-4 pt-4 border-t border-indigo-200 space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{t.benefits}:</p>
                    <ul className="list-disc list-inside text-gray-700 mt-1">
                      {product.benefits.map((benefit) => (
                        <li key={benefit}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.ingredients}:</p>
                    <p className="text-gray-700 mt-1">{product.ingredients.join(', ')}</p>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Routine */}
      {comparisonData.currentRoutine.weekly.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-500" />
            {t.weeklyRoutine}
          </h2>

          <div className="space-y-3">
            {comparisonData.currentRoutine.weekly.map((product, idx) => (
              <div key={product.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">
                  {idx + 1}. {product.name}
                </p>
                <p className="text-sm text-gray-600 capitalize mt-1 ">{getFrequencyLabel(product.useFrequency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">{t.tips}</h3>
        <ul className="space-y-2">
          {comparisonData.currentRoutine.tips.map((tip) => (
            <li key={tip} className="flex gap-2 text-blue-800">
              <span className="font-bold text-blue-600 flex-shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weather Alerts */}
      {comparisonData.currentRoutine.weatherAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Weather Alerts
          </h3>
          <ul className="space-y-2">
            {comparisonData.currentRoutine.weatherAlerts.map((alert) => (
              <li key={alert} className="flex gap-2 text-amber-800">
                <span className="font-bold text-amber-600 flex-shrink-0">!</span>
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Precautions */}
      {recommendation.precautions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-900 mb-3">{t.precautions}</h3>
          <ul className="space-y-2">
            {recommendation.precautions.map((precaution) => (
              <li key={precaution} className="flex gap-2 text-red-800">
                <span className="font-bold text-red-600 flex-shrink-0">⚠</span>
                <span>{precaution}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Climate-Specific Advice */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t.climateAdvice}</h3>
        <div className="space-y-2">
          {climateTips.map((tip) => (
            <div key={tip} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-400 font-bold text-lg">•</span>
              <p className="text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Areas */}
      {recommendation.priorityAreas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t.priorityAreas}</h3>
          <div className="flex flex-wrap gap-2">
            {recommendation.priorityAreas.map((area) => (
              <span key={area} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Focus */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-2">{t.monthlyFocus}</h3>
        <p className="text-purple-800 text-lg font-semibold">{recommendation.monthlyFocus}</p>
      </div>
    </div>
  );
};

// Icon component for Moon (not from lucide-react)
const Moon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 1 1 .12-11.86 1 1 0 1 0 1.07-1.63 10 10 0 1 0 .9 14.71 1 1 0 0 0-.04-1.06z" />
  </svg>
);

export default SeasonalRecommendationsComponent;

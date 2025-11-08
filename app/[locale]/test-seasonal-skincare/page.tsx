'use client';

import React, { useState } from 'react';
import { SeasonalSkincareEngine, SeasonalEnvironment, SkinType, Climate, Season } from '@/lib/seasonal-skincare-engine';
import { SeasonalRecommendationsComponent } from '@/components/seasonal-recommendations';
import { Cloud, RefreshCw } from 'lucide-react';

const translations = {
  th: {
    title: 'ทดสอบระบบคำแนะนำการดูแลผิวตามฤดูกาล',
    selectSkinType: 'เลือกประเภทผิว',
    selectSeason: 'เลือกฤดูกาล',
    selectClimate: 'เลือกสภาพอากาศ',
    customEnvironment: 'สภาพแวดล้อมที่กำหนดเอง',
    temperature: 'อุณหภูมิ (°C)',
    humidity: 'ความชื้น (%)',
    uvIndex: 'ดัชนี UV',
    airQuality: 'คุณภาพอากาศ (AQI)',
    loadScenario: 'โหลดสถานการณ์',
    tropicalSummer: 'ฤดูร้อนเขตร้อน',
    aridWinter: 'ฤดูหนาวแห้ง',
    coldWinter: 'ฤดูหนาวเย็น',
    humidAutumn: 'ฤดูใบไม้ร่วงชื้น',
    temperateSpring: 'ฤดูใบไม้ผลิปานกลาง',
    generate: 'สร้างคำแนะนำ',
    recommendations: 'คำแนะนำ',
    comparisonAcross: 'การเปรียบเทียบในฤดูกาลต่างๆ',
    currentSituation: 'สถานการณ์ปัจจุบัน',
    normal: 'ปกติ',
    oily: 'มันมาก',
    dry: 'แห้ง',
    combination: 'ผสม',
    sensitive: 'ไวต่อ',
    spring: 'ฤดูใบไม้ผลิ',
    summer: 'ฤดูร้อน',
    autumn: 'ฤดูใบไม้ร่วง',
    winter: 'ฤดูหนาว',
    tropical: 'เขตร้อน',
    temperate: 'ปานกลาง',
    arid: 'แห้ง',
    cold: 'เย็น',
    humid: 'ชื้น',
  },
  en: {
    title: 'Seasonal Skincare Recommendations Test',
    selectSkinType: 'Select Skin Type',
    selectSeason: 'Select Season',
    selectClimate: 'Select Climate',
    customEnvironment: 'Custom Environment',
    temperature: 'Temperature (°C)',
    humidity: 'Humidity (%)',
    uvIndex: 'UV Index',
    airQuality: 'Air Quality (AQI)',
    loadScenario: 'Load Scenario',
    tropicalSummer: 'Tropical Summer',
    aridWinter: 'Arid Winter',
    coldWinter: 'Cold Winter',
    humidAutumn: 'Humid Autumn',
    temperateSpring: 'Temperate Spring',
    generate: 'Generate Recommendations',
    recommendations: 'Recommendations',
    comparisonAcross: 'Comparison Across Seasons',
    currentSituation: 'Current Situation',
    normal: 'Normal',
    oily: 'Oily',
    dry: 'Dry',
    combination: 'Combination',
    sensitive: 'Sensitive',
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter',
    tropical: 'Tropical',
    temperate: 'Temperate',
    arid: 'Arid',
    cold: 'Cold',
    humid: 'Humid',
  },
};

export default function TestSeasonalSkincareRec() {
  const [language, setLanguage] = useState<'th' | 'en'>('en');
  const t = translations[language];

  const [skinType, setSkinType] = useState<SkinType>('normal');
  const [season, setSeason] = useState<Season>('spring');
  const [climate, setClimate] = useState<Climate>('temperate');

  const [environment, setEnvironment] = useState<SeasonalEnvironment>({
    season,
    climate,
    temperature: 20,
    humidity: 50,
    uvIndex: 5,
    airQuality: 50,
  });

  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const scenarioData: Record<string, SeasonalEnvironment> = {
    tropical: {
      season: 'summer',
      climate: 'tropical',
      temperature: 32,
      humidity: 85,
      uvIndex: 10,
      airQuality: 120,
    },
    arid: {
      season: 'winter',
      climate: 'arid',
      temperature: 28,
      humidity: 15,
      uvIndex: 7,
      airQuality: 200,
    },
    cold: {
      season: 'winter',
      climate: 'cold',
      temperature: -5,
      humidity: 35,
      uvIndex: 2,
      airQuality: 80,
    },
    humid: {
      season: 'autumn',
      climate: 'humid',
      temperature: 24,
      humidity: 78,
      uvIndex: 4,
      airQuality: 95,
    },
    temperate: {
      season: 'spring',
      climate: 'temperate',
      temperature: 18,
      humidity: 55,
      uvIndex: 6,
      airQuality: 60,
    },
  };

  const handleLoadScenario = (scenarioKey: string) => {
    const scenarioEnv = scenarioData[scenarioKey];
    setEnvironment(scenarioEnv);
    setSeason(scenarioEnv.season);
    setClimate(scenarioEnv.climate);
    setShowRecommendations(true);
  };

  const handleGenerateRecommendations = () => {
    setEnvironment({
      season,
      climate,
      temperature: environment.temperature,
      humidity: environment.humidity,
      uvIndex: environment.uvIndex,
      airQuality: environment.airQuality,
    });
    setShowRecommendations(true);
  };

  const skinTypeLabel = (type: SkinType): string => {
    const labels: Record<SkinType, string> = {
      normal: t.normal,
      oily: t.oily,
      dry: t.dry,
      combination: t.combination,
      sensitive: t.sensitive,
    };
    return labels[type];
  };

  const seasonLabel = (s: Season): string => {
    const labels: Record<Season, string> = {
      spring: t.spring,
      summer: t.summer,
      autumn: t.autumn,
      winter: t.winter,
    };
    return labels[s];
  };

  const climateLabel = (c: Climate): string => {
    const labels: Record<Climate, string> = {
      tropical: t.tropical,
      temperate: t.temperate,
      arid: t.arid,
      cold: t.cold,
      humid: t.humid,
    };
    return labels[c];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
          <button
            onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {language === 'en' ? 'ไทย' : 'English'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Skin Type Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.selectSkinType}</h2>
              <div className="space-y-2">
                {(['normal', 'oily', 'dry', 'combination', 'sensitive'] as SkinType[]).map((type) => (
                  <label key={type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="radio"
                      name="skinType"
                      value={type}
                      checked={skinType === type}
                      onChange={() => setSkinType(type)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-700">{skinTypeLabel(type)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Season Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.selectSeason}</h2>
              <div className="space-y-2">
                {(['spring', 'summer', 'autumn', 'winter'] as Season[]).map((s) => (
                  <label key={s} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="radio"
                      name="season"
                      value={s}
                      checked={season === s}
                      onChange={() => setSeason(s)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-700">{seasonLabel(s)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Climate Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.selectClimate}</h2>
              <div className="space-y-2">
                {(['tropical', 'temperate', 'arid', 'cold', 'humid'] as Climate[]).map((c) => (
                  <label key={c} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="radio"
                      name="climate"
                      value={c}
                      checked={climate === c}
                      onChange={() => setClimate(c)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-700">{climateLabel(c)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Environment */}
            <div className="bg-white rounded-lg shadow p-6 space-y-3">
              <h2 className="text-lg font-bold text-gray-900">{t.customEnvironment}</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.temperature}
                </label>
                <input
                  type="number"
                  min="-30"
                  max="50"
                  value={environment.temperature}
                  onChange={(e) => setEnvironment({ ...environment, temperature: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Temperature in Celsius"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.humidity}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={environment.humidity}
                  onChange={(e) => setEnvironment({ ...environment, humidity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Humidity percentage"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.uvIndex}
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={environment.uvIndex}
                  onChange={(e) => setEnvironment({ ...environment, uvIndex: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="UV Index (0-15)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.airQuality}
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={environment.airQuality}
                  onChange={(e) => setEnvironment({ ...environment, airQuality: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Air Quality Index (AQI)"
                />
              </div>
            </div>

            {/* Scenario Buttons */}
            <div className="bg-white rounded-lg shadow p-6 space-y-2">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.loadScenario}</h2>
              <button
                onClick={() => handleLoadScenario('tropical')}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium text-sm transition"
              >
                🌴 {t.tropicalSummer}
              </button>
              <button
                onClick={() => handleLoadScenario('arid')}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm transition"
              >
                🏜️ {t.aridWinter}
              </button>
              <button
                onClick={() => handleLoadScenario('cold')}
                className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-medium text-sm transition"
              >
                ❄️ {t.coldWinter}
              </button>
              <button
                onClick={() => handleLoadScenario('humid')}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium text-sm transition"
              >
                💧 {t.humidAutumn}
              </button>
              <button
                onClick={() => handleLoadScenario('temperate')}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm transition"
              >
                🌱 {t.temperateSpring}
              </button>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateRecommendations}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg transition"
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              {t.generate}
            </button>

            <button
              onClick={() => setShowComparison(!showComparison)}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-lg transition"
            >
              {t.comparisonAcross}
            </button>
          </div>

          {/* Right: Recommendations Display */}
          <div className="lg:col-span-2">
            {showRecommendations && (
              <div className="bg-white rounded-lg shadow p-6">
                <SeasonalRecommendationsComponent
                  skinType={skinType}
                  environment={environment}
                  language={language}
                />
              </div>
            )}

            {!showRecommendations && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">{t.currentSituation}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {skinType} skin • {seasonLabel(season)} • {climateLabel(climate)}
                </p>
                <p className="text-gray-400 text-sm mt-4">
                  {t.temperature}: {environment.temperature}°C • {t.humidity}: {environment.humidity}% •
                  {t.uvIndex}: {environment.uvIndex}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Comparison View */}
        {showComparison && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.comparisonAcross}</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['spring', 'summer', 'autumn', 'winter'] as Season[]).map((s) => {
                const routine = SeasonalSkincareEngine.generateSeasonalRoutine(skinType, s, climate, {
                  ...environment,
                  season: s,
                });
                return (
                  <div key={s} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 capitalize">{seasonLabel(s)}</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <p className="font-semibold text-gray-900">Products</p>
                        <p className="text-lg font-bold text-blue-600">
                          {routine.morning.length + routine.evening.length}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Morning</p>
                        <p className="text-lg font-bold text-orange-600">{routine.estimatedDuration.morning} min</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Evening</p>
                        <p className="text-lg font-bold text-indigo-600">{routine.estimatedDuration.evening} min</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Effectiveness</p>
                        <p className="text-lg font-bold text-green-600">{routine.effectiveness}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Concern Education Demo Page
 * Testing interactive markers and concern education system
 */

import React from 'react';
import { AnalysisWithConcerns } from '@/components/analysis/analysis-with-concerns';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

// Mock analysis data for demonstration
const mockAnalysis: HybridSkinAnalysis = {
  id: 'demo-analysis-001',
  userId: 'demo-user-001',
  createdAt: new Date(),
  imageUrl: '/demo/face-analysis.jpg',
  timestamp: new Date(),
  aiProvider: 'gemini',
  ai: {
    skinType: 'combination',
    concerns: ['dark_spots', 'large_pores', 'redness', 'texture', 'wrinkles', 'fine_lines', 'dullness'],
    severity: {
      dark_spots: 6.5,
      large_pores: 7.8,
      redness: 6.0,
      texture: 6.8,
      wrinkles: 5.2,
      fine_lines: 4.5,
      dullness: 5.5,
      acne: 0,
      blackheads: 0,
      hyperpigmentation: 0,
      spots: 0,
      pores: 0
    },
    recommendations: [
      {
        category: 'cleanser',
        product: 'Gentle Foaming Cleanser',
        reason: 'Removes impurities without stripping natural oils'
      },
      {
        category: 'serum',
        product: 'Vitamin C Brightening Serum',
        reason: 'Helps reduce dark spots and even skin tone'
      },
      {
        category: 'moisturizer',
        product: 'Hydrating Moisturizer',
        reason: 'Maintains skin barrier and prevents dryness'
      },
      {
        category: 'sunscreen',
        product: 'Broad Spectrum SPF 50',
        reason: 'Protects against UV damage that causes dark spots'
      }
    ],
    confidence: 0.88
  },
  cv: {
    spots: {
      count: 12,
      severity: 6.5,
      locations: [
        { x: 0.45, y: 0.35, radius: 8 },
        { x: 0.52, y: 0.38, radius: 6 },
        { x: 0.48, y: 0.42, radius: 10 },
        { x: 0.55, y: 0.36, radius: 7 },
        { x: 0.42, y: 0.40, radius: 9 },
      ],
    },
    wrinkles: {
      count: 8,
      severity: 5.2,
      locations: [
        { x1: 0.35, y1: 0.25, x2: 0.42, y2: 0.26 }, // Forehead
        { x1: 0.58, y1: 0.25, x2: 0.65, y2: 0.26 },
        { x1: 0.68, y1: 0.32, x2: 0.72, y2: 0.35 }, // Crow's feet
        { x1: 0.28, y1: 0.32, x2: 0.32, y2: 0.35 },
      ],
    },
    pores: {
      averageSize: 1.2,
      enlargedCount: 45,
      severity: 7.8,
    },
    redness: {
      percentage: 15.5,
      severity: 6.0,
      areas: [
        { x: 0.48, y: 0.45, width: 30, height: 25 }, // Cheeks
        { x: 0.52, y: 0.45, width: 28, height: 24 },
      ],
    },
    texture: {
      smoothness: 45,
      roughness: 6.8,
      score: 65,
    },
  },
  overallScore: {
    spots: 6.5,
    pores: 7.8,
    wrinkles: 5.2,
    texture: 6.8,
    redness: 6.0,
    pigmentation: 5.5,
  },
  percentiles: {
    spots: 65,
    pores: 72,
    wrinkles: 58,
    texture: 68,
    redness: 61,
    overall: 64,
  },
  confidence: 0.88,
  recommendations: [
    'Use sunscreen daily to prevent further dark spot formation',
    'Consider retinoid treatment for enlarged pores',
    'Apply vitamin C serum in the morning for brightening',
    'Use gentle exfoliation 2-3 times per week'
  ],
  annotatedImages: {
    spots: '/demo/annotated-spots.jpg',
    pores: '/demo/annotated-pores.jpg',
    wrinkles: '/demo/annotated-wrinkles.jpg',
    redness: '/demo/annotated-redness.jpg',
    combined: '/demo/annotated-combined.jpg',
  },
};

export default function ConcernEducationDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Concern Education Demo</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Interactive demonstration of the concern education system with markers and detailed explanations
        </p>
      </div>

      {/* Info Alert */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              How to Use
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Click on colored markers on the photo to view detailed concern information</li>
              <li>• Use zoom controls to examine specific areas closely</li>
              <li>• Toggle layers to show/hide different concern types</li>
              <li>• View comprehensive educational content including causes, prevention, and treatment</li>
              <li>• Check your skin health score and priority concerns</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Analysis Component */}
      <AnalysisWithConcerns
        analysis={mockAnalysis}
        imageUrl="/demo/face-analysis.jpg"
        language="en"
      />

      {/* Features List */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6 bg-white dark:bg-gray-800">
          <div className="text-3xl mb-3">📍</div>
          <h3 className="font-semibold text-lg mb-2">Interactive Markers</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Clickable markers show exact locations of detected concerns with confidence scores
          </p>
        </div>

        <div className="rounded-lg border p-6 bg-white dark:bg-gray-800">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-semibold text-lg mb-2">Comprehensive Education</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Detailed information about causes, prevention, treatment options, and daily routines
          </p>
        </div>

        <div className="rounded-lg border p-6 bg-white dark:bg-gray-800">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-semibold text-lg mb-2">Zoom & Pan</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Zoom up to 3x and pan around to examine specific areas in detail
          </p>
        </div>

        <div className="rounded-lg border p-6 bg-white dark:bg-gray-800">
          <div className="text-3xl mb-3">🎨</div>
          <h3 className="font-semibold text-lg mb-2">Layer Control</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Toggle individual concern types to focus on specific issues
          </p>
        </div>

        <div className="rounded-lg border p-6 bg-white dark:bg-gray-800">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="font-semibold text-lg mb-2">Priority Concerns</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatic identification of most severe concerns requiring immediate attention
          </p>
        </div>

        <div className="rounded-lg border p-6 bg-white dark:bg-gray-800">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-lg mb-2">Health Score</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Overall skin health score from 0-100 based on all detected concerns
          </p>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-12 rounded-lg border p-6 bg-gray-50 dark:bg-gray-900">
        <h3 className="font-semibold text-lg mb-4">Technical Implementation</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2 text-sm">Components</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• InteractivePhotoMarkers: Canvas-based marker system</li>
              <li>• ConcernDetailModal: Tabbed education content display</li>
              <li>• AnalysisWithConcerns: Integration component</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-sm">Data Sources</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• CV Analysis: TensorFlow.js models for detection</li>
              <li>• AI Analysis: Google Vision + Gemini + GPT-4o</li>
              <li>• Education: JSON files with comprehensive content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

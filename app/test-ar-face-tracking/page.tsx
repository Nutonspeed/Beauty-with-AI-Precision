'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ARFaceTrackingTestPage component with SSR disabled
const ARFaceTrackingTestPage = dynamic(
  () => import('./ARFaceTrackingTestPageContent'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-lg font-semibold mb-2">กำลังโหลดระบบติดตามใบหน้า...</div>
        <div className="animate-pulse">
          <div className="w-64 h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ) 
  }
);

export default function ARFaceTrackingPage() {
  return <ARFaceTrackingTestPage />;
}

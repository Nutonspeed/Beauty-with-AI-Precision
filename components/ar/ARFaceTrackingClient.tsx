'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ARFaceTrackingComponent with SSR disabled
const ARFaceTrackingComponent = dynamic(
  () => import('./ARFaceTrackingComponent'),
  { ssr: false }
);

export default function ARFaceTrackingClient() {
  return <ARFaceTrackingComponent />;
}

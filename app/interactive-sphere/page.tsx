import { LandingHero } from '@/components/LandingHero';
import { getServerAssignment } from '@/lib/ab-server';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Interactive 3D AI Sphere | Clinical Beauty Analysis',
  description: 'Experience our advanced 3D interactive AI visualization. Explore clinical-grade beauty analysis technology with real-time WebGL rendering and personalized insights.',
  keywords: 'AI beauty analysis, 3D visualization, WebGL, clinical aesthetics, skin analysis, interactive sphere, beauty technology',
  openGraph: {
    title: 'Interactive 3D AI Sphere | Clinical Beauty Analysis',
    description: 'Experience cutting-edge AI-powered beauty analysis with our interactive 3D sphere. Clinical precision meets stunning visualization.',
    type: 'website',
    images: [{
      url: `${siteUrl}/og-interactive-sphere.svg`,
      width: 1200,
      height: 630,
      alt: 'Interactive 3D AI Beauty Analysis Sphere'
    }],
    siteName: 'ClinicIQ Beauty AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive 3D AI Sphere | Clinical Beauty Analysis',
    description: 'Experience cutting-edge AI-powered beauty analysis with our interactive 3D sphere.',
    images: [`${siteUrl}/og-interactive-sphere.svg`],
    creator: '@ClinicIQ',
  },
  other: {
    'theme-color': '#6366f1',
  },
};

export default async function InteractiveSphere() {
  // Server-side A/B assignment
  const ctaVariant = (await getServerAssignment("cta", ["A", "B"])) as "A" | "B";
  
  return (
    <>
      <LandingHero ctaVariant={ctaVariant} />
    </>
  );
}

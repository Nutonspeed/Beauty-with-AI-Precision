import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const _locale = params.locale || 'en'
  
  return {
    title: 'AI Skin Analysis - 99% Cheaper Than Traditional Equipment | CenterIQ',
    description: 'Professional-grade skin analysis AI + AR simulator for beauty clinics. Mobile sales tool that closes deals 2.4x faster.',
    keywords: 'AI skin analysis, beauty tech, clinic sales tool, skin analyzer, AR simulator, mobile beauty tech, PDPA compliant, ISO certified',
    metadataBase: new URL('https://beauty-with-ai-precision.vercel.app'),
    alternates: {
      canonical: '/',
      languages: {
        'en': '/en',
        'th': '/th',
        'zh': '/zh'
      }
    },
    openGraph: {
      title: 'Stop Paying Millions for Equipment - CenterIQ AI',
      description: 'Professional skin analysis on mobile. Used by 500+ clinics.',
      type: 'website',
      images: [{
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CenterIQ AI Skin Analysis'
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI Skin Analysis - Mobile Sales Tool',
      description: 'Close beauty deals 2.4x faster',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      }
    }
  }
}

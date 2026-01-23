import Script from 'next/script'

interface StructuredDataProps {
  type?: 'Organization' | 'Product' | 'SoftwareApplication'
}

export function StructuredData({ type = 'Organization' }: StructuredDataProps) {
  console.log(`[StructuredData] Initializing for type: ${type}`)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CenterIQ AI",
    "url": "https://beauty-with-ai-precision.vercel.app",
    "logo": "https://beauty-with-ai-precision.vercel.app/logo.png",
    "description": "Professional AI skin analysis and beauty clinic management platform",
    "sameAs": [
      "https://facebook.com/centeriq",
      "https://twitter.com/centeriq",
      "https://linkedin.com/company/centeriq"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+66-2-XXX-XXXX",
      "contactType": "customer service",
      "availableLanguage": ["th", "en", "zh"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TH",
      "addressLocality": "Bangkok"
    }
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CenterIQ AI Skin Analyzer",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "6900",
      "priceCurrency": "THB",
      "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "523",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "AI Skin Analysis",
      "AR Treatment Simulator",
      "Client Management",
      "Appointment Booking",
      "Progress Tracking",
      "Multi-language Support"
    ]
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How accurate is CenterIQ AI skin analysis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CenterIQ AI provides 98% accuracy in skin analysis, using advanced deep learning models trained on millions of clinical images."
        }
      },
      {
        "@type": "Question",
        "name": "How much does CenterIQ cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CenterIQ starts at 6,900 THB per month, which is 99% cheaper than traditional equipment that costs 2-5 million THB."
        }
      },
      {
        "@type": "Question",
        "name": "Is CenterIQ PDPA compliant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CenterIQ is fully PDPA compliant and ISO 27001 certified, with 256-bit encryption for all data."
        }
      }
    ]
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://beauty-with-ai-precision.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Features",
        "item": "https://beauty-with-ai-precision.vercel.app/features"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Pricing",
        "item": "https://beauty-with-ai-precision.vercel.app/pricing"
      }
    ]
  }

  const schemas = [organizationSchema, productSchema, faqSchema, breadcrumbSchema]

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={index}
          id={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
          strategy="afterInteractive"
        />
      ))}
    </>
  )
}

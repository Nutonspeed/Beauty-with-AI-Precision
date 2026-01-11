/**
 * Structured Data (JSON-LD) for SEO
 * Helps search engines understand the content
 */

import Script from 'next/script'

interface OrganizationData {
  name: string
  url: string
  logo: string
  description: string
  contactPoint?: {
    telephone: string
    contactType: string
    areaServed?: string
    availableLanguage?: string[]
  }
}

interface MedicalBusinessData {
  name: string
  description: string
  url: string
  telephone: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  openingHours: string[]
  priceRange: string
}

interface SoftwareApplicationData {
  name: string
  description: string
  applicationCategory: string
  operatingSystem: string
  offers: {
    price: string
    priceCurrency: string
    availability?: string
  }
}

/**
 * Organization Schema
 */
export function OrganizationSchema({ data }: { data: OrganizationData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    contactPoint: data.contactPoint ? {
      '@type': 'ContactPoint',
      telephone: data.contactPoint.telephone,
      contactType: data.contactPoint.contactType,
    } : undefined,
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Aesthetic Business Schema (for centers)
 */
export function AestheticBusinessSchema({ data }: { data: MedicalBusinessData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': data.url,
    name: data.name,
    description: data.description,
    url: data.url,
    telephone: data.telephone,
    address: {
      '@type': 'PostalAddress',
      ...data.address,
    },
    openingHoursSpecification: data.openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1]?.split('-')[0],
      closes: hours.split(' ')[1]?.split('-')[1],
    })),
    priceRange: data.priceRange,
  }

  return (
    <Script
      id="medical-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Software Application Schema
 */
export function SoftwareApplicationSchema({ data }: { data: SoftwareApplicationData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.name,
    description: data.description,
    applicationCategory: data.applicationCategory,
    operatingSystem: data.operatingSystem,
    offers: {
      '@type': 'Offer',
      price: data.offers.price,
      priceCurrency: data.offers.priceCurrency,
    },
  }

  return (
    <Script
      id="software-application-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Breadcrumb Schema
 */
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * FAQ Schema
 */
export function FAQSchema({ questions }: { questions: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Default AestheticOS Schema
 */
export function AestheticOSSchema() {
  return (
    <>
      <OrganizationSchema
        data={{
          name: 'AestheticOS',
          url: 'https://aestheticos.ai',
          logo: 'https://aestheticos.ai/logo.png',
          description: 'AI-powered aesthetic center platform with skin analysis, AR visualization, and center management.',
          contactPoint: {
            telephone: '+66-2-XXX-XXXX',
            contactType: 'customer service',
            areaServed: 'TH',
            availableLanguage: ['Thai', 'English']
          }
        }}
      />
      <SoftwareApplicationSchema
        data={{
          name: 'AestheticOS',
          description: 'Intelligent Aesthetic Platform - AI skin analysis, AR program preview, center management',
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Web',
          offers: {
            price: '0',
            priceCurrency: 'THB',
            availability: 'https://schema.org/InStock'
          }
        }}
      />
    </>
  );
}

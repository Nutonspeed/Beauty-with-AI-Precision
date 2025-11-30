import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cliniciq.ai'

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/contact',
    '/case-studies',
    '/privacy',
    '/terms',
    '/pdpa',
    '/analysis',
    '/booking',
  ]

  // Generate sitemap entries for each locale
  const locales = ['th', 'en']
  
  const pages: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const page of staticPages) {
      pages.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: currentDate,
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : page === '/features' || page === '/pricing' ? 0.9 : 0.7,
      })
    }
  }

  // Add root redirect
  pages.push({
    url: BASE_URL,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1,
  })

  return pages
}

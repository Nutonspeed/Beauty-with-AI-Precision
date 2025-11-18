/**
 * Site technology & pattern analyzer
 * Usage: pnpm analyze:site OR pnpm tsx scripts/analyze-site.ts <url>
 * Focuses on public, non-copyrighted structural / technical signals.
 * Does NOT copy proprietary content or styling assets.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// Lazy load cheerio only if installed
async function loadCheerio() {
  try {
    const cheerio = await import('cheerio')
    return cheerio as unknown as typeof import('cheerio')
  } catch {
    console.error('Cheerio not installed. Install with: pnpm add cheerio')
    process.exit(1)
  }
}

interface AnalysisResult {
  url: string
  timestamp: string
  status: number
  byteLength: number
  meta: Record<string, string>
  openGraph: Record<string, string>
  twitter: Record<string, string>
  hasStructuredData: boolean
  frameworks: string[]
  scripts: string[]
  styleSheets: string[]
  fontProviders: string[]
  cssFrameworksLikely: string[]
  animationLibs: string[]
  uiPatterns: string[]
  performanceHints: string[]
  accessibilityHints: string[]
  counts: Record<string, number>
}

function detectFrameworks(scripts: string[]): string[] {
  const found: string[] = []
  const patterns: [RegExp, string][] = [
    /next\./i, 'Next.js',
    /react/i, 'React',
    /vue/i, 'Vue',
    /angular/i, 'Angular',
    /svelte/i, 'Svelte',
    /gatsby/i, 'Gatsby',
    /wp-content/i, 'WordPress'
  ].reduce<(RegExp|string)[]>((acc, v) => acc.concat(v), []).reduce<[RegExp,string][]>((pairs, _, i, arr) => {
    if (i % 2 === 0) pairs.push(arr.slice(i, i+2) as [RegExp,string])
    return pairs
  }, [])
  for (const [re, name] of patterns) {
    if (scripts.some(s => re.test(s))) found.push(name)
  }
  return [...new Set(found)]
}

function detectCssFrameworks(classes: string): string[] {
  const hits: string[] = []
  if (/\bcontainer\b.*\bmx-auto\b/.test(classes) || /\bflex\b.*\bitems-center\b/.test(classes)) hits.push('Utility-first (Tailwind-like)')
  if (/\brow\b.*\bcol-\d/.test(classes)) hits.push('Bootstrap-like grid')
  return [...new Set(hits)]
}

function detectAnimationLibs(html: string, scripts: string[]): string[] {
  const libs: string[] = []
  if (/framer-motion/.test(html) || scripts.some(s => /framer/.test(s))) libs.push('Framer Motion')
  if (/gsap/.test(html) || scripts.some(s => /gsap/.test(s))) libs.push('GSAP')
  if (/data-aos/.test(html)) libs.push('AOS')
  return libs
}

function detectUIPatterns($: any): string[] {
  const patterns: string[] = []
  if ($('nav').length > 0) patterns.push('Navigation bar')
  if ($('section').length > 5) patterns.push('Multi-section landing')
  if ($('form').length > 0) patterns.push('Forms present')
  if ($('video, canvas, model-viewer').length > 0) patterns.push('Rich media / 3D / video')
  if ($('[class*="grid"]').length > 0) patterns.push('Grid layouts')
  return patterns
}

function detectPerformanceHints($: any): string[] {
  const hints: string[] = []
  if ($('link[rel="preload"]').length) hints.push('Preload resources')
  if ($('link[rel="prefetch"]').length) hints.push('Prefetch resources')
  if ($('img[loading="lazy"]').length) hints.push('Lazy-loaded images')
  return hints
}

function detectFontProviders(links: string[]): string[] {
  const providers: string[] = []
  if (links.some(l => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(l))) providers.push('Google Fonts')
  if (links.some(l => /use\.typekit\.net/.test(l))) providers.push('Adobe Fonts (Typekit)')
  return providers
}

function detectAccessibility($: any): string[] {
  const hints: string[] = []
  if ($('img[alt]').length > 0) hints.push('Images with alt text')
  if ($('[role]').length > 0) hints.push('ARIA roles present')
  if ($('button').filter((_: any, el: any) => el.children.length === 0 && $(el).text().trim().length === 0).length === 0) hints.push('Buttons have labels')
  return hints
}

async function analyze(url: string): Promise<AnalysisResult> {
  const res = await fetch(url, { headers: { 'User-Agent': 'TechAnalyzer/1.0' } })
  const html = await res.text()
  const cheerio = await loadCheerio()
  const $ = cheerio.load(html)

  // Collect meta tags
  const meta: Record<string,string> = {}
  $('head meta').each((_, el) => {
    const name = $(el).attr('name') || $(el).attr('property')
    const content = $(el).attr('content')
    if (name && content) meta[name] = content
  })

  const openGraph: Record<string,string> = Object.fromEntries(Object.entries(meta).filter(([k]) => k.startsWith('og:')))
  const twitter: Record<string,string> = Object.fromEntries(Object.entries(meta).filter(([k]) => k.startsWith('twitter:')))
  const hasStructuredData = $('script[type="application/ld+json"]').length > 0

  const scripts: string[] = []
  $('script[src]').each((_, el) => { const src = $(el).attr('src'); if (src) scripts.push(src) })
  const inlineScriptHints = $('script:not([src])').toArray().slice(0,5).map(el => $(el).html()?.slice(0,120) || '')
  scripts.push(...inlineScriptHints.filter(Boolean))

  const styleSheets: string[] = []
  $('link[rel="stylesheet"]').each((_, el) => { const href = $(el).attr('href'); if (href) styleSheets.push(href) })

  const classesConcat = $('[class]').toArray().map(el => $(el).attr('class') || '').join(' ')

  const result: AnalysisResult = {
    url,
    timestamp: new Date().toISOString(),
    status: res.status,
    byteLength: html.length,
    meta,
    openGraph,
    twitter,
    hasStructuredData,
    frameworks: detectFrameworks(scripts),
    scripts: scripts.slice(0,50),
    styleSheets,
    fontProviders: detectFontProviders(styleSheets),
    cssFrameworksLikely: detectCssFrameworks(classesConcat),
    animationLibs: detectAnimationLibs(html, scripts),
    uiPatterns: detectUIPatterns($),
    performanceHints: detectPerformanceHints($),
    accessibilityHints: detectAccessibility($),
    counts: {
      sections: $('section').length,
      images: $('img').length,
      videos: $('video').length,
      canvases: $('canvas').length,
      forms: $('form').length,
      links: $('a').length,
      scripts: $('script').length
    }
  }

  return result
}

async function main() {
  const url = process.argv[2] || 'https://founderssa.com/'
  const data = await analyze(url)
  const outDir = path.join(process.cwd(), 'analysis-output')
  fs.mkdirSync(outDir, { recursive: true })
  const file = path.join(outDir, `analysis-${Date.now()}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  console.log('Analysis written to', file)
  console.log('\nSummary:')
  console.table({
    status: data.status,
    bytes: data.byteLength,
    sections: data.counts.sections,
    images: data.counts.images,
    frameworks: data.frameworks.join(', ') || 'Unknown',
    cssFrameworksLikely: data.cssFrameworksLikely.join(', ') || 'Unknown'
  })
  console.log('\nSuggested Integrations:')
  console.log('- Add/verify Open Graph + Twitter meta in your Next.js pages (already started).')
  console.log('- Consider structured data (JSON-LD) for organization + services.')
  console.log('- Optimize hero with lazy-loaded images + potential preload of critical font.')
  console.log('- Use utility-first classes consistently (Tailwind already present).')
  console.log('- Check if animation library needed (Framer Motion present in project).')
  console.log('- Ensure accessibility: alt text, ARIA roles, focus states.')
}

main().catch(err => {
  console.error('Failed analysis', err)
  process.exit(1)
})

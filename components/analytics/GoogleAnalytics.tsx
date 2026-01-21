'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Replace with your GA4 Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return
    if (!pathname || typeof window === 'undefined') return

    window.dataLayer = window.dataLayer || []
    if (typeof window.gtag !== 'function') {
      window.gtag = (...args: any[]) => window.dataLayer.push(args)
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    // Track page views
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.warn('Google Analytics ID not configured')
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  )
}

// Analytics event tracking functions
export const GAEvent = {
  // User engagement events
  clickCTA: (buttonName: string, location: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click_cta', {
        button_name: buttonName,
        location: location,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Video interactions
  watchVideo: (videoId: string, duration: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'watch_video', {
        video_id: videoId,
        duration: duration
      })
    }
  },

  // Form submissions
  submitForm: (formName: string, formType: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'submit_form', {
        form_name: formName,
        form_type: formType
      })
    }
  },

  // Conversion events
  startTrial: (plan: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'start_trial', {
        plan: plan,
        value: 0,
        currency: 'THB'
      })
    }
  },

  purchase: (value: number, currency: string = 'THB', items: any[] = []) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        value: value,
        currency: currency,
        items: items
      })
    }
  },

  // Page engagement
  scrollDepth: (percentage: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'scroll', {
        percent_scrolled: percentage
      })
    }
  },

  // Feature usage
  useFeature: (featureName: string, details?: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'use_feature', {
        feature_name: featureName,
        ...details
      })
    }
  }
}

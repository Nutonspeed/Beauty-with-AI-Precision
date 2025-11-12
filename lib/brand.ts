export type BrandTagline = {
  en: string
  th: string
}

export type BrandConfig = {
  name: string
  shortName?: string
  tagline: BrandTagline
  url?: string
  colors?: {
    primary: string
    primaryDark?: string
  }
  social?: {
    twitter?: string
    facebook?: string
    instagram?: string
  }
}

export const BRAND: BrandConfig = {
  name: "ClinicIQ",
  shortName: "ClinicIQ",
  tagline: {
    en: "Intelligent Aesthetic Platform",
    th: "แพลตฟอร์มความงามเชิงอัจฉริยะ",
  },
  url: "https://cliniciq.example",
  colors: {
    // Teal-Cyan blend that pairs well with medical blue theme
    primary: "#06b6d4",
    primaryDark: "#0891b2",
  },
  social: {
    twitter: "cliniciq",
  },
}

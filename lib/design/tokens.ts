// Centralized design tokens for Beauty-with-AI-Precision
// Focus: clean clinical beauty + soft AI futurism

export const colors = {
  // Base surfaces
  background: '#FCFCFC',
  backgroundAlt: '#FEF3F4',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F7F8',
  // Text
  textPrimary: '#343A40',
  textSecondary: '#6A6F73',
  textFaint: '#9EA2A6',
  // Accents (beauty palette)
  accentPink: '#FF6B9D', // vibrant interaction pink
  accentPetal: '#F9D4E6', // soft petal background accent
  accentPurple: '#C084FC',
  accentOrchid: '#C89BF8',
  accentYellow: '#FBBF24',
  accentMint: '#B8F5D9',
  accentGreen: '#34D399',
  accentNeutral: '#EEDFD5',
  // Status
  success: '#2EB67D',
  warning: '#F4B740',
  error: '#E5484D',
  info: '#3B82F6',
  // Gradients
  gradientPink: 'linear-gradient(135deg,#FF6B9D 0%,#C084FC 50%,#F9D4E6 100%)',
  gradientMint: 'linear-gradient(135deg,#B8F5D9 0%,#C89BF8 100%)',
  gradientTreatment: 'radial-gradient(circle at 30% 30%, rgba(255,107,157,0.55), rgba(200,132,252,0.35), rgba(255,255,255,0))'
} as const

export const motion = {
  // Easing curves tuned for calm feel
  easeStandard: [0.4, 0, 0.2, 1],
  easeEmphasis: [0.3, 0.1, 0.2, 1],
  easeExit: [0.4, 0, 1, 1],
  durations: {
    xfast: 90,
    fast: 150,
    base: 240,
    slow: 360,
    xslow: 520
  }
} as const

export const typography = {
  fontFamilySans: 'Inter, ui-sans-serif, system-ui, -apple-system',
  fontFamilyDisplay: '"Playfair Display", "Inter", serif',
  scale: {
    h1: { size: 'clamp(3rem,8vw,6rem)', weight: 300, tracking: '-0.02em' },
    h2: { size: 'clamp(2.25rem,6vw,4.25rem)', weight: 300, tracking: '-0.015em' },
    h3: { size: 'clamp(1.75rem,4.5vw,3rem)', weight: 400 },
    bodyLg: { size: '1.25rem', weight: 400 },
    body: { size: '1rem', weight: 400 },
    label: { size: '0.7rem', weight: 500, upper: true }
  }
} as const

export const radii = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 28,
  pill: 999
} as const

export const shadows = {
  soft: '0 4px 16px -4px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.06)',
  float: '0 8px 28px -6px rgba(0,0,0,0.10), 0 4px 12px -4px rgba(0,0,0,0.08)',
  glowPink: '0 0 0 2px rgba(255,107,157,0.4), 0 0 36px -6px rgba(255,107,157,0.55)',
  subtleBorder: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)'
} as const

export const z = {
  below: -1,
  base: 1,
  raised: 10,
  overlay: 100,
  modal: 1000
} as const

export const theme = {
  colors,
  motion,
  typography,
  radii,
  shadows,
  z
} as const

export type Theme = typeof theme

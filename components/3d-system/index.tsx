// ==========================================
// 🎨 3D Design System - Main Export
// ==========================================

// Core utilities
export {
  ThreeCanvas,
  Lighting,
  PerformanceMonitor,
  Scene,
  designTokens,
  animationVariants
} from './core'

// Background effects
export {
  GradientMesh,
  ParticleField,
  FloatingShapes,
  WaveField,
  StarField
} from './backgrounds'

// Interactive effects
export {
  MouseFollow,
  MagneticButton,
  Parallax3D,
  MorphingText,
  RevealOnScroll,
  Floating,
  Glow,
  StaggerContainer,
  StaggerItem,
  CursorSpotlight
} from './effects'

// Ready-to-use templates
export {
  StripeHero,
  AppleHero,
  LinearHero,
  VercelHero,
  CustomHero
} from './templates'

// 3D Models
export {
  ProductViewer,
  FaceModel,
  GeometricShapes
} from './models'

// Re-export types
export type { } from './core'

// ==========================================
// Quick Usage Examples
// ==========================================
/*

// Example 1: โหลดมาใช้ทันที (Stripe-style)
import { StripeHero } from '@/components/3d-system'

export default function Page() {
  return (
    <StripeHero
      title="Unified Beauty Platform"
      subtitle="AI-powered skin analysis"
      theme="stripe"
    />
  )
}

// Example 2: เลือก Template อื่น
import { AppleHero, LinearHero, VercelHero } from '@/components/3d-system'

// Example 3: Custom Background
import { CustomHero, GradientMesh } from '@/components/3d-system'

export default function Page() {
  return (
    <CustomHero background="particles">
      <YourContent />
    </CustomHero>
  )
}

// Example 4: สร้างเอง (Full Control)
import { ThreeCanvas, Lighting, ParticleField } from '@/components/3d-system'

export default function Page() {
  return (
    <ThreeCanvas className="h-screen">
      <Lighting preset="studio" />
      <YourCustom3DContent />
    </ThreeCanvas>
  )
}

// Example 5: ใช้ Design Tokens
import { designTokens } from '@/components/3d-system'

const colors = designTokens.colors.stripe
const typography = designTokens.typography.display

*/

"use client"

/**
 * FeatureGate Component (ใช้งานกับโครงสร้าง DB จริง)
 * ควบคุมการแสดง feature ตาม role และ tier
 */

import { useAuth } from "@/lib/auth/context"
import { AnalysisTier, hasFeatureAccess } from "@/types/supabase"
import { Lock, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { useRouter } from "next/navigation"

interface FeatureGateProps {
  children: React.ReactNode
  /**
   * Feature name to check (e.g., 'advanced_analysis', 'export', 'api_access')
   */
  feature: string
  /**
   * Fallback component when no access
   */
  fallback?: React.ReactNode
  /**
   * Show upgrade prompt instead of hiding
   */
  showUpgradePrompt?: boolean
  /**
   * Custom upgrade component
   */
  upgradePromptComponent?: React.ReactNode
  /**
   * Silent mode - just hide, no messages
   */
  silent?: boolean
  /**
   * Inverse - show when user DOESN'T have access
   */
  inverse?: boolean
}

/**
 * FeatureGate
 * 
 * @example
 * <FeatureGate feature="advanced_analysis">
 *   <AdvancedButton />
 * </FeatureGate>
 * 
 * @example
 * <FeatureGate feature="export" showUpgradePrompt>
 *   <ExportButton />
 * </FeatureGate>
 * 
 * @example - Show only to free users
 * <FeatureGate feature="advanced_analysis" inverse>
 *   <UpgradeBanner />
 * </FeatureGate>
 */
export function FeatureGate({
  children,
  feature,
  fallback,
  showUpgradePrompt = false,
  upgradePromptComponent,
  silent = false,
  inverse = false,
}: FeatureGateProps) {
  const { user } = useAuth()

  // No user - hide by default
  if (!user) {
    return inverse ? <>{children}</> : null
  }

  // Check access
  const hasAccess = hasFeatureAccess(user.role, feature)

  // Inverse logic
  if (inverse) {
    return hasAccess ? null : <>{children}</>
  }

  // Has access - show children
  if (hasAccess) {
    return <>{children}</>
  }

  // No access - show fallback/upgrade/silent
  if (silent) {
    return null
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showUpgradePrompt) {
    if (upgradePromptComponent) {
      return <>{upgradePromptComponent}</>
    }

    return <DefaultUpgradePrompt _tier={user.tier} feature={feature} />
  }

  return null
}

/**
 * Default Upgrade Prompt
 */
function DefaultUpgradePrompt({ _tier, feature }: { _tier: AnalysisTier; feature: string }) {
  const lp = useLocalizePath()
  const featureNames: Record<string, string> = {
    'basic_analysis': 'การวิเคราะห์พื้นฐาน',
    'advanced_analysis': 'การวิเคราะห์ขั้นสูง',
    'ai_recommendations': 'คำแนะนำจาก AI',
    'comparison': 'การเปรียบเทียบผล',
    'history': 'ประวัติการวิเคราะห์',
    'export': 'การส่งออกข้อมูล',
    'clinic_management': 'การจัดการคลินิก',
    'multi_user': 'ผู้ใช้หลายคน',
    'api_access': 'API Access',
  }

  const tierNames: Record<AnalysisTier, string> = {
    'free': 'Free',
    'premium': 'Premium',
    'clinical': 'Clinical',
  }

  const requiredTier = getRequiredTier(feature)

  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <Lock className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">
        ฟีเจอร์นี้ต้องใช้แพ็คเกจ {tierNames[requiredTier]}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-amber-800 dark:text-amber-200">
          <strong>{featureNames[feature] || feature}</strong> พร้อมใช้งานใน{" "}
          <span className="font-semibold">{tierNames[requiredTier]}</span>
        </p>
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
            <Link href={lp("/pricing")}>
              <Sparkles className="mr-2 h-4 w-4" />
              อัปเกรดเลย
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={lp("/features")}>ดูฟีเจอร์ทั้งหมด</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Helper: หา tier ที่ต้องการสำหรับ feature
 */
function getRequiredTier(feature: string): AnalysisTier {
  const featureMap: Record<string, AnalysisTier> = {
    'basic_analysis': 'free',
    'advanced_analysis': 'premium',
    'ai_recommendations': 'premium',
    'comparison': 'premium',
    'history': 'premium',
    'export': 'premium',
    'clinic_management': 'clinical',
    'multi_user': 'clinical',
    'api_access': 'clinical',
  }

  return featureMap[feature] || 'premium'
}

/**
 * FeatureButton Component
 * ปุ่มที่แสดง/ซ่อนตาม feature access
 */
interface FeatureButtonProps {
  feature: string
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "default" | "outline" | "ghost" | "link"
}

export function FeatureButton({
  feature,
  children,
  onClick,
  className,
  variant = "default",
}: FeatureButtonProps) {
  const router = useRouter()
  const lp = useLocalizePath()
  return (
    <FeatureGate
      feature={feature}
      fallback={
        <Button
          variant={variant}
          className={className}
          onClick={() => {
            router.push(lp("/pricing"))
          }}
        >
          <Lock className="mr-2 h-4 w-4" />
          {children}
        </Button>
      }
    >
      <Button variant={variant} className={className} onClick={onClick}>
        {children}
      </Button>
    </FeatureGate>
  )
}

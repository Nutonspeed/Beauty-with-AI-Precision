import { redirect } from 'next/navigation'

/**
 * Demo Skin Analysis - Redirects to main Analysis page
 * Analysis page works for both demo and logged-in users
 */
export default function DemoSkinAnalysisPage() {
  redirect('/th/analysis')
}

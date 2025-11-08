/**
 * AR Advanced Viewer - Redirect to unified AR Simulator
 * Legacy route maintained for backward compatibility
 */

import { redirect } from "next/navigation"

export default function ARAdvancedPage() {
  redirect("/ar-simulator?mode=advanced")
}

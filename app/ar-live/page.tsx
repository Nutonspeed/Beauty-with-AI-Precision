/**
 * AR Live Camera - Redirect to unified AR Simulator
 * Legacy route maintained for backward compatibility
 */

import { redirect } from "next/navigation"

export default function ARLivePage() {
  redirect("/ar-simulator?mode=live")
}

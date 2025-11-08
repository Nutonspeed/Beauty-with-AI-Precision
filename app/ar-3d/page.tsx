/**
 * AR 3D Viewer - Redirect to unified AR Simulator
 * Legacy route maintained for backward compatibility
 */

import { redirect } from "next/navigation"

export default function AR3DPage() {
  redirect("/ar-simulator?mode=3d")
}

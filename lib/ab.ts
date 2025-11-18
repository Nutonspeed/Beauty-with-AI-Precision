"use client";
import { analytics } from "@/lib/analytics";

const EXP_PREFIX = "exp:";

function getOverrideFromQuery(experiment: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const key = `ab-${experiment}`;
  const v = params.get(key) || params.get("ab");
  if (!v) return undefined;
  return v.toString();
}

export function getAssignment(
  experiment: string,
  variants: string[]
): string {
  if (typeof window === "undefined") return variants[0];
  // Prefer cookie (set server-side) for cross-route persistence
  try {
    const cookieName = `${EXP_PREFIX}${experiment}`;
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieName}=`));
    if (match) {
      const cookieVal = decodeURIComponent(match.split("=")[1]);
      if (variants.includes(cookieVal)) return cookieVal;
    }
  } catch {}
  const override = getOverrideFromQuery(experiment);
  if (override && variants.includes(override)) {
    try {
      localStorage.setItem(`${EXP_PREFIX}${experiment}`, override);
    } catch {}
    return override;
  }
  try {
    const stored = localStorage.getItem(`${EXP_PREFIX}${experiment}`);
    if (stored && variants.includes(stored)) return stored;
  } catch {}
  const assigned = variants[Math.floor(Math.random() * variants.length)];
  try {
    localStorage.setItem(`${EXP_PREFIX}${experiment}`, assigned);
  } catch {}
  return assigned;
}

export function trackExposureOnce(experiment: string, variant: string) {
  if (typeof window === "undefined") return;
  const key = `${EXP_PREFIX}${experiment}:exposed:${variant}`;
  try {
    if (localStorage.getItem(key)) return;
    if ("track" in analytics) (analytics as any).track("ab_exposure", { experiment, variant });
    localStorage.setItem(key, "1");
  } catch {
    if ("track" in analytics) (analytics as any).track("ab_exposure", { experiment, variant });
  }
}

export function trackClick(
  experiment: string,
  variant: string,
  button: "primary" | "secondary"
) {
  if ("track" in analytics) (analytics as any).track("cta_click", { experiment, variant, button });
}

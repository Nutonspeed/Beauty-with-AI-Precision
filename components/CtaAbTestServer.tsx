import { CtaAbTest } from "@/components/CtaAbTest";
import { getServerAssignment } from "@/lib/ab-server";

// Server component wrapper that assigns/persists cohort via cookie
export default function CtaAbTestServer(props: { onPrimary?: () => void; onSecondary?: () => void }) {
  const variant = getServerAssignment("cta", ["A", "B"]) as "A" | "B";
  return <CtaAbTest {...props} variant={variant} />;
}

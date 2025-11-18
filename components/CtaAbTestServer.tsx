import { CtaAbTest } from "@/components/CtaAbTest";
import { getServerAssignment } from "@/lib/ab-server";

// Server component wrapper that assigns/persists cohort via cookie
export default async function CtaAbTestServer(props: { onPrimary?: () => void; onSecondary?: () => void }) {
  const variant = (await getServerAssignment("cta", ["A", "B"])) as "A" | "B";
  return <CtaAbTest {...props} variant={variant} />;
}

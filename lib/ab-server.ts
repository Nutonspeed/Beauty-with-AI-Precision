import { cookies } from "next/headers";

const EXP_PREFIX = "exp:";

export function getServerAssignment(
  experiment: string,
  variants: string[]
): string {
  const cookieStore = cookies();
  const name = `${EXP_PREFIX}${experiment}`;
  const existing = cookieStore.get(name)?.value;
  if (existing && variants.includes(existing)) {
    return existing;
  }
  const assigned = variants[Math.floor(Math.random() * variants.length)];
  // Persist for ~90 days
  cookieStore.set(name, assigned, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90,
  });
  return assigned;
}

import { describe, it, expect, beforeEach } from "vitest";
import { getAssignment } from "@/lib/ab";

describe("ab getAssignment", () => {
  beforeEach(() => {
    // Reset cookies and localStorage between tests
    Object.defineProperty(document, "cookie", { value: "", writable: true });
    localStorage.clear();
  });

  it("prefers cookie value when present", () => {
    // Set cookie matching server-side behavior
    // Match server-side cookie name exactly (no URL encoding)
    document.cookie = "exp:cta=B";
    const v = getAssignment("cta", ["A", "B"]);
    expect(["A", "B"]).toContain(v);
    expect(v).toBe("B");
  });

  it("falls back to localStorage when no cookie", () => {
    localStorage.setItem("exp:cta", "A");
    const v = getAssignment("cta", ["A", "B"]);
    expect(v).toBe("A");
  });
});

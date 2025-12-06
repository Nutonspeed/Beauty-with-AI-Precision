import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { promises as fs } from "node:fs";
import path from "path";

// Import route handlers
import { POST, GET } from "@/app/api/analytics/collect/route";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "analytics-events.ndjson");

async function safeUnlink(p: string) {
  try { await fs.unlink(p); } catch {}
}

describe("analytics collect API", () => {
  beforeAll(async () => {
    // Clean previous test artifacts
    try { await fs.rm(DATA_DIR, { recursive: true, force: true }); } catch {}
  });

  afterAll(async () => {
    // Clean up to keep workspace tidy
    await safeUnlink(FILE_PATH);
  });

  it("accepts POST events and aggregates via GET", async () => {
    const now = Date.now();
    const body = {
      events: [
        { type: "ab_exposure", ts: now, payload: { experiment: "cta", variant: "A" } },
        { type: "cta_click", ts: now + 1, payload: { experiment: "cta", variant: "A", button: "primary" } },
      ]
    };

    const postReq = new Request("http://localhost/api/analytics/collect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }) as any;

    const postRes = await POST(postReq);
    const postJson = await postRes.json();
    expect(postJson.ok).toBe(true);
    expect(postJson.written).toBe(2);

    const getRes = await GET({} as any);
    const getJson = await getRes.json();
    expect(getJson.ok).toBe(true);
    const result = getJson.result;
    expect(result.exposures.A).toBeGreaterThanOrEqual(1);
    expect(result.clicks.A.primary).toBeGreaterThanOrEqual(1);
  });
});

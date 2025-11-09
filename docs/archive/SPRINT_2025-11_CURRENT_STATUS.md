# 🚀 Sprint 2025-11: Stabilize MVP & Go-to-Market
**Period:** November 9-22, 2025 (2 weeks)  
**Status:** IN PROGRESS  
**Last Updated:** November 9, 2025  
**Owner:** Engineering Team

---

## 📊 Executive Summary

**Objective:** Get MVP production-ready with realistic feature set, honest documentation, and stable dev environment.

| Component | Status | Progress | Blocker |
|-----------|--------|----------|---------|
| **Dev Server Stability** | 🔴 BLOCKED | 0% | `pnpm dev` crashes on startup |
| **Core CV Algorithms** | ✅ DONE | 100% | None |
| **Local-Only Analysis Mode** | 🟡 PARTIAL | 30% | Need feature flag UI |
| **Bug Fixes (#14-16)** | 🟡 PARTIAL | 20% | Analysis flow needs testing |
| **Documentation Update** | 🟡 IN-PROGRESS | 40% | This doc + archive old roadmap |
| **Staging Deploy** | 🔴 BLOCKED | 0% | Depends on dev server fix |
| **E2E Tests** | 🟢 PARTIAL | 60% | Profile test passes, others pending |

---

## 🎯 Sprint Goals (DoD - Definition of Done)

### Goal 1: Dev Server Stability (CRITICAL)
- [ ] `pnpm dev` starts successfully at `localhost:3000`
- [ ] Fallback to `npm run dev` works
- [ ] No console errors on first load
- [ ] Page loads in < 5 seconds
- **Acceptance:** Both package managers work, no crashes

### Goal 2: Local-Only Analysis Mode
- [ ] Feature flag `ANALYSIS_MODE=local|hf|auto` working
- [ ] UI toggle visible on `/analysis` page
- [ ] Local CV algorithms execute without Hugging Face
- [ ] Results show in heatmap/PDF export
- **Acceptance:** Can analyze without API keys

### Goal 3: Fix Critical Analysis Bugs
- [ ] Bug #14: Recommendation confidence fixed
- [ ] Bug #15: Spot score calculation accurate
- [ ] Bug #16: Health score percentile proper
- [ ] Tests updated and passing
- **Acceptance:** Unit tests + E2E validation

### Goal 4: Update Documentation
- [ ] Mark old Phase 2 docs as archived
- [ ] Create CURRENT_BACKLOG.md (Now/Next/Later)
- [ ] Update PROJECT_STATUS.md with real stats
- [ ] This sprint doc complete + DoD checked
- **Acceptance:** Single source of truth for status

### Goal 5: Staging Deploy Readiness
- [ ] No critical TypeScript errors
- [ ] `npm run lint` passes
- [ ] `npx vitest run` passes (core tests only)
- [ ] Staging URL prepared
- **Acceptance:** Ready to push to Vercel

---

## 📋 Current Blocking Issues

### 🔴 P0: Dev Server Won't Start
**Issue:** `pnpm dev` fails with exit code 1  
**Last Attempt:** Ran 8+ times, all failed (terminal history shows consistent failures)  
**Symptoms:**
- No visible error messages in simple run
- Likely Next.js compilation or dependency issue
- May be Turbopack configuration or missing env vars

**Investigation Steps:**
1. [ ] Run `pnpm dev` with verbose logging: `DEBUG=* pnpm dev`
2. [ ] Check `.env` file for missing vars (Supabase URL, keys)
3. [ ] Clear build cache: `rm -rf .next node_modules; pnpm install; pnpm dev`
4. [ ] Try webpack: `npm run dev:webpack` (fallback mode)
5. [ ] Review recent changes in `next.config.mjs` or `package.json`

**Owner:** TBD  
**Est. Time:** 2-4 hours  
**Priority:** CRITICAL (blocks everything else)

---

### 🔴 P0: Hardc Hardcoded VISIA Metrics
**Issue:** Analysis always returns same scores:
- Hydration: 7
- Pores: 2
- Spots: 1.5

**File:** `lib/ai/hybrid-analyzer.ts` (lines 410, 414, 429)  
**Impact:** Users see identical results regardless of skin condition  
**Fix:**
```typescript
// BEFORE (line 410, 414, 429):
const poreScore = 2 // Placeholder - 0-10 range
const spotScore = 1.5 // Placeholder - 0-10 range
hydration: 7, // Placeholder - 0-10 range

// AFTER: Use real CV results
const poreScore = cvResults.pores.severity || 5
const spotScore = cvResults.spots.severity || 3
hydration: Math.round((cvResults.color.avgBrightness / 255) * 10) || 7
```

**Owner:** TBD  
**Est. Time:** 1 hour  
**Priority:** P1 (impacts user trust)

---

### 🟡 P1: Mock Face Detection Fallback
**Issue:** When MediaPipe fails, system returns fake data silently  
**File:** `lib/ai/face-detection.ts` (lines 141, 251-343)  
**Solution:**
- [ ] Log when fallback active
- [ ] Show warning banner to user: "⚠️ Limited accuracy - please ensure good lighting"
- [ ] Keep fallback but make it explicit

**Owner:** TBD  
**Est. Time:** 1-2 hours  
**Priority:** P1

---

### 🟡 P1: Feature Flag Not Implemented
**Issue:** `ANALYSIS_MODE` not wired to UI  
**Files:** 
- `app/[locale]/analysis/page.tsx` - needs mode selector
- `lib/ai/strategy.ts` - needs `useAnalysisMode()` hook

**Solution:**
```typescript
// Add to analysis page UI:
<div className="flex gap-2">
  <button onClick={() => setMode('local')}>Local Only</button>
  <button onClick={() => setMode('hf')}>AI Enhanced</button>
  <button onClick={() => setMode('auto')}>Auto (Recommended)</button>
</div>

// In analyzer:
const analyzer = getAnalyzerByMode(mode) // local|hf|auto
```

**Owner:** TBD  
**Est. Time:** 2-3 hours  
**Priority:** P1

---

## 🛠️ Technical Debt

| Issue | Files | Severity | Est. Time | Notes |
|-------|-------|----------|-----------|-------|
| Lint errors (100+) | `hybrid-skin-analyzer.ts`, `sales/dashboard/page.tsx` | Medium | 4 hours | Replace deprecated regex, fix nesting |
| Type errors | `app/sales/dashboard/page.tsx` | Medium | 2 hours | `displayCount` undefined, `ITEMS_PER_PAGE` missing |
| TODO comments | 30+ files | Low | 3-5 hours | Either implement or remove/document |
| Mock percentiles | `hybrid-skin-analyzer.ts` line 600 | Medium | 2 hours | Need real database query |

---

## 📈 Current Test Status

### Unit Tests (Vitest)
**Command:** `npx vitest run`  
**Status:** Unknown (needs to run)
**Key Test Files:**
- `__tests__/ai-pipeline.test.ts` - AI flow
- `__tests__/hybrid-analyzer.integration.test.ts` - Integration
- `__tests__/access-control.test.ts` - Auth
- 52 total test files

### E2E Tests (Playwright)
**Command:** `npx playwright test`  
**Status:** 1/12 Passing (profile test)
**Test:** `__tests__/e2e/profile.spec.ts`
- ✅ "should allow updating personal information" - PASS (11.9s)
- 🔴 Other profile tab tests pending

---

## 🎓 Knowledge Base: What Needs Fixing

### CV Algorithms (Real & Working ✅)
- Spot detection: Blob detection algorithm
- Wrinkle detection: Sobel edge detection
- Pore analysis: Circular pattern detection
- Texture, color, redness: Statistical analysis

**Status:** 100% working, using real results in analysis

### AI Providers (Partial 🟡)
- TensorFlow.js: Real, browser-only
- Hugging Face: Real API + mock fallback
- Google Vision: Real API + fallback

**Status:** Works when APIs available, falls back gracefully

### VISIA Metrics (Placeholder ❌)
- Hydration: Fixed value 7
- Pore score: Fixed value 2
- Spot score: Fixed value 1.5
- Percentiles: Calculated from mock normal distribution

**Status:** Need replacement with real CV results

### Phase 2 Features (Not Implemented ❌)
- Depth estimator: TODO (lines 35, 173)
- Lighting simulator: TODO (line 36)
- VISIA equivalent pipeline: TODO (lines 7, 25)
- Treatment recommendations: Partial (lines 73, 274)
- AR preview: Basic only (lines 116, 278)

**Status:** Planned but not coded

---

## 📝 Roadmap Alignment

### What's In Scope (This Sprint)
- ✅ Fix dev server (CRITICAL)
- ✅ Remove hardcoded VISIA values
- ✅ Implement local-only mode
- ✅ Fix bugs #14-16
- ✅ Update documentation
- ✅ Prepare staging deploy

### What's Out of Scope (Next Sprint)
- ❌ Phase 2 depth estimation
- ❌ Advanced lighting simulation
- ❌ Real percentile database
- ❌ Mobile app (React Native)
- ❌ Advanced AR features

---

## 📅 Weekly Breakdown

### Week 1 (Nov 9-15): Unblock & Stabilize
**Goal:** Get dev server running, fix critical bugs

- **Nov 9 (Fri):** Diagnose dev server issue
- **Nov 10-11 (Wknd):** Investigation
- **Nov 12 (Mon):** Implement dev server fix
- **Nov 13 (Tue):** Remove hardcoded VISIA values, add feature flag
- **Nov 14 (Wed):** Fix bugs #14-16, update tests
- **Nov 15 (Thu):** Lint fixes, type checking passes

**Exit Criteria:**
- ✅ `pnpm dev` works
- ✅ `npm run lint` passes
- ✅ `npx tsc --noEmit` passes
- ✅ Feature flag working

### Week 2 (Nov 16-22): Deploy Readiness
**Goal:** Prepare staging, write docs, run full test suite

- **Nov 16-17 (Wknd):** Document updates, archive old roadmap
- **Nov 18 (Mon):** Local-only analysis mode complete + tested
- **Nov 19 (Tue):** Run full Playwright suite, fix failures
- **Nov 20 (Wed):** Setup staging URL, smoke test
- **Nov 21 (Thu):** Demo prep, user documentation
- **Nov 22 (Fri):** Sprint retro, plan Week 3

**Exit Criteria:**
- ✅ All E2E tests passing
- ✅ Documentation up-to-date
- ✅ Staging URL live with demo data
- ✅ Ready for Week 2 (Monetization)

---

## 🔗 Related Documents

- **CURRENT_BACKLOG.md** - Now/Next/Later task board (create next)
- **PROJECT_STATUS.md** - Living status doc (update today)
- **docs/CODEBASE_AUDIT_REPORT.md** - Detailed audit findings
- **archive/ROADMAP_OLD.md** - Old phase-based roadmap (archive Phase 2)

---

## 📌 Daily Standup Checklist

Use this each day:

```
## Daily Standup - Nov [DATE]

### What I Accomplished Yesterday:
- [ ] Item 1
- [ ] Item 2

### What I'm Working On Today:
- [ ] Item 1
- [ ] Item 2

### Blockers:
- [ ] None OR
- [ ] ...

### Test Status:
- [ ] Dev server: OK / BROKEN
- [ ] Vitest: [N] passing
- [ ] Playwright: [N] passing
```

---

## ✅ Checklist Before Sprint Completion

- [ ] `pnpm dev` runs without errors
- [ ] `npm run lint` passes (or 0 critical errors)
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vitest run` passes (core tests)
- [ ] `npx playwright test` passes (E2E)
- [ ] Feature flag toggle working
- [ ] Documentation updated
- [ ] Staging URL deployed
- [ ] Demo data loaded
- [ ] All team members sign off

---

**Sprint Owner:** [TBD]  
**Review Date:** November 22, 2025  
**Approval:** [TBD]

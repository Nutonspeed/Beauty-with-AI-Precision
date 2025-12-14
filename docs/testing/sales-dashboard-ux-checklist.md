# Sales Dashboard UX Verification Checklist

The checklist below covers the three critical scenarios (loading, error, and no-data) for both the **Hot Leads** and **Sales Performance** (metrics) sections. Follow these steps on a local environment (`pnpm dev` on port 3004/3005) before deploying.

> ℹ️ Tips
>
> * Use **Chrome DevTools > Network tab** to simulate slow connections or abort requests.
> * Keep the browser console open to watch for unexpected errors or Redux logs.
> * After each scenario, reset the environment (reload page, clear mocked responses) before moving to the next.

---

## 1. Loading State

### Hot Leads
1. Open DevTools → **Network** → enable **Slow 3G** throttling.
2. Hard refresh `/sales/dashboard`.
3. **Expected:**
   * Hot lead cards render **skeleton placeholders**.
   * No error badges are visible.
   * Refresh button is disabled only while request is in flight.

### Sales Metrics
1. With throttling still active, observe the metrics area.
2. **Expected:**
   * Seven `StatCardSkeleton` placeholders render in grid layout.
   * Status text “อัปเดตอัตโนมัติทุก 5 นาที” hidden until data arrives.

> ✅ Pass when both sections replace skeletons with real data automatically once requests finish.

---

## 2. Error State

### Hot Leads
1. Temporarily force `/api/sales/hot-leads` to fail (pick one):
   * Toggle **Offline** in DevTools, or
   * Run `window.fetch = () => Promise.reject(new Error("boom"))` in console (remember to refresh afterwards), or
   * Add a short-term try/catch in the API route returning `500`.
2. Reload dashboard.
3. **Expected:**
   * Red alert card with icon (⚠️) and Thai error message.
   * “ลองโหลดใหม่” button becomes visible and calls refetch.
   * Auto-refresh badge shows latest failure message.

### Sales Metrics
1. Make `/api/sales/metrics` throw (similarly to above).
2. Reload.
3. **Expected:**
   * Metrics section displays red error card with retry button.
   * Manual “รีเฟรช” button should set spinner and attempt refetch.

> ✅ Pass when both sections recover after you re-enable the APIs and hit retry (data appears again, error badges disappear).

---

## 3. No Data State

### Hot Leads
1. Temporarily adjust API to return `{ "leads": [] }`.
2. Reload without throttling.
3. **Expected:**
   * When no filters active: `NoDataState` with message “ยังไม่มี Hot Leads”.
   * When a search/filter removes all items: `SearchNoResultsState` with the active query label and “ล้างตัวกรอง” action.

### Sales Metrics
1. Normal API response (no change).
2. Ensure all cards show zero values without errors.

> ✅ Pass when both variations above display the correct empty-state components.

---

## 4. Manual Refresh / Auto Refresh

1. Restore real API responses.
2. Click the **Refresh** buttons for Hot Leads and Metrics.
3. **Expected:**
   * Icons spin (“Refreshing…” text) while requests are pending.
   * `Fetched {formatTimeAgo}` timestamp updates.
   * No lingering error banners if the request succeeds.
4. Disable auto-refresh toggle and verify the yellow “Auto-refresh disabled” badge.

---

## 5. Regression Sweep (optional but recommended)

* Confirm priority badge popover, skeleton transitions, and infinite scroll sentinel still work.
* Validate WebSocket notifications still append to Hot Leads without breaking state.
* Quick actions (call/email/proposal) continue to fire original handlers.

---

### Recording Results

For each scenario jot down:
- ✅ / ❌ outcome
- Notes on UI behaviour or console errors
- Screenshots (especially for documentation / PM demo)

Store findings in `docs/testing/results/{date}-sales-dashboard.md` or your project QA tracker.

---

### Cleanup

1. Revert any temporary API changes.
2. Remove throttling, console overrides, or mock fetches (`delete window.fetch`).
3. Reload once more to confirm normal behaviour.

---

**Ready for deployment** when all checks above pass without unexpected regressions.

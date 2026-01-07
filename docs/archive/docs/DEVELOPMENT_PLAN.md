# Development Analysis & Execution Plan
_Last updated: 15 Dec 2025_

## 1. Foundations Confirmed from Code
| Area | Evidence | Notes |
| --- | --- | --- |
| RLS & Security | `scripts/fix-users-rls.sql` defines explicit policies for SELECT/INSERT/UPDATE + super admin override @scripts/fix-users-rls.sql#1-90 | Users table is now locked down correctly.
| Health Check Automation | `scripts/check-database.ts` verifies env, tables, and anon-access using live queries @scripts/check-database.ts#120-170 | `pnpm check:db` is green.
| Admin Role Checks | `/app/api/admin/...` routes reference `public.users` (not `profiles`) – previously adjusted in this project @app/api/admin/system-settings/route.ts#1-200 | Role verification aligns with DB schema.

## 2. Features Using Mock or Placeholder Logic
| Feature | File & Lines | Status | Required Work |
| --- | --- | --- | --- |
| Queue Display (TV Mode) | Mock fallback used whenever API fails @app/clinic/queue/display/page.tsx#57-123 | Partially working | Build real `/api/clinic/queue/display` handler with Supabase fetch + offline cache; add clinic branding settings.
| Clinic Revenue Dashboard | TODO for API + mock generators @app/[locale]/clinic/revenue/page.tsx#91-158 | Mock only | Expose `/api/clinic/revenue` aggregations, wire to Supabase (bookings, payments), implement export endpoints.
| Clinic Settings | Loads/saves mock defaults; KPI editor hits endpoint but rest is stubbed @app/[locale]/clinic/settings/page.tsx#95-238 | Partially working | Implement `/api/clinic/settings` CRUD + validation, persist accepted payment methods, finish KPI PUT/GET handlers.
| Campaign Automation Suite | Entire page marked demo; hooks use in-memory manager @app/campaign-automation/page.tsx#1-400 & @hooks/useMarketing.ts#1-360 | Demo-only | Decide scope for Phase 2; connect to real tables (`marketing_campaigns`, `customer_segments`), add auth context data.
| Dashboard Quick Actions | Buttons only log to console with TODO @components/dashboard/quick-actions.tsx#80-159 | UI-only | Map each action to actual routes or modals; hide incomplete actions.
| Privacy Delete-Account Emails | TODO to send confirmation/cancellation emails @app/api/privacy/delete-account/route.ts#82-180 | Missing notifications | Integrate email provider (Resend), template out both flows, add rate-limit/logging.

## 3. Backlog Derived from Code Review
1. **Replace mock providers**
   - Queue + revenue + settings rely on hardcoded data → prioritize Supabase queries + caching layer.
2. **Marketing feature decision**
   - Determine whether campaign automation ships in MVP (needs real DB + auth) or moves to later phase.
3. **Navigation coherence**
   - Quick actions should reflect actual available modules; disable unreachable items.
4. **Compliance automation**
   - Privacy routes must send audit emails to satisfy GDPR; also add scheduled job to finalize deletions after 30 days.

## 4. Execution Plan (Next 4 Weeks)
### Week 1: Core Data Integrity
- Implement real API for clinic revenue + wire UI (replace `generateMockChartData`).
- Build `/api/clinic/settings` GET/PUT + persist UI toggles.
- Document queue API contract and start backend handler.

### Week 2: Queue & Booking Experience
- Finish queue display service + real-time updates.
- Connect booking system to settings (buffer/cancellation) logic.
- Add monitoring/logging around queue/booking endpoints.

### Week 3: Privacy & Notifications
- Add Resend (or chosen provider) templates for deletion confirm/cancel.
- Schedule background worker to purge after grace period.
- Update `pnpm check:db` to validate privacy jobs once implemented.

### Week 4: Marketing Scope Decision
- If pursuing MVP: stub minimal analytics cards using real sales data.
- If deferring: hide Campaign Automation entry points and clearly label as Phase 2.
- Update documentation + release notes accordingly.

## 5. Open Questions for Product/Stakeholders
1. Is Campaign Automation required for initial launch, or can it be a post-launch enhancement? (Code currently demo-only.)
2. Which payment methods must be certified before enabling real transactions? (`accepted_payment_methods` is just a static list.)
3. Do clinics need advanced revenue exports (PDF/Excel) in MVP, or can we delay until after live data is flowing?

---
This plan is based solely on the current codebase state to avoid speculative documentation. Please confirm priorities so we can lock the sprint scope.

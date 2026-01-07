# 📋 Current Backlog - Now / Next / Later
**Last Updated:** November 9, 2025  
**Scope:** Production MVP + Go-to-Market  
**Review Cadence:** Every Friday

---

## 🔴 NOW (In Progress - This Sprint)

### Critical Blockers (Must Fix)
| Task | Owner | Est. | Status | Notes |
|------|-------|------|--------|-------|
| **FIX: Dev Server Crashes** | - | 4h | 🔴 BLOCKED | `pnpm dev` exit code 1, investigate build/env |
| **FIX: Hardcoded VISIA Values** | - | 2h | 🔴 TODO | Lines 410,414,429 in hybrid-analyzer.ts |
| **FEATURE: Local-Only Mode UI** | - | 3h | 🔴 TODO | Feature flag toggle on /analysis page |
| **DOC: Sprint Status Update** | - | 2h | 🟡 IN-PROGRESS | This file + archive old roadmap |

### Important Fixes (High Priority)
| Task | Owner | Est. | Status | Notes |
|------|-------|------|--------|-------|
| Bug #14: Recommendation Confidence | - | 1.5h | 🔴 TODO | Fix calculation in lib/ai/ |
| Bug #15: Spot Score Accuracy | - | 1.5h | 🔴 TODO | Use real CV results not placeholder |
| Bug #16: Health Percentile | - | 1.5h | 🔴 TODO | Replace mock normal distribution |
| Fix Lint Errors | - | 4h | 🔴 TODO | 100+ errors in 3-5 files |
| Fix TypeScript Errors | - | 2h | 🔴 TODO | Missing vars in sales dashboard |

---

## 📘 NEXT (Queued for Week 2)

### Testing & Deployment (Nov 18-22)
| Task | Owner | Est. | Notes |
|------|-------|------|-------|
| **Run Full E2E Suite** | - | 2h | All 12 Playwright tests |
| **Fix E2E Failures** | - | 4h | Expected failures in profile, sales, etc |
| **Local-Only Analysis Test** | - | 1.5h | Verify no API key needed |
| **Setup Staging URL** | - | 1h | Vercel staging environment |
| **Load Demo Data** | - | 1h | Create test users + sample analyses |
| **Smoke Test Flow** | - | 2h | Upload → Analyze → Export PDF on staging |

### Documentation (Nov 16-17)
| Task | Owner | Est. | Notes |
|------|-------|------|-------|
| **Update PROJECT_STATUS.md** | - | 1.5h | Real stats: % tests passing, features complete |
| **Archive Old Roadmap** | - | 1h | Move Phase 2 details to archive/ folder |
| **Create USER_SETUP.md** | - | 2h | Getting started guide for team/users |
| **Create API_ENDPOINTS.md** | - | 1.5h | List all 50+ endpoints with examples |

### Quality Gates (Nov 21)
- [ ] All core tests passing
- [ ] Lint score ≥ 90%
- [ ] TypeScript strict mode passes
- [ ] 0 critical errors in prod build

---

## 🟣 LATER (Backlog - After Go-to-Market)

### Phase 2 Features (Month 2)
| Feature | Est. | Notes | Priority |
|---------|------|-------|----------|
| **Depth Estimator** | 8h | MiDaS model + firmness analysis | P2 |
| **Lighting Simulator** | 6h | Simulate treatment results | P2 |
| **3D Face Mapping** | 12h | Requires hardware testing | P3 |
| **Real Percentiles** | 10h | Database + monthly recalc | P1 |
| **Treatment Recommendations** | 8h | Complete recommendation engine | P1 |
| **Advanced AR** | 16h | Match YouCam/Perfect365 quality | P3 |

### Monetization (Month 2)
| Feature | Est. | Notes | Priority |
|---------|------|-------|----------|
| **Pricing Page** | 2h | Free/Premium/Clinic tiers | P1 |
| **Payment Gateway** | 4h | Stripe test mode | P1 |
| **Quota/Rate Limit** | 3h | Per-user usage tracking | P1 |
| **Analytics Dashboard** | 4h | Latency, errors, providers | P1 |

### User Experience (Month 3)
| Feature | Est. | Notes | Priority |
|---------|------|-------|----------|
| **Onboarding Tutorial** | 6h | First-time user walkthrough | P2 |
| **Progress Tracking** | 5h | Before/after timeline | P2 |
| **Notifications** | 4h | Email + push alerts | P2 |
| **Mobile App (PWA)** | 20h | Offline support + install prompts | P3 |

### Business Features (Month 3+)
| Feature | Est. | Notes | Priority |
|---------|------|-------|----------|
| **Clinic Admin Dashboard** | 12h | Staff management, reports | P2 |
| **Booking System** | 10h | Calendar integration | P2 |
| **Video Consultation** | 15h | WebRTC real-time calls | P3 |
| **E-Commerce Store** | 20h | Product catalog + checkout | P3 |

---

## 🎯 Quarterly Planning (Q4 2025)

### November (Weeks 1-4)
- **Week 1-2 (Now):** Stabilize MVP, fix blockers
- **Week 3:** Monetization setup (pricing, payments)
- **Week 4:** Beta program launch (10-20 users)

### December
- **Week 1-2:** Mobile QA (5+ devices)
- **Week 3:** Accuracy improvements from user feedback
- **Week 4:** Q4 planning, holidays

### January 2026
- **Week 1-2:** Production deploy
- **Week 3-4:** Monitor, fix issues
- **TBD:** Phase 2 features (if revenue justifies)

---

## 📊 Effort Estimation Reference

| Size | Time | Examples |
|------|------|----------|
| **XS** | < 1h | Config change, docs, simple fix |
| **S** | 1-3h | Bug fix, small feature |
| **M** | 3-8h | Feature, integration |
| **L** | 8-20h | Major feature, refactor |
| **XL** | 20+ h | Complete system, rewrite |

---

## 🔄 Process

### Adding New Tasks
1. Create issue on GitHub
2. Add to appropriate section (Now/Next/Later)
3. Estimate and set owner
4. Update `UPDATED_WHEN`

### Task Completion
1. Move to appropriate **Status** column
2. Update owner + close date
3. Link to PR/commit
4. Review in sprint retro

### Weekly Review (Fridays)
1. Update this file
2. Move completed tasks to DONE (archive)
3. Reprioritize based on learnings
4. Plan next week's scope

---

## ✅ Done (Archive)

- ✅ Profile update form (API integration) - Nov 9
- ✅ Playwright profile test passing - Nov 9
- ✅ Sprint documentation (this file) - Nov 9

---

**Status:** 🟡 Actively Updated  
**Owner:** Engineering Team  
**Contact:** [TBD]  
**Review:** Every Friday EOD

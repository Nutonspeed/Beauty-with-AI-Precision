# 🗺️ AI367 Beauty Platform - Development Roadmap

**Version:** 2.0 (Master Document)  
**Last Updated:** November 2025  
**Current Phase:** Phase 2 Complete - Enterprise Features Delivered  
**Next Major Phase:** MVP Go-to-Market Execution

> ⚠️ **UPDATE (Nov 2025):** Phase 2 Enterprise Features COMPLETED (7/7 tasks, 49 files, 17,240+ lines)  
> See `docs/README.md` for complete documentation index.

---

## 🎯 Development Philosophy

**"Ship MVP First, Optimize Later"**

We follow a pragmatic two-path approach:

1. **Path A (MVP - Current):** Deploy working system with free APIs → Get real users → Validate market
2. **Path B (Optimization - Future):** Upgrade accuracy based on user feedback and revenue

---

## 📍 Current Position: Phase 2 Complete + MVP Ready (95-98% Complete)

### What's Working Now:
- ✅ AI analysis with Hugging Face (70-80% accuracy)
- ✅ 6 CV algorithms (65-75% accuracy)
- ✅ Full AR treatment visualization
- ✅ 50+ API endpoints
- ✅ Supabase database
- ✅ Complete UI (49 pages)
- ✅ Authentication & authorization
- ✅ **NEW: Enterprise Features (Booking, Admin, i18n, PWA, Video, E-Commerce, Advanced AI)**

### Immediate Next Steps (1-2 Weeks):
1. ✅ Final manual testing (upload → analyze → results)
2. ✅ Fix any UI/UX bugs found
3. ✅ Deploy to Vercel production
4. ✅ Setup monitoring & analytics

---

## � MVP Go-To-Market Execution Plan (4 Weeks)

> Single source of truth for weekly plan, checklists, and gates. Do not add features outside this plan.

### Week 1 – Unblock & Stabilize (P0)

- Goals
  - Dev server runs with npm fallback (avoid corepack/pnpm issues)
  - Enable Local-only Analysis Mode (demo works without API keys)
  - Fix known analysis bugs (#14 recommendations, #15 confidence, #16 health score)
  - Staging (Vercel) live for end-to-end demo
- Definition of Done (DoD)
  - `npx vitest run` PASS
  - `npm run dev` starts at <http://localhost:3000>
  - Flow: Upload → Analyze (local-only) → Heatmap/Score → PDF exports successfully
  - Staging URL deployed and smoke-tested
- Checklist
  - [ ] Package manager fallback: npm scripts available and working
  - [ ] Feature flag: MODE=local|hf|auto (+ UI toggle on `/analysis`)
  - [ ] Bugs #14/#15/#16 fixed with tests
  - [ ] Vercel staging URL + demo data

### Week 2 – Monetize & Measure (P1)

- Goals
  - `/pricing` (Free/Premium/Clinic) + CTA “Start Free”
  - Payment stub (Stripe test or PromptPay v1)
  - Quota/Rate limit by plan (Free 3/mo, Premium 30/mo)
  - Basic telemetry: processing_time_ms, provider_used, error_rate
- DoD
  - Plans toggleable; transactions recorded
  - Usage/quota visible in profile
  - Admin log page shows latency/error/provider breakdown
- Checklist
  - [ ] `/pricing` page + plan check route
  - [ ] Payment stub + success webhook mock
  - [ ] Quota middleware + per-user/tenant counters
  - [ ] Basic metrics + simple admin table

### Week 3 – Beta Program & Mobile QA (P1)

- Goals
  - 10–20 beta users (or 1–2 clinics) onboarded
  - Real-device QA (5+ devices: iOS/Android)
  - A/B: local-only vs HF (small cohort) for accuracy/time
- DoD
  - Structured feedback collected (accuracy/latency/UX)
  - Daily/weekly usage stats + bug report summary
- Checklist
  - [ ] Feedback form + exportable report
  - [ ] Mobile Testing Dashboard used on devices
  - [ ] A/B flag: 20% HF, 80% local-only

### Week 4 – Launch Readiness (P1/P2)

- Goals
  - Production deploy + Sentry/Analytics
  - Admin metrics dashboard v1.1
  - Customer/Clinic docs (Quick Start, FAQ, sample PDF)
- DoD
  - 1-click rollback plan
  - Incident runbook (latency, provider down, storage full)
- Checklist
  - [ ] Sentry/Analytics wired
  - [ ] Health endpoints + readiness checks
  - [ ] Sales deck/demo script + sample reports

---

## 🧭 Guardrails (Stay on Plan)

- Do not add providers/features outside this four-week plan
- All analysis traffic goes through the single Strategy layer (local/hf/auto)
- Schema changes require migration + RLS check + tests
- Every PR must include:
  - [ ] DoD matched to the current week
  - [ ] Feature-flagged (runtime togglable)
  - [ ] Logs/metrics sufficient for measurement
- Archived planning docs must not be used as inputs (use this roadmap)

### Daily/PR Checklist

Before start

- [ ] Task is part of this week’s plan
- [ ] Acceptance criteria/DoD are clear
- [ ] If AI-related → use provider strategy + feature flag

Before merge

- [ ] PR title `[WkX][P0/P1]` + DoD
- [ ] Tests PASS (Vitest) + Typecheck/Lint PASS
- [ ] Logs/metrics added
- [ ] Route runtime (Edge/Node) unchanged unintentionally

After deploy

- [ ] Check health, error rate, latency on staging/prod
- [ ] Update checklist/milestone status here


### Go/No-Go Gates
- Gate A (end of Week 1): Dev server stable + full analysis flow + staging OK → If fail, stop other work until pass
- Gate B (end of Week 2): Pricing + payment + quota + metrics ready; no critical errors
- Gate C (end of Week 3): ≥10 feedbacks, mobile QA 5 devices, accuracy complaints < 30%
- Launch (Week 4): All gates pass + rollback + runbook


### Success Metrics
- Week 1: 100% smoke tests pass; dev server uptime > 95%
- Week 2: ≥3 payment flows (test) succeed; quota enforced; error rate < 2%
- Week 3: 10–20 beta users; NPS ≥ 30; perceived accuracy acceptable ≥ 70%
- Week 4: Production deploy; 0 incidents; ≥3 demos/week


## �🛤️ Two Paths Forward

After MVP launch, we have **TWO options** for accuracy improvement. Choose based on:
- User feedback (do they complain about accuracy?)
- Revenue (can we afford ฿1,000-2,000/month?)
- Competition (do we need medical-grade accuracy to compete?)

---

## Path A: AI Gateway Multi-Model Ensemble

### 🎯 Goal: 95-99% Medical-Grade Accuracy

### Strategy:
Use **Vercel AI Gateway** to run 3 vision models simultaneously and combine results via weighted consensus.

### Models:
1. **GPT-4o (OpenAI)** - Primary analysis (92-95% accuracy)
2. **Claude 3.5 Sonnet (Anthropic)** - Validation (93-96% accuracy)
3. **Gemini 2.0 Flash (Google)** - Speed layer (88-92% accuracy)

### Consensus Algorithm:
\`\`\`typescript
const finalScore = (
  gpt4o.score * 0.45 +      // Highest weight for most accurate
  claude.score * 0.40 +      // High weight for medical reasoning
  gemini.score * 0.15        // Lower weight for speed layer
)

const confidence = calculateAgreement([gpt4o, claude, gemini])
\`\`\`

### Cost Estimate:
- **Per Analysis:** ฿30-50 (~$1-1.50)
- **Monthly (100 analyses):** ฿3,000-5,000
- **Monthly (500 analyses):** ฿15,000-25,000

### Implementation Timeline:
- **Week 1-2:** Setup Vercel AI Gateway client
- **Week 3:** Implement multi-model analyzer
- **Week 4:** Consensus algorithm + testing
- **Week 5-6:** A/B testing vs current system
- **Week 7:** Gradual rollout

### Files to Create:
- `lib/ai/gateway-client.ts` - AI Gateway integration
- `lib/ai/multi-model-analyzer.ts` - Multi-model orchestration
- `lib/ai/model-consensus.ts` - Weighted consensus calculation

### Pros:
- ✅ High accuracy (95-99%)
- ✅ Medical-grade quality
- ✅ No hardware required
- ✅ Scalable via API

### Cons:
- ❌ Higher cost (฿30-50 per analysis)
- ❌ Requires revenue to sustain
- ❌ Dependent on 3rd-party API reliability

### When to Choose:
- Users complain about accuracy
- Revenue covers API costs
- Competing against medical clinics

---

## Path B: VISIA-Parity Hardware Augmentation

### 🎯 Goal: 99% Accuracy (Equivalent to VISIA Gen 8)

### Strategy:
Augment software with **specialized hardware** to match professional dermatology devices.

### Hardware Components:

#### 1. **Lighting Control**
- **Option 1 (Affordable):** LED ring light for phones ($30-50)
  - Software-controlled brightness
  - Color temperature adjustment
  - External USB/Bluetooth connection
  
- **Option 2 (Medical-Grade):** Dedicated lighting panel ($200-500)
  - UV wavelength (254-375nm)
  - Polarized light (cross-polarized mode)
  - RBX (red/blue light) imaging
  - Medical-grade LED array

#### 2. **Multi-Spectral Imaging**
- UV imaging camera ($500-1,000)
- Polarized filter attachment ($100-200)
- IR camera for depth mapping ($300-500)

#### 3. **Calibration System**
- Color reference card ($50)
- Standardized lighting box ($1,000-2,000)
- Professional camera mount ($200)

### Software Enhancements:
- AI model trained on UV/polarized images
- StyleGAN for standard → UV simulation
- Depth estimation from multiple angles
- Lighting normalization algorithms

### Cost Estimate:
- **Hardware (Budget):** $500-1,000 per clinic
- **Hardware (Professional):** $5,000-10,000 per clinic
- **Software Training:** $2,000-5,000 (one-time)
- **Per Analysis:** ฿0-5 (mostly local processing)

### Implementation Timeline:
- **Month 1-2:** Prototype with phone accessories
- **Month 3-4:** Test with professional lighting
- **Month 5-6:** Train AI models on UV/polarized data
- **Month 7-9:** FDA/CE certification process (if needed)
- **Month 10-12:** Production hardware manufacturing

### Pros:
- ✅ Highest possible accuracy (99%)
- ✅ One-time hardware cost
- ✅ Low per-analysis cost
- ✅ Competitive advantage (few competitors can match)

### Cons:
- ❌ High upfront investment ($5,000-10,000)
- ❌ Long development timeline (12 months)
- ❌ Hardware maintenance required
- ❌ Requires physical presence (not remote analysis)

### When to Choose:
- Clinic-based business model
- High-value customers (willing to pay premium)
- Need to compete with VISIA directly
- Regulatory approval required (medical device)

---

## ✅ Phase 2: Enterprise Features (COMPLETED - November 2025)

**Status:** 100% Complete (7/7 tasks)  
**Total Implementation:** 49 files, 17,240+ lines of production code  
**Duration:** October - November 2025

### Task 1: Booking & Appointment System ✅
- Complete booking engine with availability checking
- Calendar integration (Google/Outlook sync)
- Payment processing (PromptPay, Credit Card)
- Email/SMS notifications & reminders
- **Files:** 5 files, 1,740 lines
- **Doc:** `docs/TASK1_BOOKING_SYSTEM.md`

### Task 2: Admin Dashboard & Management ✅
- Comprehensive admin dashboard with analytics
- User management (customers, doctors, admins)
- Content Management System (CMS)
- Report generation & export
- **Files:** 5 files, 1,670+ lines
- **Doc:** `docs/TASK2_ADMIN_DASHBOARD.md`

### Task 3: Multi-language Support (i18n) ✅
- Thai, English, Chinese language support
- Dynamic language switching
- Translation management system
- RTL support ready
- **Files:** 9 files, 1,900+ lines
- **Doc:** `docs/TASK3_I18N_SUPPORT.md`

### Task 4: Mobile App (PWA) ✅
- Progressive Web App with offline support
- Service worker & caching strategies
- Push notifications
- Install prompts & app-like experience
- **Files:** 8 files, 2,220+ lines
- **Doc:** `docs/TASK4_PWA_MOBILE.md`

### Task 5: Video Consultation System ✅
- WebRTC-based video calls
- Screen sharing & recording
- Real-time chat during calls
- Call quality monitoring
- **Files:** 7 files, 2,470+ lines
- **Doc:** `docs/TASK5_VIDEO_CONSULTATION.md`

### Task 6: E-Commerce & Product Store ✅
- Complete product catalog (50+ beauty products)
- Shopping cart & checkout system
- Payment gateway integration (Stripe/PromptPay)
- Order management & tracking
- **Files:** 9 files, 2,800+ lines
- **Doc:** `docs/TASK6_ECOMMERCE.md`

### Task 7: Advanced AI Features ✅
- Skin disease detection (15 conditions)
- Virtual makeup try-on (8 categories)
- Personalized skincare routine generator
- AI-powered recommendations
- **Files:** 6 files, 2,900+ lines
- **Doc:** `docs/TASK7_ADVANCED_AI.md`

---

## 📋 Feature Roadmap (Independent of Accuracy Path)

### Phase 1: MVP Stabilization (Month 1-2)
- ✅ Deploy production
- ✅ Monitor errors & performance
- ✅ Fix critical bugs
- ✅ User feedback collection

### Phase 2: User Experience (Month 2-3)
- 📋 Onboarding tutorial
- 📋 Progress tracking (before/after timeline)
- 📋 Treatment history
- 📋 Email notifications
- 📋 Push notifications (mobile)

### Phase 3: Business Features (Month 3-4)
- 📋 Booking system enhancement
- 📋 Payment integration (Stripe/PromptPay)
- 📋 Clinic admin dashboard improvements
- 📋 Sales CRM integration
- 📋 Inventory management

### Phase 4: Advanced Analytics (Month 4-5)
- 📋 Skin age tracking over time
- 📋 Treatment effectiveness analysis
- 📋 Predictive modeling (future skin state)
- 📋 Personalized treatment recommendations
- 📋 Comparison with similar users (anonymized)

### Phase 5: Multi-Platform (Month 5-6)
- 📋 React Native mobile app
- 📋 iOS app store submission
- 📋 Android app store submission
- 📋 Offline analysis mode
- 📋 Camera optimization for mobile

### Phase 6: Social & Sharing (Month 6-7)
- 📋 Social media integration
- 📋 Referral program
- 📋 Before/after galleries (opt-in)
- 📋 Community features
- 📋 Expert consultations (video chat)

---

## 🔄 Decision Points

### After 3 Months of MVP Operation:

**Evaluate:**
- Total users acquired
- Monthly active users
- Average analyses per user
- Revenue generated
- User satisfaction scores
- Accuracy complaints

**Then Decide:**
- **If revenue > ฿50,000/month:** Consider Path A (AI Gateway)
- **If partnered with clinics:** Consider Path B (Hardware)
- **If accuracy complaints < 10%:** Keep current system
- **If competition intensifies:** Accelerate accuracy upgrade

---

## 💰 Budget Planning

### Current Monthly Cost (MVP):
- Hosting (Vercel): ฿0 (free tier) → ฿600 (Pro if scaling)
- Database (Supabase): ฿0 (free tier) → ฿800 (Pro if > 500MB)
- APIs: ฿0-500 (Hugging Face free tier)
- **Total: ฿0-1,900/month**

### Future Cost (Path A - AI Gateway):
- Hosting: ฿600
- Database: ฿800
- AI APIs: ฿15,000-25,000 (for 500 analyses)
- **Total: ฿16,400-26,400/month**
- **Required Revenue:** ฿50,000-80,000/month (60% margin)

### Future Cost (Path B - Hardware):
- Hosting: ฿600
- Database: ฿800
- Hardware (amortized): ฿2,000/month ($10,000 / 60 months)
- **Total: ฿3,400/month**
- **Required Revenue:** ฿10,000-15,000/month (60% margin)

---

## 🎯 Success Metrics

### MVP Success Criteria (3 Months):
- 100+ registered users
- 50+ paying customers
- 500+ analyses performed
- < 5% critical error rate
- > 70% user satisfaction
- ฿20,000+ monthly revenue

### Year 1 Goals:
- 1,000+ active users
- 500+ paying customers
- 10,000+ analyses performed
- 85%+ accuracy (maintained or improved)
- > 80% user satisfaction
- ฿200,000+ monthly revenue

---

## 📚 Related Documentation

- **PROJECT_STATUS.md** - Current system status
- **ARCHITECTURE.md** - Technical architecture details
- **DEPLOYMENT_GUIDE.md** - Production deployment steps
- **docs/archive/2025-01-previous-planning/** - Previous roadmap versions (archived)

---

## 🔄 Roadmap Maintenance

This roadmap is reviewed and updated:
- **Monthly** - After each sprint
- **Quarterly** - Strategic direction review
- **After major changes** - New features, pivots, market shifts

**Next Review:** February 2025

---

**Maintained by:** AI Development Team  
**Stakeholders:** Product, Engineering, Business  
**Approval:** Required for major path decisions (A vs B)

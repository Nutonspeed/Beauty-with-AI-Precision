# 🧪 Smoke Test Checklist - Production Deployment

**Date:** November 9, 2025  
**Deployment:** Vercel Auto (Commit: 4a3c86a)  
**Changes:** Bug fixes #14-16 + User Management API

---

## 📋 Pre-Test Setup

- [ ] **Vercel Build Status:** Check build logs at https://vercel.com/nuttapongs-projects-6ab11a57/beauty-with-ai-precision
- [ ] **Build Success:** Verify no errors in build output
- [ ] **Deployment URL:** Confirm production URL is live
- [ ] **Database Migration:** Apply `20250209000000_user_management_tables.sql` to Supabase

---

## 🔐 Test 1: Authentication & Role Access

### 1.1 Super Admin Login
- [ ] Go to: `https://[production-url]/auth/login`
- [ ] Login as: `super_admin@example.com`
- [ ] Expected: Redirect to `/admin/dashboard`
- [ ] Check: Can see "User Management" in nav
- [ ] Check: Can access `/admin/users/create`

### 1.2 Clinic Owner Login
- [ ] Login as: `clinic_owner@clinic1.com`
- [ ] Expected: Redirect to `/clinic/dashboard`
- [ ] Check: Can see clinic analytics
- [ ] Check: Can access `/clinic/users/create` (for sales staff)

### 1.3 Sales Staff Login
- [ ] Login as: `sales@clinic1.com`
- [ ] Expected: Redirect to `/sales/dashboard`
- [ ] Check: Can start AI analysis session
- [ ] Check: Cannot access `/admin` or `/clinic` routes

### 1.4 Customer Login
- [ ] Login as: `customer@example.com`
- [ ] Expected: Redirect to `/customer/dashboard`
- [ ] Check: Can view own analysis history
- [ ] Check: Can book appointments

---

## 🤖 Test 2: AI Analysis Flow (Bug Fixes Validation)

### 2.1 Upload & Analyze
- [ ] Login as Sales Staff
- [ ] Go to: `/sales/presentation`
- [ ] Upload test image (face photo)
- [ ] Click "Analyze"
- [ ] Expected: Analysis completes in <30 seconds

### 2.2 Verify Bug #14 Fix (Recommendations with Confidence)
- [ ] Check analysis results JSON
- [ ] Expected format:
```json
{
  "recommendations": [
    {
      "text": "Reduce wrinkles with Retinol treatment",
      "confidence": 0.85,
      "priority": "high"
    }
  ]
}
```
- [ ] Verify: Each recommendation has `confidence` (0-1) and `priority` (high/medium/low)
- [ ] Verify: Sorted by priority → confidence

### 2.3 Verify Bug #15 Fix (Real Spot Score)
- [ ] Check `overall_scores.spots` in results
- [ ] Expected: Score 0-10 based on CV detection
- [ ] Verify: No hardcoded minimum of 2
- [ ] Test edge case: Upload image with NO spots
- [ ] Expected: Score close to 0 (not forced to 2+)

### 2.4 Verify Bug #16 Fix (Percentile Calculation)
- [ ] Check `health_score_percentile` in results
- [ ] Expected: Percentile 0-100 using normal distribution
- [ ] Verify: Score=0 → ~5%, Score=10 → ~95%
- [ ] Check console logs for: "Percentile: score=X.X → Y% (using normal distribution)"

### 2.5 Export PDF
- [ ] Click "Export Report"
- [ ] Expected: PDF downloads with all analysis data
- [ ] Verify: Recommendations show in PDF with priority indicators
- [ ] Check: No errors in browser console

---

## 👥 Test 3: User Management API

### 3.1 Database Migration Check
```bash
# Connect to Supabase Studio
# Check tables exist:
- invitations (with setup_token, temp_password columns)
- user_activity_log (with action, details JSONB)

# Check RLS policies enabled
```

### 3.2 Create Clinic Owner (Super Admin)
```bash
# Using Postman or curl:
curl -X POST https://[production-url]/api/users/create \
  -H "Authorization: Bearer [super_admin_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newowner@clinic2.com",
    "role": "clinic_owner",
    "full_name": "New Clinic Owner",
    "clinic_id": "clinic-002"
  }'

# Expected Response:
{
  "success": true,
  "user": {
    "id": "...",
    "email": "newowner@clinic2.com",
    "temp_password": "Abc123!xyz45" // 12 chars
  }
}
```
- [ ] Status: 200 OK
- [ ] Response has `temp_password` (12 chars with complexity)
- [ ] User created in `auth.users` table
- [ ] Profile entry created in `profiles` table
- [ ] Activity logged in `user_activity_log`

### 3.3 Send Invitation Email
```bash
curl -X POST https://[production-url]/api/users/invite \
  -H "Authorization: Bearer [super_admin_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "[user_id_from_step_3.2]",
    "email": "newowner@clinic2.com",
    "temp_password": "Abc123!xyz45"
  }'

# Expected Response:
{
  "success": true,
  "email": {
    "to": "newowner@clinic2.com",
    "subject": "Welcome to AI367 Beauty - เจ้าของคลินิก",
    "html": "..."
  },
  "debug": {
    "setup_url": "https://[production-url]/auth/setup?token=...",
    "expires_at": "2025-11-16T..."
  }
}
```
- [ ] Status: 200 OK
- [ ] Email HTML contains temp password
- [ ] Setup URL generated (32-char token)
- [ ] Invitation record created in `invitations` table
- [ ] Status: `pending`, expires in 7 days

### 3.4 Create Sales Staff (Clinic Owner)
- [ ] Login as Clinic Owner
- [ ] Create Sales Staff via API:
```bash
curl -X POST https://[production-url]/api/users/create \
  -H "Authorization: Bearer [clinic_owner_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newsales@clinic1.com",
    "role": "sales_staff",
    "full_name": "New Sales Rep"
  }'
```
- [ ] Expected: Success (no clinic_id needed, auto-inherits)
- [ ] Verify: User assigned to same clinic as creator

### 3.5 Permission Checks (Negative Tests)
- [ ] Sales Staff tries to create user → Expected: 403 Forbidden
- [ ] Clinic Owner tries to create `super_admin` → Expected: 403 Forbidden
- [ ] Clinic Owner tries to create user for different clinic → Expected: 403 Forbidden

---

## 📊 Test 4: Production Health Checks

### 4.1 Performance
- [ ] Page load time: <3 seconds
- [ ] AI analysis time: <30 seconds
- [ ] PDF export time: <5 seconds

### 4.2 Error Monitoring
- [ ] Check browser console: No critical errors
- [ ] Check Vercel logs: No 500 errors
- [ ] Check Supabase logs: No RLS policy violations

### 4.3 Mobile Responsiveness
- [ ] Test on mobile browser
- [ ] Upload image from camera
- [ ] View analysis results
- [ ] Export PDF works

---

## ✅ Success Criteria

**Critical (Must Pass):**
- [x] Vercel build successful (no errors)
- [ ] All 4 user roles can login
- [ ] AI analysis completes successfully
- [ ] Bug #14-16 fixes verified in production
- [ ] User Management API endpoints return 200 OK
- [ ] RLS policies prevent unauthorized access

**Important (Should Pass):**
- [ ] PDF export works without errors
- [ ] Recommendations show confidence scores
- [ ] Spot scores use real CV detection (not hardcoded)
- [ ] Percentiles calculated correctly
- [ ] Invitation emails generated with correct template

**Nice-to-Have:**
- [ ] No console warnings
- [ ] Fast page loads (<3s)
- [ ] Mobile-friendly UI

---

## 🚨 Rollback Plan

If critical issues found:

```bash
# 1. Revert to previous commit
git revert 4a3c86a
git push origin main

# 2. Or point Vercel to previous deployment
# Go to Vercel Dashboard → Deployments → Click previous → "Promote to Production"

# 3. Notify users
# Post in clinic owner group: "Maintenance in progress, back online in 10 mins"
```

---

## 📝 Test Results Log

**Tester:** _______________  
**Date/Time:** _______________  
**Build Version:** 4a3c86a

| Test Section | Status | Notes |
|--------------|--------|-------|
| 1. Authentication | ⏳ Pending | |
| 2. AI Analysis | ⏳ Pending | |
| 3. User Management API | ⏳ Pending | |
| 4. Health Checks | ⏳ Pending | |

**Overall Result:** ⏳ In Progress

**Issues Found:**
1. _______________
2. _______________

**Next Actions:**
- [ ] Fix critical issues
- [ ] Re-test
- [ ] Document findings in PROJECT_STATUS.md

---

**Status:** Ready for Testing ✅  
**Deployment URL:** https://beauty-with-ai-precision.vercel.app (check screenshot)

# 🧪 Smoke Test Checklist - Production

**Production URL:** https://beauty-with-ai-precision.vercel.app  
**Date:** November 9, 2025  
**Tester:** _____________

---

## 📋 Pre-Test Setup

### 1. Get Supabase Access Token
```bash
# Login to production and get JWT token from browser DevTools
# Application → Local Storage → supabase.auth.token
```

- [ ] Extracted `access_token` from browser
- [ ] Token valid (check expiry)
- [ ] Saved token to Postman environment variable

### 2. Import Postman Collection
- [ ] Imported `USER_API_POSTMAN_COLLECTION.json`
- [ ] Set `base_url` = `https://beauty-with-ai-precision.vercel.app`
- [ ] Set `supabase_access_token` = `<your_token_here>`
- [ ] Set `test_clinic_id` = `<valid_clinic_uuid>`

---

## 🔐 Test 1: Authentication & Login

### 1.1 Login as Super Admin
```
URL: https://beauty-with-ai-precision.vercel.app/auth/login
Credentials: Your super_admin account
```

**Checklist:**
- [ ] Login page loads (< 2 seconds)
- [ ] Email/password fields visible
- [ ] Login successful
- [ ] Redirects to dashboard
- [ ] User role displayed correctly (super_admin)
- [ ] Navigation menu shows admin options

**Expected:** Access to all features + User Management menu

---

### 1.2 Login as Clinic Admin
```
Use existing clinic_admin account or create one via API
```

**Checklist:**
- [ ] Login successful
- [ ] Role displayed correctly (clinic_admin)
- [ ] Can access clinic dashboard
- [ ] Cannot see super admin features
- [ ] Can see user management for own clinic

**Expected:** Limited to clinic scope

---

### 1.3 Login as Sales Staff
```
Use existing sales_staff account
```

**Checklist:**
- [ ] Login successful
- [ ] Role displayed correctly (sales_staff)
- [ ] Limited navigation menu
- [ ] Cannot access user management
- [ ] Can access customer features

**Expected:** Most restricted permissions

---

## 🤖 Test 2: AI Analysis (Bug Fixes #14-16)

### 2.1 Upload Test Image
```
Upload: Sample face image (JPG/PNG, < 10MB)
```

**Checklist:**
- [ ] Upload form loads
- [ ] Image preview shows
- [ ] Upload successful (< 5 seconds)
- [ ] Loading indicator during processing
- [ ] Analysis completes (< 30 seconds)

---

### 2.2 Verify Bug #14: Recommendations Format
```sql
-- Expected: Recommendations with confidence + priority
{
  "text": "แนะนำให้ใช้ครีมบำรุง...",
  "confidence": 0.85,
  "priority": "high"
}
```

**Checklist:**
- [ ] All recommendations have `confidence` field (0-1)
- [ ] All recommendations have `priority` field (high/medium/low)
- [ ] Confidence values are realistic (not all 1.0)
- [ ] Priority distribution makes sense (not all "high")

**Expected:** Old bug: recommendations were simple strings. ✅ Fixed: now objects with metadata

---

### 2.3 Verify Bug #15: Spot Score (Not Hardcoded)
```javascript
// Old bug: Math.max(2, cvResults.spots?.count || 0)
// Fixed: Uses actual CV detection count
```

**Upload 3 different images:**

**Image 1: Clear skin (0-2 spots expected)**
- [ ] Spot count displayed
- [ ] Count matches visual inspection
- [ ] Score is NOT hardcoded to 2
- Actual count: _______

**Image 2: Moderate acne (5-15 spots expected)**
- [ ] Higher spot count than clear skin
- [ ] Count reflects image content
- Actual count: _______

**Image 3: Severe acne (20+ spots expected)**
- [ ] Significantly higher count
- [ ] Not capped at low number
- Actual count: _______

**Expected:** Spot scores vary based on actual CV detection (not stuck at 2)

---

### 2.4 Verify Bug #16: Percentile Calculation (0-100)
```javascript
// Old bug: Percentile sometimes > 100 or wrong formula
// Fixed: Correct std=2.5, proper clamping
```

**Check percentile for all metrics:**

**Hydration:**
- [ ] Value between 0-100
- [ ] No decimals > 100
- [ ] Formula: ((value - mean) / (std * 2.5) + 0.5) * 100
- Displayed: _______

**Elasticity:**
- [ ] Value between 0-100
- [ ] Proper clamping
- Displayed: _______

**Pigmentation:**
- [ ] Value between 0-100
- [ ] Makes sense compared to image
- Displayed: _______

**Texture:**
- [ ] Value between 0-100
- [ ] Consistent with visual assessment
- Displayed: _______

**Expected:** All percentiles 0-100, correctly calculated with std=2.5

---

## 🔗 Test 3: User Management API

### 3.1 Test: Create Clinic Admin (Super Admin only)
```
Postman: "1. Create Clinic Admin (Super Admin only)"
```

**Request:**
```json
{
  "email": "test-admin-[timestamp]@example.com",
  "full_name": "ทดสอบ แอดมิน",
  "role": "clinic_admin",
  "clinic_id": "<valid_uuid>",
  "send_invitation_email": false
}
```

**Checklist:**
- [ ] Status: 201 Created
- [ ] Response has `user_id` (UUID)
- [ ] Response has `setup_link` (includes `/auth/setup?token=...`)
- [ ] Response has `temp_password` (>= 8 chars)
- [ ] Response has `invitation` object
- [ ] Setup link valid for 7 days

**Copy Response:**
```json
{
  "user_id": "_______",
  "setup_link": "_______",
  "temp_password": "_______"
}
```

---

### 3.2 Test: Create Sales Staff (Clinic Admin only)
```
Postman: "2. Create Sales Staff (Clinic Admin only)"
Login as clinic_admin first!
```

**Request:**
```json
{
  "email": "test-sales-[timestamp]@example.com",
  "full_name": "ทดสอบ ขายดี",
  "role": "sales_staff",
  "send_invitation_email": false
}
```

**Checklist:**
- [ ] Status: 201 Created
- [ ] `clinic_id` auto-filled from creator
- [ ] User created in same clinic
- [ ] Cannot create users in other clinics
- [ ] Proper RLS enforcement

---

### 3.3 Test: Invite User (Resend Setup Link)
```
Postman: "3. Invite User (Resend setup link)"
```

**Request:**
```json
{
  "user_id": "<created_user_id_from_3.1>"
}
```

**Checklist:**
- [ ] Status: 200 OK
- [ ] New `setup_link` generated
- [ ] New `temp_password` generated
- [ ] Old invitation marked as expired
- [ ] New invitation created

---

### 3.4 Test: Permission Checks
```
Postman: "5. Test: Create User (Permission Denied)"
```

**Use invalid/no token:**
- [ ] Status: 403 Forbidden
- [ ] Error message clear
- [ ] No data leaked

**Sales Staff tries to create user:**
- [ ] Status: 403 Forbidden
- [ ] Proper error message

**Clinic Admin tries to create in other clinic:**
- [ ] Status: 403 Forbidden
- [ ] RLS blocks cross-clinic access

---

### 3.5 Test: Validation
```
Postman: "6. Test: Create User (Invalid Email)"
```

**Invalid email:**
- [ ] Status: 400 Bad Request
- [ ] Error mentions "email"

**Missing required fields:**
- [ ] Status: 400 Bad Request
- [ ] Clear error message

**Invalid role:**
- [ ] Status: 400 Bad Request
- [ ] Lists valid roles

---

## 📄 Test 4: PDF Export

### 4.1 Generate Analysis PDF
```
After completing AI analysis, click "Export PDF"
```

**Checklist:**
- [ ] Export button visible
- [ ] PDF generates (< 10 seconds)
- [ ] PDF downloads automatically
- [ ] Filename includes date/time
- [ ] File size reasonable (< 5MB)

---

### 4.2 Verify PDF Content

**Open generated PDF:**
- [ ] Patient info displayed
- [ ] Analysis date/time
- [ ] All metrics present (hydration, elasticity, etc.)
- [ ] Percentile values match web UI
- [ ] Recommendations included
- [ ] Images embedded correctly
- [ ] Formatted professionally
- [ ] No broken layouts

**Recommendations in PDF:**
- [ ] Have `confidence` scores
- [ ] Have `priority` labels
- [ ] Match web UI exactly

---

## 🎯 Test 5: End-to-End Flow

### 5.1 Complete User Journey

**As Super Admin:**
1. [ ] Login → Dashboard
2. [ ] Create Clinic Admin via API
3. [ ] Copy setup link
4. [ ] Logout

**As New Clinic Admin:**
5. [ ] Open setup link in incognito
6. [ ] Set new password
7. [ ] Login with new password
8. [ ] Create Sales Staff via API
9. [ ] Verify sales staff in database

**As Sales Staff:**
10. [ ] Login
11. [ ] Upload customer image
12. [ ] Verify analysis (bugs #14-16 fixed)
13. [ ] Export PDF
14. [ ] Logout

**Full flow should complete in < 5 minutes**

---

## ✅ Test Results Summary

| Test Area | Status | Issues Found | Severity |
|-----------|--------|--------------|----------|
| Authentication | ⬜ Pass / ⬜ Fail | | |
| AI Analysis | ⬜ Pass / ⬜ Fail | | |
| Bug #14 Fixed | ⬜ Pass / ⬜ Fail | | |
| Bug #15 Fixed | ⬜ Pass / ⬜ Fail | | |
| Bug #16 Fixed | ⬜ Pass / ⬜ Fail | | |
| User API (Create) | ⬜ Pass / ⬜ Fail | | |
| User API (Invite) | ⬜ Pass / ⬜ Fail | | |
| Permissions/RLS | ⬜ Pass / ⬜ Fail | | |
| PDF Export | ⬜ Pass / ⬜ Fail | | |
| E2E Flow | ⬜ Pass / ⬜ Fail | | |

---

## 🚨 Issues Found

### Issue 1
- **Area:** _______
- **Description:** _______
- **Severity:** ⬜ Critical / ⬜ High / ⬜ Medium / ⬜ Low
- **Steps to Reproduce:** _______
- **Expected:** _______
- **Actual:** _______

### Issue 2
- **Area:** _______
- **Description:** _______
- **Severity:** ⬜ Critical / ⬜ High / ⬜ Medium / ⬜ Low

---

## 📊 Performance Observations

- **Page Load (Dashboard):** _______ seconds
- **AI Analysis Time:** _______ seconds
- **PDF Generation Time:** _______ seconds
- **API Response Time (Create User):** _______ ms
- **API Response Time (Invite):** _______ ms

---

## ✅ Sign-off

**All critical tests passed:**
- [ ] Login works for all roles
- [ ] AI analysis shows correct data (bugs #14-16 fixed)
- [ ] User API creates users correctly
- [ ] Permissions enforced properly
- [ ] PDF export works

**Ready for clinic testing:** ⬜ Yes / ⬜ No (see issues above)

**Tester Signature:** _____________  
**Date:** _____________  
**Time:** _____________

# 📦 How to Use Postman Collection

## Quick Start

### 1. Import Collection to Postman

1. Open **Postman Desktop** or **Postman Web**
2. Click **Import** (top left)
3. Select `USER_API_POSTMAN_COLLECTION.json`
4. Collection will appear in sidebar: **"Beauty AI - User Management API"**

---

### 2. Setup Environment Variables

Create a new environment or use existing one:

**Required Variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `https://beauty-with-ai-precision.vercel.app` | Production URL |
| `supabase_access_token` | `<your_jwt_token>` | From browser after login |
| `test_clinic_id` | `<valid_clinic_uuid>` | Get from database |

---

### 3. Get Supabase Access Token

**Step-by-step:**

1. **Login to production:**
   ```
   https://beauty-with-ai-precision.vercel.app/auth/login
   ```

2. **Open Browser DevTools:**
   - Chrome/Edge: `F12` or `Ctrl+Shift+I`
   - Firefox: `F12`

3. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)

4. **Navigate to:**
   ```
   Local Storage → https://beauty-with-ai-precision.vercel.app
   ```

5. **Find key:**
   ```
   sb-<project-id>-auth-token
   ```

6. **Copy the `access_token` value** (long JWT string starting with `eyJ...`)

7. **Paste into Postman environment variable** `supabase_access_token`

**Token expires in 1 hour** - refresh if you get 401 errors!

---

### 4. Get Test Clinic ID

**Option A: From Database (Supabase Dashboard)**

```sql
SELECT id, name FROM clinics LIMIT 5;
```

Copy a UUID from the `id` column.

**Option B: Use your own clinic (if you're Clinic Admin)**

```sql
SELECT clinic_id FROM users WHERE id = auth.uid();
```

---

## 🧪 Running Tests

### Manual Testing (Individual Requests)

**Test 1: Create Clinic Admin**
1. Select request: `"1. Create Clinic Admin (Super Admin only)"`
2. Update body with unique email (avoid duplicates)
3. Click **Send**
4. Check response: Status 201, has `user_id` + `setup_link` + `temp_password`

**Test 2: Create Sales Staff**
1. First, get token from **Clinic Admin** account (not Super Admin)
2. Update `supabase_access_token` in environment
3. Select request: `"2. Create Sales Staff (Clinic Admin only)"`
4. Update email in body
5. Click **Send**
6. Check: Status 201, `clinic_id` auto-filled

**Test 3: Resend Invitation**
1. Copy `user_id` from previous response
2. Update body: `{"user_id": "<paste_here>"}`
3. Click **Send**
4. Check: Status 200, new `setup_link` + `temp_password`

---

### Automated Testing (Test Scripts)

Collection includes **test scripts** that auto-validate responses.

**Run all tests:**
1. Click **Collection** name (top level)
2. Click **Run** button (right side)
3. Select all requests with "Test:" prefix
4. Click **Run Beauty AI - User Management API**

**Check results:**
- ✅ Green = Passed
- ❌ Red = Failed (check error message)

**Test scripts validate:**
- HTTP status codes (201, 200, 400, 403)
- Response structure (has required fields)
- Data types (UUID, string, etc.)
- Business logic (permissions, RLS)

---

## 🔍 Example Requests

### Example 1: Create Clinic Admin (Success)

**Request:**
```http
POST https://beauty-with-ai-precision.vercel.app/api/users/create
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "admin@clinic-a.com",
  "full_name": "สมชาย คลินิกเจ้าของ",
  "role": "clinic_admin",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "send_invitation_email": false
}
```

**Response (201):**
```json
{
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "setup_link": "https://beauty-with-ai-precision.vercel.app/auth/setup?token=abc123xyz...",
  "temp_password": "TempPass#2025",
  "invitation": {
    "id": "12345678-1234-1234-1234-123456789012",
    "status": "pending",
    "expires_at": "2025-11-16T12:00:00Z"
  }
}
```

---

### Example 2: Permission Denied (403)

**Request (using Sales Staff token):**
```http
POST https://beauty-with-ai-precision.vercel.app/api/users/create
Authorization: Bearer <sales_staff_token>

{
  "email": "unauthorized@test.com",
  "full_name": "Test User",
  "role": "clinic_admin",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (403):**
```json
{
  "error": "You don't have permission to create users with role: clinic_admin"
}
```

---

### Example 3: Invalid Email (400)

**Request:**
```http
POST https://beauty-with-ai-precision.vercel.app/api/users/create

{
  "email": "not-an-email",
  "full_name": "Test User",
  "role": "clinic_admin",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (400):**
```json
{
  "error": "Invalid email address"
}
```

---

## 🎯 Test Scenarios

### Scenario 1: Super Admin Creates Clinic Admin

**Goal:** Verify hierarchical creation works

1. Login as **Super Admin**
2. Get access token
3. Run: `"1. Create Clinic Admin"`
4. Verify: Status 201 + valid response
5. Check database:
   ```sql
   SELECT id, email, role, clinic_id FROM users WHERE email = 'admin@clinic-a.com';
   ```

**Expected:** User created with `role = clinic_admin` and specified `clinic_id`

---

### Scenario 2: Clinic Admin Creates Sales Staff

**Goal:** Verify clinic_id inheritance

1. Login as **Clinic Admin** (created in Scenario 1)
2. Get new access token (from Clinic Admin session)
3. Run: `"2. Create Sales Staff"`
4. Verify: Status 201
5. Check database:
   ```sql
   SELECT id, email, role, clinic_id FROM users 
   WHERE email = 'sales@clinic-a.com';
   ```

**Expected:** Sales staff has **same** `clinic_id` as creator (auto-filled)

---

### Scenario 3: Sales Staff Cannot Create Users

**Goal:** Verify permission enforcement

1. Login as **Sales Staff**
2. Get access token
3. Run: `"5. Test: Create User (Permission Denied)"`
4. Verify: Status 403
5. Error message: "You don't have permission..."

**Expected:** Request blocked, no user created

---

### Scenario 4: Resend Invitation (Expired Setup Link)

**Goal:** Verify invitation regeneration

1. Use `user_id` from Scenario 1
2. Run: `"3. Invite User"`
3. Verify: Status 200 + new `setup_link` + new `temp_password`
4. Check database:
   ```sql
   SELECT status, expires_at, setup_token FROM invitations 
   WHERE user_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
   ORDER BY created_at DESC LIMIT 2;
   ```

**Expected:** Old invitation status changed, new invitation created

---

## 🚨 Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Token expired (1 hour limit)

**Fix:**
1. Re-login to production
2. Get new `access_token` from browser
3. Update Postman environment variable

---

### Issue: 403 Forbidden (RLS Error)

**Cause:** Trying to access/create users outside your scope

**Examples:**
- Sales Staff trying to create users
- Clinic Admin trying to create users in another clinic
- Invalid role hierarchy

**Fix:**
- Use correct role token (Super Admin → create Clinic Admin)
- Ensure `clinic_id` matches your clinic (for Clinic Admin)

---

### Issue: 400 Bad Request (Duplicate Email)

**Cause:** Email already exists

**Fix:**
- Use unique email: `test-admin-1731155999@example.com`
- Or use dynamic timestamps: `test-{{$timestamp}}@example.com`

---

### Issue: Cannot find `test_clinic_id`

**Run this query in Supabase:**
```sql
SELECT id, name FROM clinics LIMIT 5;
```

Copy any `id` and paste into Postman environment.

---

## 📊 Test Results Interpretation

### All Tests Passed ✅

```
✅ Status code is 201
✅ Response has user_id
✅ Response has setup_link
✅ Response has temp_password
✅ Status code is 403 (permission test)
✅ Status code is 400 (validation test)
```

**Meaning:** User Management API working correctly!

---

### Some Tests Failed ❌

**Example failure:**
```
❌ Status code is 201
   Expected: 201
   Actual: 500
```

**Debugging steps:**
1. Check **response body** for error message
2. Check **Vercel logs** for backend errors
3. Check **Supabase logs** for RLS/database errors
4. Verify **environment variables** are correct

---

## 🎓 Tips & Best Practices

1. **Use unique emails** to avoid duplicates (add timestamps)
2. **Refresh tokens frequently** (expire in 1 hour)
3. **Run tests in order** (Create → Invite → Validate)
4. **Save user_ids** in environment variables for chaining requests
5. **Check database** after each test to verify data
6. **Test both success and failure cases** (permissions, validation)
7. **Use test mode** (`send_invitation_email: false`) to avoid spam

---

## 📝 Next Steps

After Postman tests pass:

1. ✅ **Run manual smoke tests** (see `SMOKE_TEST_CHECKLIST.md`)
2. ✅ **Test with real clinics** (create actual clinic admins)
3. ✅ **Verify email delivery** (set `send_invitation_email: true`)
4. ✅ **Test setup link flow** (open link, set password)
5. ✅ **Production monitoring** (Sentry, Analytics)

---

**Questions?** Check `USER_MANAGEMENT_API.md` for full API documentation.

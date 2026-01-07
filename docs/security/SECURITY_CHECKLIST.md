# ClinicIQ Security Checklist

## Pre-Deployment Security Audit

### ✅ Authentication & Authorization

- [x] **JWT Token Validation** - Tokens validated on every request
- [x] **Session Expiry** - Sessions expire after inactivity
- [x] **Refresh Token Rotation** - New refresh token on each use
- [x] **Password Hashing** - bcrypt with salt rounds ≥ 10
- [x] **Role-Based Access Control** - 4 roles (super_admin, clinic_owner, staff, customer)
- [x] **Multi-Tenant Isolation** - Clinic data isolated via RLS

### ✅ API Security

- [x] **CORS Configuration** - Restricted to allowed origins
- [x] **Rate Limiting** - 60-120 req/min per user
- [x] **Input Validation** - Zod schemas for all inputs
- [x] **SQL Injection Prevention** - Parameterized queries via Supabase
- [x] **XSS Prevention** - React auto-escapes, CSP headers
- [x] **CSRF Protection** - SameSite cookies, token validation

### ✅ Data Protection

- [x] **HTTPS Only** - All traffic encrypted
- [x] **Sensitive Data Encryption** - At-rest encryption in Supabase
- [x] **PII Handling** - PDPA compliant data handling
- [x] **Audit Logging** - All data access logged
- [x] **Data Retention** - Configurable retention policies

### ✅ Infrastructure Security

- [x] **Environment Variables** - No secrets in code
- [x] **Security Headers** - CSP, X-Frame-Options, etc.
- [x] **Dependency Scanning** - npm audit / Snyk
- [x] **Error Handling** - No stack traces in production

---

## Security Headers (next.config.js)

```javascript
headers: [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=()'
  }
]
```

---

## Row Level Security (RLS) Policies

### Users Table
```sql
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Only admins can update users
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'clinic_owner')
    )
  );
```

### Clinic Data
```sql
-- Staff can only access their clinic's data
CREATE POLICY "Clinic data isolation" ON clinic_data
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
    )
  );
```

### Analysis Data
```sql
-- Users can only view their own analyses
CREATE POLICY "Own analysis only" ON skin_analyses
  FOR SELECT USING (user_id = auth.uid());
```

---

## API Authentication Flow

```
1. Client sends credentials to /api/auth/login
2. Server validates credentials against Supabase
3. Server returns JWT + refresh token
4. Client stores tokens securely (httpOnly cookies)
5. Client sends JWT in Authorization header
6. Server validates JWT on each request
7. Server checks RLS policies for data access
8. Server logs audit trail
```

---

## Vulnerability Response Plan

### Severity Levels

| Level | Response Time | Action |
|-------|---------------|--------|
| Critical | 1 hour | Immediate patch, notify users |
| High | 24 hours | Patch in next release |
| Medium | 1 week | Schedule fix |
| Low | 1 month | Add to backlog |

### Contact

- **Security Team:** security@cliniciq.app
- **Bug Bounty:** https://bugcrowd.com/cliniciq

---

## Compliance

- [x] **PDPA** - Thai Personal Data Protection Act
- [x] **GDPR** - EU General Data Protection Regulation (for EU users)
- [ ] **HIPAA** - Not currently HIPAA compliant
- [x] **ISO 27001** - Information security management

---

## Regular Security Tasks

- [ ] Weekly: Review access logs
- [ ] Monthly: Dependency updates
- [ ] Quarterly: Penetration testing
- [ ] Annually: Full security audit

---

Last Updated: December 2024

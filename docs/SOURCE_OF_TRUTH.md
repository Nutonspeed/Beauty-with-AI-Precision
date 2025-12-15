# Beauty with AI Precision - Source of Truth Matrix

## 📋 Overview
This document serves as the single source of truth for the Beauty with AI Precision platform's architecture, data model, and development roadmap.

---

## 🗄️ Canonical Database Tables

### Core Entity Tables
| Table | Purpose | Primary Key | Foreign Keys | Notes |
|-------|---------|-------------|--------------|-------|
| `users` | User authentication & profiles | `id` (UUID) | `clinic_id` → `clinics.id` | Canonical user table, NOT `profiles` |
| `clinics` | Multi-tenant clinic data | `id` (UUID) | - | Acts as tenant table, NOT `tenants` |
| `user_profiles` | Extended user information | `id` | `user_id` → `users.id` | Optional extended data |

### Business Logic Tables
| Table | Purpose | Primary Key | Foreign Keys | Multi-tenant |
|-------|---------|-------------|--------------|--------------|
| `skin_analyses` | AI skin analysis results | `id` | `user_id`, `clinic_id` | Yes (via `clinic_id`) |
| `treatment_plans` | Treatment recommendations | `id` | `user_id`, `clinic_id` | Yes |
| `bookings` | Appointment system | `id` | `user_id`, `clinic_id` | Yes |
| `treatment_records` | Treatment history | `id` | `user_id`, `clinic_id` | Yes |
| `sales_leads` | CRM leads | `id` | `clinic_id` | Yes |
| `chat_rooms` | Real-time messaging | `id` | `clinic_id` | Yes |

---

## 🔐 Role-Based Access Control

### User Roles
| Role | Scope | Can Access |
|------|-------|------------|
| `super_admin` | Global | All clinics, all data |
| `clinic_owner` | Single Clinic | Own clinic data |
| `staff` | Single Clinic | Assigned clinic data |
| `customer` | Single Clinic | Own data only |

### RLS Policy Pattern
```sql
-- Standard pattern for multi-tenant tables
CREATE POLICY "Users can view own clinic data" ON table_name
  FOR SELECT
  USING (auth.uid()::text = user_id::text OR 
         get_user_clinic_id(auth.uid()) = clinic_id OR
         is_super_admin());
```

---

## 🛠️ API Endpoints Mapping

### Admin Endpoints (Super Admin)
| Endpoint | Method | Table(s) | Role Check |
|----------|--------|----------|------------|
| `/api/admin/users/all` | GET/POST/PATCH/DELETE | `users` | `users` table |
| `/api/admin/system-settings` | GET/PATCH | `system_settings` | `users` table |
| `/api/admin/activity-logs` | GET | `activity_logs` | `users` table |
| `/api/admin/clinics` | GET/POST/PATCH/DELETE | `clinics` | `users` table |

### Clinic Management
| Endpoint | Method | Table(s) | Tenant Isolation |
|----------|--------|----------|------------------|
| `/api/clinic/[id]` | GET/PATCH | `clinics` | Via RLS |
| `/api/clinic/[id]/staff` | GET/POST | `clinic_staff` | Via RLS |
| `/api/clinic/[id]/analytics` | GET | Multiple | Via RLS |

### User Operations
| Endpoint | Method | Table(s) | Notes |
|----------|--------|----------|-------|
| `/api/auth/user` | GET/PATCH | `users` | Own profile only |
| `/api/users/profile` | GET/PATCH | `user_profiles` | Extended data |

---

## 📱 Dashboard & Page Mapping

### Role-Based Dashboards
| Dashboard | URL | Role | Primary Tables |
|-----------|-----|------|----------------|
| Super Admin Dashboard | `/admin` | `super_admin` | `users`, `clinics`, `system_settings` |
| Clinic Owner Dashboard | `/clinic/[id]` | `clinic_owner` | `clinics`, `staff`, `analytics` |
| Staff Dashboard | `/clinic/[id]/staff` | `staff` | `appointments`, `customers` |
| Customer Portal | `/dashboard` | `customer` | `profile`, `analyses`, `bookings` |

### Key Pages
| Page | Purpose | Data Source |
|------|---------|-------------|
| Skin Analysis | `/analysis` | `skin_analyses`, AI models |
| AR Simulator | `/ar-simulator` | 3D models, treatment data |
| Sales CRM | `/sales` | `sales_leads`, `chat_history` |
| Booking System | `/bookings` | `bookings`, `treatments` |

---

## 🏗️ Architecture Decisions

### Multi-Tenancy
- **Tenant Entity**: `clinics` table (NOT `tenants`)
- **Isolation Method**: Row Level Security via `clinic_id`
- **Helper Functions**: `is_super_admin()`, `get_user_clinic_id()`

### Authentication
- **Provider**: Supabase Auth
- **User Table**: `public.users` (canonical)
- **JWT Claims**: `role`, `clinic_id` embedded

### Data Flow
1. Client authenticates → receives JWT
2. JWT contains `role` and `clinic_id`
3. RLS policies use `auth.uid()` and claims
4. Multi-tenant queries filter by `clinic_id`

---

## 🚨 Known Gaps (Remaining 10%)

1. **Production Monitoring**
   - Error tracking setup needed
   - Performance monitoring configuration
   - Alert thresholds definition

2. **Documentation**
   - API documentation completion
   - User training materials
   - Deployment runbooks

3. **Testing Coverage**
   - E2E test suite completion
   - Load testing scenarios
   - Security audit

4. **Feature Polish**
   - Mobile responsive fine-tuning
   - Accessibility compliance
   - Performance optimization

---

## 📅 2-Week Development Roadmap

### Week 1: Production Readiness

#### Day 1: Critical Testing (Manual + Automated)
- [ ] Manual smoke test checklist (1 hour):
  - Login/logout for all roles
  - Verify data isolation between clinics
  - Test key features: analysis, booking, CRM
- [ ] RLS verification with `pnpm check:db`
- [ ] API testing for critical endpoints
- [ ] Performance spot-checks on heavy pages

#### Day 2-3: Production Deployment
- [ ] Environment configuration review
- [ ] Database backup strategy setup
- [ ] CI/CD pipeline finalization
- [ ] Staging environment deployment test

#### Day 5: Monitoring & Observability
- [ ] Implement error tracking (Sentry)
- [ ] Set up performance monitoring
- [ ] Configure alerts for critical metrics
- [ ] Create health check endpoints

### Week 2: Launch Preparation

#### Day 6-7: User Acceptance Testing
- [ ] UAT with clinic stakeholders
- [ ] Bug fixes from UAT feedback
- [ ] Performance optimization based on usage
- [ ] Data migration scripts (if needed)

#### Day 8-9: Documentation & Training
- [ ] Complete API documentation
- [ ] Create user manuals for each role
- [ ] Record training videos
- [ ] Prepare launch announcement

#### Day 10: Launch Day
- [ ] Final production deployment
- [ ] Go-live monitoring
- [ ] User support readiness
- [ ] Post-launch review meeting

---

## 🔧 Quick Reference

### Common Queries
```sql
-- Get user's clinic
SELECT get_user_clinic_id(auth.uid());

-- Check if super admin
SELECT is_super_admin();

-- Count users by clinic
SELECT clinic_id, COUNT(*) 
FROM users 
GROUP BY clinic_id;
```

### Environment Variables
```bash
# Required for all environments
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Production only
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

### Useful Scripts
```bash
# Database health check
pnpm check:db

# Type checking
pnpm type-check

# Build production
pnpm build

# Run tests
pnpm test
```

---

## 📞 Support & Contacts

- **Technical Lead**: [Name]
- **Database Administrator**: [Name]
- **DevOps Engineer**: [Name]
- **Product Owner**: [Name]

---

*Last Updated: December 2024*
*Version: 1.0*

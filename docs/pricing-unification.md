# Pricing Unification Documentation

## Overview
This document describes the implementation of unified pricing plans that separate B2C (individual customers) from B2B (clinics) plans, with the database as the single source of truth.

## Database Schema

### Table: `subscription_plans`
```sql
- id: UUID (Primary Key)
- name: TEXT (Plan display name)
- slug: TEXT UNIQUE (Plan identifier)
- plan_type: TEXT ('b2c' | 'b2b')
- billing_interval: TEXT ('monthly' | 'yearly')
- price_amount: DECIMAL
- currency: TEXT
- max_users: INTEGER
- max_storage_gb: INTEGER
- features: JSONB (Array of features)
- metadata: JSONB (Additional plan info)
  - max_customers_per_month: INTEGER
  - max_analyses_per_month: INTEGER
  - trial_days: INTEGER
  - name_th: TEXT (Thai name)
  - features_th: JSONB (Thai features array)
- display_order: INTEGER (UI sorting)
- is_active: BOOLEAN
```

## API Endpoints

### GET /api/pricing/plans
Fetch pricing plans from database.

Parameters:
- `type` (optional): 'b2c' or 'b2b' to filter by type

Response:
```json
{
  "plans": [
    {
      "id": "...",
      "name": "Premium",
      "slug": "premium",
      "plan_type": "b2c",
      "price_amount": 299,
      "currency": "THB",
      "features": ["AI Analysis", "AR Simulator", ...],
      "features_th": ["การวิเคราะห์ AI", "AR Simulator", ...],
      ...
    }
  ]
}
```

## Client Components

### Pricing Page (`/pricing`)
- Fetches B2C plans dynamically from API
- Supports both Thai and English languages
- Displays pricing tiers with features and limits

### Admin Subscription Management
- Fetches B2B plans for clinic subscriptions
- Allows updating clinic plans and status
- Validates plans against database

## Server Functions

### Pricing Service (`lib/subscriptions/pricing-service.ts`)
Server-side functions:
- `getPricingPlansByType(type)`: Get plans by type
- `getB2CPlans()`: Get all B2C plans
- `getB2BPlans()`: Get all B2B plans
- `canAccessPlanFeature(slug, feature)`: Check feature access
- `isWithinPlanLimits(plan, usage)`: Check usage limits

### Client Utilities (`lib/subscriptions/pricing-service-client.ts`)
Client-safe functions:
- `formatPrice(plan, locale)`: Format price for display
- Type definitions for `PricingPlanView`

## Migration Files

1. `202512240000_unify_pricing_plans.sql` - Main migration
2. `202512240001_fix_features_th_type.sql` - Fix type mismatch

## Testing

### API Testing
Run the test scripts:
```powershell
.\scripts\test-pricing-api.ps1
.\scripts\test-admin-subscriptions.ps1
```

### Manual Testing Checklist
- [ ] Pricing page loads and displays plans correctly
- [ ] Language switching works (TH/EN)
- [ ] Admin subscription management loads B2B plans
- [ ] Plan updates work in admin panel
- [ ] Feature access checks work correctly
- [ ] Usage limits are enforced

## Troubleshooting

### Common Issues

1. **Type mismatch error**: Run the fix migration `202512240001_fix_features_th_type.sql`
2. **API returns 500**: Check Supabase logs for SQL errors
3. **Plans not loading**: Verify RLS policies on `subscription_plans` table
4. **Admin panel empty**: Check user role must be 'super_admin'

### SQL Queries for Debugging

```sql
-- Check all plans
SELECT slug, name, plan_type, price_amount FROM subscription_plans ORDER BY plan_type, display_order;

-- Test function
SELECT * FROM get_plans_by_type('b2c');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'subscription_plans';
```

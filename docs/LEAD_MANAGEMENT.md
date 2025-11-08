# Lead Management & CRM Integration

Comprehensive lead capture, tracking, and conversion system with CRM integration support.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [API Reference](#api-reference)
5. [Components](#components)
6. [CRM Integration](#crm-integration)
7. [Lead Scoring](#lead-scoring)
8. [Usage Guide](#usage-guide)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Lead Management & CRM system enables sales staff to:
- **Capture leads** from skin analysis demos and walk-ins
- **Track lead status** through the sales pipeline (new → contacted → hot/warm/cold → converted/lost)
- **Record interactions** (calls, emails, meetings, demos)
- **Score leads** automatically based on engagement and potential
- **Convert leads** to customers with user account creation
- **Integrate with CRMs** (Salesforce, HubSpot, Pipedrive)
- **View leaderboards** and performance analytics

### Key Benefits

- 📊 **Data-Driven Sales**: Automated lead scoring prioritizes high-value prospects
- 🎯 **Pipeline Visibility**: Track every lead from capture to conversion
- 🤝 **Team Collaboration**: Shared lead history and interaction logs
- 🔗 **CRM Integration**: Sync with existing CRM platforms
- 📈 **Performance Tracking**: Leaderboards and conversion metrics

---

## Features

### 1. Lead Capture

**Form Fields:**
- Basic info: Full name, phone, email, Line ID
- Status: new | contacted | hot | warm | cold
- Source: walk_in | online | referral | event | social_media | other
- Interests: Multiple treatment selections
- Budget range: Predefined ranges in THB
- Notes: Free-text field for additional context

**Auto-Linking:**
- Automatically links to skin analysis if captured during demo
- Associates with sales staff who captured the lead
- Links to clinic and branch

### 2. Lead Status Tracking

**Status Flow:**
```
new → contacted → hot/warm/cold
                     ↓
              converted / lost
```

**Status Definitions:**
- **New**: Just captured, not yet contacted
- **Contacted**: Initial contact made
- **Hot**: High interest, ready to buy (score ≥ 80)
- **Warm**: Interested but needs nurturing (score 60-79)
- **Cold**: Low engagement (score < 60)
- **Converted**: Became a customer
- **Lost**: No longer pursuing

### 3. Interaction History

**Interaction Types:**
- `call`: Phone call
- `email`: Email communication
- `message`: Chat/Line message
- `meeting`: In-person meeting
- `demo`: Product/treatment demo
- `follow_up`: Follow-up contact
- `other`: Other interactions

**Tracked Data:**
- Date and time
- Interaction type
- Notes/summary
- Sales staff who performed interaction

### 4. Lead Scoring (0-100)

**Score Calculation:**

Base Score: **50**

**Contact Info Available:**
- Phone: +10
- Email: +10
- Line ID: +5

**Status Modifier:**
- Hot: +20
- Warm: +10
- Cold: -10

**Budget Range:**
- > ฿100,000: +15
- ฿50,000-100,000: +10
- ฿30,000-50,000: +5

**Interested Treatments:**
- +3 per treatment (max +15)

**Final Score:** Capped between 0-100

### 5. Lead Conversion

**Options:**
1. **Mark as Converted Only**: Changes status to "converted"
2. **Create User Account**: 
   - Creates Supabase auth user
   - Generates user profile
   - Links to lead record
   - Optionally sends welcome email

**Conversion Tracking:**
- `converted_to_customer`: Boolean flag
- `converted_user_id`: Reference to user account
- `converted_at`: Timestamp
- Interaction log entry for audit trail

### 6. Leaderboard

**Metrics Tracked:**
- Total leads captured
- Leads by status (new, hot, warm, cold, converted, lost)
- Conversion rate (converted / total)
- Average lead score
- Ranking by performance

**Time Periods:**
- Month (default)
- Quarter
- Year
- All time

**Ranking Algorithm:**
1. Sort by conversion rate (descending)
2. Then by total converted (descending)
3. Then by average lead score (descending)

---

## Architecture

### Database Schema

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  branch_id UUID REFERENCES branches(id),
  sales_staff_id UUID NOT NULL REFERENCES users(id),
  
  -- Lead info
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  line_id VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'new',
  source VARCHAR(50),
  
  -- Linked analysis
  analysis_id UUID REFERENCES skin_analyses(id),
  
  -- Follow-up
  follow_up_date DATE,
  last_contact_date DATE,
  next_action TEXT,
  
  -- Interests
  interested_treatments TEXT[],
  budget_range VARCHAR(50),
  
  -- Conversion
  converted_to_customer BOOLEAN DEFAULT false,
  converted_user_id UUID REFERENCES users(id),
  converted_at TIMESTAMPTZ,
  
  -- History
  notes TEXT,
  interaction_history JSONB DEFAULT '[]'::jsonb,
  
  -- Score
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_clinic ON leads(clinic_id);
CREATE INDEX idx_leads_sales_staff ON leads(sales_staff_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_follow_up ON leads(follow_up_date) WHERE follow_up_date IS NOT NULL;
CREATE INDEX idx_leads_hot ON leads(clinic_id, status, lead_score DESC) WHERE status IN ('hot', 'warm');
```

### File Structure

```
app/
├── api/
│   └── leads/
│       ├── route.ts                    # GET (list), POST (create)
│       ├── [id]/
│       │   ├── route.ts                # GET, PATCH, DELETE
│       │   └── convert/
│       │       └── route.ts            # POST (convert to customer)
│       └── leaderboard/
│           └── route.ts                # GET (sales performance)
│
├── [locale]/
│   └── sales/
│       └── leads/
│           ├── page.tsx                # Lead list view
│           └── [id]/
│               └── page.tsx            # Lead detail view
│
components/
└── leads/
    └── lead-capture-form.tsx           # Lead capture modal
│
lib/
└── crm/
    └── webhook.ts                      # CRM integration utilities
│
types/
└── multi-tenant.ts                     # Lead types
```

---

## API Reference

### POST /api/leads

Create a new lead.

**Request Body:**
```typescript
{
  full_name: string           // Required
  phone?: string
  email?: string
  line_id?: string
  status?: LeadStatus         // Default: 'new'
  source?: LeadSource
  analysis_id?: string        // Link to analysis
  interested_treatments?: string[]
  budget_range?: string
  notes?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: Lead,
  message: "Lead created successfully"
}
```

**Permissions:**
- Requires authentication
- Sales staff role only

**Auto-Calculated:**
- `lead_score`: Based on scoring algorithm
- `last_contact_date`: Set to today
- `interaction_history`: Initial entry created
- `clinic_id`: From sales staff profile
- `branch_id`: From sales staff profile

---

### GET /api/leads

List leads with filtering and pagination.

**Query Parameters:**
```
status?: LeadStatus          # Filter by status
source?: LeadSource          # Filter by source
sales_staff_id?: string      # Filter by sales staff (admins only)
search?: string              # Search name, phone, email
page?: number                # Page number (default: 1)
limit?: number               # Items per page (default: 20)
```

**Response:**
```typescript
{
  success: true,
  data: Lead[],
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}
```

**Permissions:**
- Sales staff see only their own leads
- Clinic admins see all leads in their clinic
- Super admins see all leads

**Ordering:**
1. Status priority (hot > warm > contacted > new > cold > lost)
2. Follow-up date (soonest first)
3. Created date (newest first)

---

### GET /api/leads/[id]

Get lead details with relations.

**Response:**
```typescript
{
  success: true,
  data: Lead & {
    clinic: { id, name, logo_url, contact_phone, contact_email }
    branch: { id, name, address }
    sales_staff: { id, full_name, email }
    analysis: { id, overall_score, image_url, ai_concerns, created_at }
  }
}
```

**Permissions:**
- Owner sales staff
- Clinic admin
- Super admin

---

### PATCH /api/leads/[id]

Update lead details.

**Request Body:**
```typescript
{
  full_name?: string
  phone?: string
  email?: string
  line_id?: string
  status?: LeadStatus
  follow_up_date?: string     # ISO date
  next_action?: string
  interested_treatments?: string[]
  budget_range?: string
  notes?: string
  lead_score?: number         # 0-100
  add_interaction?: {
    type: 'call' | 'email' | 'message' | 'meeting' | 'demo' | 'follow_up' | 'other'
    notes: string
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: Lead,
  message: "Lead updated successfully"
}
```

**Permissions:**
- Owner sales staff
- Clinic admin
- Super admin

**Auto-Updated:**
- `updated_at`: Current timestamp
- `last_contact_date`: If status changed
- `interaction_history`: If `add_interaction` provided

---

### DELETE /api/leads/[id]

Delete a lead (hard delete).

**Response:**
```typescript
{
  success: true,
  message: "Lead deleted successfully"
}
```

**Permissions:**
- Clinic admin
- Super admin

**Note:** Regular sales staff cannot delete leads.

---

### POST /api/leads/[id]/convert

Convert lead to customer.

**Request Body:**
```typescript
{
  create_user_account?: boolean      # Default: false
  password?: string                  # Required if create_user_account = true
  send_welcome_email?: boolean       # Default: false
}
```

**Response:**
```typescript
{
  success: true,
  data: Lead,
  message: "Lead converted successfully",
  customer_id: string | null         # If user account created
}
```

**Permissions:**
- Owner sales staff
- Clinic admin
- Super admin

**Actions Performed:**
1. Update lead status to "converted"
2. Set `converted_to_customer = true`
3. Set `converted_at = now()`
4. Add conversion interaction to history
5. If `create_user_account`:
   - Create Supabase auth user
   - Create user profile in `users` table
   - Link to lead via `converted_user_id`
6. If `send_welcome_email`:
   - Send welcome email (TODO: implement)

**Validation:**
- Cannot convert already converted lead
- Email required if creating user account
- Password required if creating user account

---

### GET /api/leads/leaderboard

Get sales staff performance leaderboard.

**Query Parameters:**
```
clinic_id?: string           # Filter by clinic (super admin only)
period?: 'month' | 'quarter' | 'year' | 'all'  # Default: 'month'
limit?: number               # Top N staff (default: 10)
```

**Response:**
```typescript
{
  success: true,
  data: {
    leaderboard: LeaderboardEntry[],
    summary: {
      period: string
      total_leads: number
      total_converted: number
      overall_conversion_rate: number
      avg_lead_score: number
    }
  }
}
```

**LeaderboardEntry:**
```typescript
{
  rank: number
  sales_staff_id: string
  sales_staff_name: string
  sales_staff_email: string
  total_leads: number
  new_leads: number
  contacted_leads: number
  hot_leads: number
  warm_leads: number
  cold_leads: number
  converted_leads: number
  lost_leads: number
  conversion_rate: number      # Percentage
  avg_lead_score: number
}
```

**Permissions:**
- Clinic admin
- Super admin

**Ranking Logic:**
1. Conversion rate (descending)
2. Total converted (descending)
3. Average lead score (descending)

---

## Components

### LeadCaptureForm

Modal form for creating new leads.

**Props:**
```typescript
{
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisId?: string           # Pre-link to analysis
  defaultValues?: Partial<LeadFormValues>
  onSuccess?: (leadId: string) => void
}
```

**Features:**
- Validates email format
- Multi-select treatment checkboxes
- Budget range dropdown
- Status and source dropdowns
- Real-time validation with Zod
- Auto-links to analysis if provided
- Navigates to lead list on success (unless onSuccess provided)

**Usage:**
```tsx
import { LeadCaptureForm } from "@/components/leads/lead-capture-form"

function MyComponent() {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Capture Lead
      </Button>
      
      <LeadCaptureForm
        open={open}
        onOpenChange={setOpen}
        analysisId={analysisId}  // Optional
        onSuccess={(leadId) => {
          console.log('Lead created:', leadId)
          // Custom success handling
        }}
      />
    </>
  )
}
```

---

### LeadsList Page

`/sales/leads`

**Features:**
- Search by name, phone, or email (debounced 500ms)
- Filter by status dropdown
- Filter by source dropdown
- Summary statistics cards:
  - Total leads
  - Hot leads count
  - Converted leads count
  - Average lead score
- Sortable table with:
  - Name, contact info
  - Status badge (color-coded)
  - Lead score with trending icon
  - Follow-up date
  - Interested treatments count
  - Sales staff name
  - Created date
- Actions dropdown:
  - View details
  - Edit lead
  - Convert to customer
- Pagination (20 per page)
- Capture new lead button

**Permissions:**
- Sales staff: See only own leads
- Clinic admin: See all clinic leads
- Super admin: See all leads

---

### Lead Detail Page

`/sales/leads/[id]`

**Features:**

**Left Column:**
1. **Lead Information Card**
   - Status badge
   - Lead score
   - Contact info (phone, email)
   - Interested treatments (badges)
   - Budget range

2. **Interaction History Card**
   - Chronological list of interactions
   - Interaction type icons
   - Date/time stamps
   - Notes/summary

**Right Column:**
1. **Update Form Card**
   - Status dropdown
   - Follow-up date picker
   - Next action input
   - Notes textarea
   - Update button

2. **Details Card**
   - Clinic name
   - Sales staff name
   - Created date
   - Link to analysis (if exists)

**Action Buttons:**
- Add Interaction (modal)
- Convert to Customer (modal)

**Permissions:**
- Owner sales staff: Full access
- Clinic admin: Full access
- Super admin: Full access

---

## CRM Integration

### Overview

Send lead data to external CRM systems via webhooks.

### Supported CRMs

1. **Salesforce** - Enterprise CRM
2. **HubSpot** - Marketing & Sales platform
3. **Pipedrive** - Sales pipeline CRM
4. **Custom Webhook** - Any HTTP endpoint

### Webhook Configuration

```typescript
import { sendCRMWebhook, WebhookConfig, WebhookPayload } from "@/lib/crm/webhook"

const config: WebhookConfig = {
  url: 'https://your-crm.com/api/leads',
  method: 'POST',
  headers: {
    'X-Custom-Header': 'value',
  },
  auth: {
    type: 'bearer',
    token: 'your-api-token',
  },
  retry: {
    max_attempts: 3,
    backoff_ms: 1000,  // Exponential backoff
  },
}
```

### Authentication Types

**1. Bearer Token:**
```typescript
auth: {
  type: 'bearer',
  token: 'your-access-token',
}
```

**2. Basic Auth:**
```typescript
auth: {
  type: 'basic',
  username: 'your-username',
  password: 'your-password',
}
```

**3. API Key:**
```typescript
auth: {
  type: 'api_key',
  api_key_header: 'X-API-Key',
  api_key_value: 'your-api-key',
}
```

### Webhook Payload

```typescript
interface WebhookPayload {
  lead: {
    id: string
    full_name: string
    phone?: string
    email?: string
    line_id?: string
    status: string
    source?: string
    lead_score: number
    interested_treatments?: string[]
    budget_range?: string
    notes?: string
    created_at: string
    updated_at: string
  }
  clinic: {
    id: string
    name: string
    contact_phone?: string
    contact_email?: string
  }
  sales_staff: {
    id: string
    full_name: string
    email: string
  }
  analysis?: {
    id: string
    overall_score: number
    created_at: string
  }
  event_type: 'lead_created' | 'lead_updated' | 'lead_converted' | 'lead_lost'
  timestamp: string
}
```

### Example: Salesforce Integration

```typescript
import { sendToSalesforce } from "@/lib/crm/webhook"

const result = await sendToSalesforce(
  payload,
  'https://yourinstance.salesforce.com',
  'your-access-token'
)

if (result.success) {
  console.log('Lead synced to Salesforce')
} else {
  console.error('Sync failed:', result.error)
}
```

**Salesforce Field Mapping:**
```typescript
{
  FirstName: "John",
  LastName: "Doe",
  Email: "john@example.com",
  Phone: "+66 8X XXX XXXX",
  Company: "Clinic Name",
  Status: "Open - Not Contacted",
  LeadSource: "walk_in",
  Rating: "Hot",
  Description: "Notes...",
  // Custom fields
  Budget__c: "฿30,000 - ฿50,000",
  Interested_Treatments__c: "Acne Treatment; Anti-Aging",
  Lead_Score__c: 85,
  Line_ID__c: "@lineid",
  External_ID__c: "uuid",
}
```

### Example: HubSpot Integration

```typescript
import { sendToHubSpot } from "@/lib/crm/webhook"

const result = await sendToHubSpot(payload, 'your-api-key')

if (result.success) {
  console.log('Contact created in HubSpot')
}
```

**HubSpot Property Mapping:**
```typescript
{
  properties: {
    email: "john@example.com",
    firstname: "John",
    lastname: "Doe",
    phone: "+66 8X XXX XXXX",
    company: "Clinic Name",
    lifecyclestage: "salesqualifiedlead",
    hs_lead_status: "hot",
    lead_source: "WALK_IN",
    // Custom properties
    budget_range: "฿30,000 - ฿50,000",
    interested_treatments: "Acne Treatment, Anti-Aging",
    lead_score: 85,
    line_id: "@lineid",
    external_id: "uuid",
    notes: "Notes...",
  }
}
```

### Example: Pipedrive Integration

```typescript
import { sendToPipedrive } from "@/lib/crm/webhook"

const result = await sendToPipedrive(payload, 'your-api-token')

if (result.success) {
  console.log('Deal created in Pipedrive')
}
```

**Pipedrive Deal Structure:**
```typescript
{
  title: "John Doe - Clinic Name",
  person_name: "John Doe",
  org_name: "Clinic Name",
  value: 40000,  // Parsed from budget range
  currency: "THB",
  status: "open",
  email: [{ value: "john@example.com", primary: true }],
  phone: [{ value: "+66 8X XXX XXXX", primary: true }],
  // Custom fields (use your actual field IDs)
  '12345': "hot",              // Lead Status
  '12346': "walk_in",          // Lead Source
  '12347': 85,                 // Lead Score
  '12348': "Acne, Anti-Aging", // Treatments
  '12349': "@lineid",          // Line ID
}
```

### Custom Webhook Integration

```typescript
import { sendCRMWebhook } from "@/lib/crm/webhook"

const config: WebhookConfig = {
  url: 'https://your-system.com/webhooks/leads',
  method: 'POST',
  headers: {
    'X-Webhook-Secret': 'your-secret',
  },
  retry: {
    max_attempts: 5,
    backoff_ms: 2000,
  },
}

const result = await sendCRMWebhook(payload, config)
```

### Retry Logic

- **Exponential Backoff**: `backoff_ms * 2^(attempt - 1)`
- **Max Attempts**: Configurable (default: 3)
- **Retry Conditions**:
  - Network errors: ✅ Retry
  - 5xx server errors: ✅ Retry
  - 4xx client errors: ❌ No retry (bad request)
  - 2xx success: ✅ Stop, return success

### Error Handling

```typescript
const result = await sendCRMWebhook(payload, config)

if (result.success) {
  console.log('Webhook sent successfully')
  console.log('Response:', result.response)
  console.log('Attempts:', result.attempts)
} else {
  console.error('Webhook failed after', result.attempts, 'attempts')
  console.error('Error:', result.error)
  // Implement fallback logic (e.g., queue for retry, alert admin)
}
```

### When to Send Webhooks

**Recommended Events:**
1. **lead_created** - Immediately after lead creation
2. **lead_updated** - When status changes to hot/warm/cold
3. **lead_converted** - When lead converts to customer
4. **lead_lost** - When lead status changes to lost

**Implementation Example:**
```typescript
// In POST /api/leads (after lead creation)
const webhookPayload: WebhookPayload = {
  lead: newLead,
  clinic: leadClinic,
  sales_staff: leadSalesStaff,
  analysis: leadAnalysis,
  event_type: 'lead_created',
  timestamp: new Date().toISOString(),
}

// Send to CRM (non-blocking)
sendCRMWebhook(webhookPayload, crmConfig).catch(error => {
  console.error('[Webhook] Failed to send to CRM:', error)
  // Queue for retry or log to monitoring system
})
```

---

## Lead Scoring

### Scoring Algorithm

```typescript
function calculateLeadScore(lead: Lead): number {
  let score = 50  // Base score
  
  // Contact info
  if (lead.phone) score += 10
  if (lead.email) score += 10
  if (lead.line_id) score += 5
  
  // Status
  switch (lead.status) {
    case 'hot':
      score += 20
      break
    case 'warm':
      score += 10
      break
    case 'cold':
      score -= 10
      break
  }
  
  // Budget range
  if (lead.budget_range) {
    if (lead.budget_range.includes('> ฿100,000')) score += 15
    else if (lead.budget_range.includes('฿50,000')) score += 10
    else if (lead.budget_range.includes('฿30,000')) score += 5
  }
  
  // Interested treatments
  const treatmentCount = lead.interested_treatments?.length || 0
  score += Math.min(treatmentCount * 3, 15)
  
  // Cap between 0-100
  return Math.max(0, Math.min(100, score))
}
```

### Score Ranges

| Score | Rating | Priority | Recommended Action |
|-------|--------|----------|-------------------|
| 80-100 | 🔥 Hot | High | Immediate follow-up, schedule demo |
| 60-79 | 🟠 Warm | Medium | Follow-up within 1-2 days |
| 40-59 | 🟡 Neutral | Medium | Follow-up within 3-5 days |
| 20-39 | 🔵 Cool | Low | Nurture campaign, follow-up weekly |
| 0-19 | ❄️ Cold | Low | Long-term nurture, monthly check-in |

### Auto-Scoring Triggers

Scores are automatically recalculated when:
1. Lead is created
2. Contact info is updated
3. Status changes
4. Interested treatments modified
5. Budget range updated

### Manual Score Adjustment

Admins can manually adjust scores:
```typescript
// PATCH /api/leads/[id]
{
  lead_score: 95  // Manual override
}
```

---

## Usage Guide

### For Sales Staff

**1. Capturing a Lead**
```
1. After skin analysis demo, click "Capture New Lead"
2. Fill in customer information
3. Select interested treatments
4. Choose initial status (usually "new" or "contacted")
5. Add notes about customer needs
6. Click "Create Lead"
```

**2. Following Up**
```
1. Go to Leads page
2. Filter by "Follow-up Date" or status "Hot"
3. Click on lead name
4. Update status based on conversation
5. Add interaction (call, email, meeting)
6. Set next follow-up date
7. Update notes
```

**3. Converting a Lead**
```
1. Open lead detail page
2. Click "Convert to Customer"
3. Choose whether to create user account
4. If yes, set temporary password
5. Click "Convert Lead"
6. Lead status changes to "Converted"
```

### For Clinic Admins

**1. Viewing Team Performance**
```
1. Go to Leaderboard
2. Select time period (month/quarter/year)
3. View conversion rates and lead counts
4. Export report (TODO: implement)
```

**2. Managing All Leads**
```
1. Go to Leads page
2. Use "Sales Staff" filter to view specific team member
3. Review hot leads that need attention
4. Reassign leads if needed (TODO: implement)
```

**3. CRM Integration**
```
1. Configure webhook in clinic settings
2. Set API credentials for CRM platform
3. Enable auto-sync for lead events
4. Test webhook connection
5. Monitor sync logs
```

### For Developers

**1. Adding New CRM Integration**
```typescript
// lib/crm/webhook.ts

export function transformToYourCRM(payload: WebhookPayload) {
  return {
    // Map fields to your CRM's format
    name: payload.lead.full_name,
    email: payload.lead.email,
    // ... more fields
  }
}

export async function sendToYourCRM(
  payload: WebhookPayload,
  apiKey: string
): Promise<WebhookResponse> {
  const config: WebhookConfig = {
    url: 'https://your-crm.com/api/leads',
    method: 'POST',
    auth: {
      type: 'api_key',
      api_key_header: 'Authorization',
      api_key_value: `Bearer ${apiKey}`,
    },
  }

  const transformedPayload = transformToYourCRM(payload)
  
  return sendCRMWebhook(
    { ...payload, ...transformedPayload } as any,
    config
  )
}
```

**2. Customizing Lead Scoring**
```typescript
// Modify in: app/api/leads/route.ts (POST handler)

let leadScore = 50  // Base score

// Add custom scoring logic
if (customCondition) leadScore += 10

// Example: Bonus for referrals
if (source === 'referral') leadScore += 15

// Example: Bonus for analysis with high concerns
if (analysis && analysis.ai_concerns.length > 5) leadScore += 10
```

**3. Adding Custom Lead Fields**
```sql
-- Add column to leads table
ALTER TABLE leads ADD COLUMN custom_field VARCHAR(255);

-- Update TypeScript types
// types/multi-tenant.ts
export interface Lead {
  // ... existing fields
  custom_field?: string;
}
```

---

## Testing

### Manual Testing Checklist

**Lead Capture:**
- [ ] Create lead with all fields
- [ ] Create lead with minimal fields (name only)
- [ ] Create lead linked to analysis
- [ ] Verify auto-calculated lead score
- [ ] Verify auto-linking to clinic/branch/sales staff

**Lead Management:**
- [ ] Search leads by name
- [ ] Search leads by phone
- [ ] Search leads by email
- [ ] Filter by status
- [ ] Filter by source
- [ ] View lead details
- [ ] Update lead status
- [ ] Set follow-up date
- [ ] Add interaction (all types)
- [ ] Update notes

**Lead Conversion:**
- [ ] Convert without user account
- [ ] Convert with user account creation
- [ ] Verify user can login
- [ ] Verify lead status changed to "converted"
- [ ] Verify converted_at timestamp
- [ ] Verify interaction history entry

**Leaderboard:**
- [ ] View leaderboard as clinic admin
- [ ] Filter by month
- [ ] Filter by quarter
- [ ] Filter by year
- [ ] Verify ranking calculation
- [ ] Verify conversion rate calculation
- [ ] Verify summary statistics

**Permissions:**
- [ ] Sales staff can only see own leads
- [ ] Clinic admin can see all clinic leads
- [ ] Super admin can see all leads
- [ ] Sales staff cannot delete leads
- [ ] Admin can delete leads

**CRM Webhooks:**
- [ ] Send to Salesforce (if configured)
- [ ] Send to HubSpot (if configured)
- [ ] Send to Pipedrive (if configured)
- [ ] Send to custom webhook
- [ ] Verify retry on failure
- [ ] Verify no retry on 4xx errors

### API Testing with cURL

**Create Lead:**
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "full_name": "John Doe",
    "phone": "+66 8X XXX XXXX",
    "email": "john@example.com",
    "status": "new",
    "source": "walk_in",
    "interested_treatments": ["Acne Treatment", "Anti-Aging"],
    "budget_range": "฿30,000 - ฿50,000",
    "notes": "Interested in acne treatment"
  }'
```

**List Leads:**
```bash
curl -X GET "http://localhost:3000/api/leads?status=hot&page=1&limit=20" \
  -H "Cookie: your-session-cookie"
```

**Update Lead:**
```bash
curl -X PATCH http://localhost:3000/api/leads/LEAD_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "status": "hot",
    "follow_up_date": "2025-11-15",
    "add_interaction": {
      "type": "call",
      "notes": "Called to schedule appointment"
    }
  }'
```

**Convert Lead:**
```bash
curl -X POST http://localhost:3000/api/leads/LEAD_ID/convert \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "create_user_account": true,
    "password": "TempPassword123!",
    "send_welcome_email": false
  }'
```

**Get Leaderboard:**
```bash
curl -X GET "http://localhost:3000/api/leads/leaderboard?period=month&limit=10" \
  -H "Cookie: your-session-cookie"
```

---

## Troubleshooting

### Issue: Lead not created

**Symptoms:**
- API returns 403 Forbidden
- "Sales staff profile not found" error

**Solutions:**
1. Verify user has `sales_staff` entry in database
2. Check that `sales_staff.user_id` matches auth user
3. Ensure user is authenticated (valid session)

---

### Issue: Cannot see leads

**Symptoms:**
- Leads list is empty
- 403 Forbidden on GET /api/leads

**Solutions:**
1. **Sales staff**: Can only see own leads
   - Check `sales_staff_id` filter is applied correctly
2. **Clinic admin**: Can see all clinic leads
   - Verify `role = 'clinic_admin'` in `sales_staff` table
3. **Check clinic_id**: Leads must match user's clinic

---

### Issue: Lead score not updating

**Symptoms:**
- Score stays at 50 after updates
- Score doesn't reflect changes

**Solutions:**
1. Score is calculated on **create** only by default
2. To recalculate: Send PATCH with `lead_score` explicitly
3. Or implement auto-recalc on update:
   ```typescript
   // In PATCH /api/leads/[id]
   const updatedScore = calculateLeadScore(updatedLead)
   updates.lead_score = updatedScore
   ```

---

### Issue: Webhook failing

**Symptoms:**
- `result.success = false`
- Error: "HTTP 401: Unauthorized"

**Solutions:**
1. **Check auth token**: Verify API key/token is valid
2. **Check URL**: Ensure endpoint is correct
3. **Check headers**: Some CRMs require specific headers
4. **Check payload**: Verify CRM expects this format
5. **Test with Postman**: Isolate issue from code

---

### Issue: Interaction history not saving

**Symptoms:**
- Interactions not appearing in history
- Empty interaction array

**Solutions:**
1. Verify `add_interaction` is in PATCH request body
2. Check JSONB format:
   ```typescript
   interaction_history: [
     ...existingHistory,
     newInteraction
   ]
   ```
3. Ensure `interaction_history` column is JSONB (not TEXT)

---

### Issue: Lead conversion fails

**Symptoms:**
- Error: "Email is required to create user account"
- User account not created

**Solutions:**
1. Ensure lead has email address
2. Verify email format is valid
3. Check password meets requirements (min 6 chars)
4. Verify Supabase auth is configured correctly

---

### Issue: Leaderboard showing zero

**Symptoms:**
- All metrics are 0
- No staff appear

**Solutions:**
1. Check date filter: Leads might be outside period
2. Verify `clinic_id` filter matches user's clinic
3. Check if any leads exist in database
4. Ensure `sales_staff` has relation to `users` table

---

## Best Practices

### Data Quality

1. **Always capture phone OR email** - At least one contact method
2. **Add interaction notes** - Document every touchpoint
3. **Set follow-up dates** - Don't let hot leads go cold
4. **Update status regularly** - Keep pipeline current
5. **Convert leads promptly** - Update when customer signs up

### Performance

1. **Use pagination** - Don't load all leads at once
2. **Index properly** - Ensure DB indexes on clinic_id, sales_staff_id, status
3. **Cache leaderboard** - Recalculate periodically, not on every request
4. **Async webhooks** - Don't block lead creation on CRM sync

### Security

1. **Validate permissions** - Always check user role
2. **Sanitize inputs** - Prevent SQL injection
3. **Rate limit API** - Prevent abuse
4. **Encrypt sensitive data** - PII should be encrypted at rest

### User Experience

1. **Pre-fill from analysis** - Auto-populate name if captured during demo
2. **Smart defaults** - Status = "new", Source = last used
3. **Mobile-friendly** - Forms work on tablets during demos
4. **Offline support** - Queue leads if network fails (PWA)

---

## Future Enhancements

### Planned Features

1. **Email Automation**
   - Auto-send follow-up emails
   - Template library
   - Schedule campaigns

2. **SMS Integration**
   - Send appointment reminders
   - Status updates via SMS

3. **Lead Assignment**
   - Auto-assign by territory
   - Round-robin distribution
   - Workload balancing

4. **Advanced Analytics**
   - Conversion funnel visualization
   - Time-to-convert metrics
   - Revenue attribution

5. **AI Lead Scoring**
   - ML-based scoring model
   - Predict conversion probability
   - Recommend next best action

6. **Calendar Integration**
   - Sync follow-ups to Google Calendar
   - Appointment booking

7. **Mobile App**
   - Native iOS/Android apps
   - Push notifications for hot leads
   - Offline-first architecture

8. **Bulk Operations**
   - Import leads from CSV
   - Export to Excel
   - Bulk status updates

---

## Support

For issues or questions:
- 📧 Email: support@ai367bar.com
- 💬 Slack: #lead-management
- 📚 Docs: https://docs.ai367bar.com/leads

---

**Last Updated:** November 8, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

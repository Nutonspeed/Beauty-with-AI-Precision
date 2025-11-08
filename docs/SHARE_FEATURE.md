# Save & Share Feature Documentation

## Overview

The **Save & Share** feature enables sales staff to generate secure, shareable links for skin analysis reports with clinic branding. Recipients can view beautifully formatted reports without requiring authentication, with configurable expiry dates and comprehensive view tracking.

## Architecture

### 5-Layer Design

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: UI Components                                       │
│ - ShareDialog: Generate and manage share links              │
│ - ShareReportView: Public-facing branded report display     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: API Routes (REST)                                   │
│ - POST /api/analysis/share: Create share link               │
│ - GET  /api/analysis/share: Retrieve share info             │
│ - DELETE /api/analysis/share: Revoke share link             │
│ - GET  /api/analysis/share/stats: View statistics           │
│ - POST /api/share/[token]/view: Track view                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Utility Functions                                   │
│ - Token generation (crypto-secure 32 chars)                 │
│ - Expiry calculation (7/30/90 days or null)                 │
│ - URL generation (/share/[token])                           │
│ - Email/SMS/Line templates (multi-channel)                  │
│ - View tracking metadata extraction                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Database (Supabase)                                 │
│ - skin_analyses: is_shared, share_token, share_expires_at   │
│ - share_views: viewed_at, ip_address, user_agent, referrer  │
│ - RLS policies: Public access when shared and not expired   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Integration (Optional)                              │
│ - Email: Resend/SendGrid for HTML emails                    │
│ - SMS: Twilio for Thailand (+66) numbers                    │
│ - Line: Line Messaging API for Flex Messages                │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 🔐 Security First

- **Crypto-Secure Tokens**: Generated using Node.js `crypto.randomBytes(24)` with base64url encoding
- **32 Character Format**: Pattern `/^[A-Za-z0-9_-]{32}$/` (example: `a7B9cD2eF4gH6iJ8kL0mN1oP3qR5sT7u`)
- **Unique Constraint**: Database ensures no duplicate tokens
- **Configurable Expiry**: 7/30/90 days or never expires
- **Permission Checks**: Only owner, sales_staff, or admins can share
- **RLS Policies**: Public access only when `is_shared=true AND expires_at>now`

### 🎨 Clinic Branding

- **Custom Logo**: Display clinic logo in header and emails
- **Brand Colors**: Gradient headers using `clinic.brand_color`
- **Clinic Info**: Name, contact phone, email, address
- **Personalization**: Sales staff name, custom messages

### 📊 Analytics & Tracking

- **View Tracking**: Record every view with timestamp
- **IP Uniqueness**: Count unique visitors
- **User Agent**: Device and browser detection
- **Referrer**: Track traffic sources
- **Statistics**: Total views, unique IPs, last viewed, expiry countdown

### 📱 Multi-Channel Sharing

#### Email (HTML + Plain Text)
- Gradient header with clinic branding
- Responsive table layout (600px width)
- Primary action button
- Features section: 🔬 AI Analysis, 💡 Recommendations, 🔒 Secure & Private
- Expiry notice
- Clinic footer

#### SMS (160 Characters)
```
[Greeting][ClinicName]: รายงานการวิเคราะห์ผิวหน้าของคุณพร้อมแล้ว [ShareURL]
```
Single SMS for Thailand market (GSM-7 encoding)

#### Line Flex Message
```json
{
  "type": "bubble",
  "hero": { "type": "image", "url": "[ClinicLogo]" },
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      { "type": "text", "text": "[ClinicName]", "weight": "bold" },
      { "type": "text", "text": "Expires: [Date]", "size": "sm" }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "button",
        "action": { "type": "uri", "label": "ดูรายงาน", "uri": "[ShareURL]" }
      }
    ]
  }
}
```

## Components

### ShareDialog Component

**Location**: `components/analysis/share-dialog.tsx`

**Props**:
```typescript
interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisId: string
  clinicName: string
  clinicLogoUrl?: string
  onShareCreated?: (shareUrl: string) => void
}
```

**Features**:
- Expiry dropdown (7/30/90 days/never)
- Generate share link button
- Copy link to clipboard
- QR code display (250x250px)
- Share via Line (opens Line app)
- Email form (recipient email, name, message)
- Loading states and error handling

**Usage**:
```tsx
import { ShareDialog } from "@/components/analysis/share-dialog"

function AnalysisDetail() {
  const [showShare, setShowShare] = useState(false)
  
  return (
    <>
      <Button onClick={() => setShowShare(true)}>
        Share Report
      </Button>
      
      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        analysisId={analysis.id}
        clinicName={clinic.name}
        clinicLogoUrl={clinic.logo_url}
        onShareCreated={(url) => console.log('Shared:', url)}
      />
    </>
  )
}
```

### ShareReportView Component

**Location**: `components/share/share-report-view.tsx`

**Props**:
```typescript
interface ShareReportViewProps {
  analysis: any  // Full analysis with clinic and sales_staff relations
  clinic: any    // Clinic info (name, logo, brand_color, contact)
  salesStaff: any  // Sales staff info (full_name, email)
  remainingDays: number | null  // Days until expiry
}
```

**Features**:
- Gradient header with clinic branding
- Overall skin health score (circular gauge)
- AI analysis heatmap display
- Detected skin conditions list
- Personalized recommendations
- Privacy notice
- Clinic contact information
- Responsive design (mobile-friendly)

## API Routes

### POST /api/analysis/share

Create a new share link for an analysis.

**Request**:
```typescript
{
  analysis_id: string,
  expiry_days?: 7 | 30 | 90 | null,  // Default: 7
  include_recommendations?: boolean,  // Default: true
  include_patient_info?: boolean      // Default: false
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    share_token: string,  // 32-char token
    share_url: string,    // Full URL to share page
    expires_at: string | null,  // ISO timestamp or null
    analysis_id: string
  }
}
```

**Security**:
- ✅ Authentication required (401 if no session)
- ✅ Permission check (403 if not owner/sales_staff/admin)
- ✅ Existence check (404 if analysis not found)

**Example**:
```typescript
const response = await fetch('/api/analysis/share', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    analysis_id: 'uuid-here',
    expiry_days: 7,
  }),
})

const { data } = await response.json()
console.log('Share URL:', data.share_url)
```

### GET /api/analysis/share?analysis_id=xxx

Retrieve existing share info for an analysis.

**Query Params**:
- `analysis_id` (required): Analysis UUID

**Response**:
```typescript
{
  success: true,
  data: {
    is_shared: boolean,
    share_token: string | null,
    share_url: string | null,
    expires_at: string | null
  }
}
```

**Example**:
```typescript
const response = await fetch(`/api/analysis/share?analysis_id=${id}`)
const { data } = await response.json()

if (data.is_shared) {
  console.log('Already shared:', data.share_url)
}
```

### DELETE /api/analysis/share

Revoke a share link (make it invalid).

**Request**:
```typescript
{
  analysis_id: string
}
```

**Response**:
```typescript
{
  success: true,
  message: "Share link revoked successfully"
}
```

**Example**:
```typescript
await fetch('/api/analysis/share', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ analysis_id: 'uuid-here' }),
})
```

### GET /api/analysis/share/stats?analysis_id=xxx

Get share statistics (views, unique IPs, etc.).

**Query Params**:
- `analysis_id` (required): Analysis UUID

**Response**:
```typescript
{
  success: true,
  data: {
    is_shared: boolean,
    share_token: string,
    total_views: number,
    unique_ips: number,
    last_viewed_at: string | null,
    is_expired: boolean,
    days_remaining: number | null,
    views: Array<{
      viewed_at: string,
      ip_address: string,
      user_agent: string,
      referrer: string
    }>  // Last 10 views
  }
}
```

**Example**:
```typescript
const response = await fetch(`/api/analysis/share/stats?analysis_id=${id}`)
const { data } = await response.json()

console.log(`${data.total_views} views from ${data.unique_ips} unique IPs`)
```

### POST /api/share/[token]/view

Track a view for a shared report (public endpoint, no auth required).

**Request**: Empty body

**Response**:
```typescript
{
  success: true,
  message: "View tracked successfully",
  tracked: boolean  // False if share_views table doesn't exist yet
}
```

**Automatic Tracking**: Called automatically when public share page loads.

## Utility Functions

### Token Generation

**Location**: `lib/utils/report-sharing.ts`

```typescript
import { generateShareToken, isValidShareToken } from '@/lib/utils/report-sharing'

// Generate new token
const token = generateShareToken()
// Output: "a7B9cD2eF4gH6iJ8kL0mN1oP3qR5sT7u" (32 chars)

// Validate token format
const isValid = isValidShareToken(token)
// Output: true
```

**Implementation**:
```typescript
export function generateShareToken(): string {
  const randomBytes = crypto.randomBytes(24) // 24 bytes → 32 chars base64url
  return randomBytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
```

### Expiry Calculation

```typescript
import { 
  calculateExpiryDate, 
  isShareExpired, 
  getRemainingDays 
} from '@/lib/utils/report-sharing'

// Calculate expiry date
const expiresAt = calculateExpiryDate(7)  // 7 days from now
// Output: Date object

// Check if expired
const expired = isShareExpired(expiresAt)
// Output: false (if within 7 days)

// Get remaining days
const remaining = getRemainingDays(expiresAt)
// Output: 7 (rounded up)
```

### URL Generation

```typescript
import { generateShareUrl, generateQRCodeUrl } from '@/lib/utils/report-sharing'

const token = 'a7B9cD2eF4gH6iJ8kL0mN1oP3qR5sT7u'
const baseUrl = 'https://yourapp.com'

// Generate share URL
const shareUrl = generateShareUrl(token, baseUrl)
// Output: "https://yourapp.com/share/a7B9cD2eF4gH6iJ8kL0mN1oP3qR5sT7u"

// Generate QR code URL
const qrUrl = generateQRCodeUrl(shareUrl, 250)
// Output: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https%3A%2F%2F..."
```

### Email Template

```typescript
import { generateShareEmail, generateShareEmailText } from '@/lib/utils/report-sharing'

const emailData = {
  recipientName: 'John Doe',
  recipientEmail: 'john@example.com',
  shareUrl: 'https://yourapp.com/share/xxx',
  senderName: 'Dr. Smith',
  clinicName: 'Beauty Clinic',
  clinicLogoUrl: 'https://clinic.com/logo.png',
  expiresAt: new Date('2025-01-15'),
  message: 'Your personalized skin analysis is ready!',
}

// HTML email
const htmlEmail = generateShareEmail(emailData)

// Plain text fallback
const textEmail = generateShareEmailText(emailData)
```

## Database Schema

### skin_analyses Table

**Share Fields** (added in migration `20250107_multi_clinic_enhancement.sql`):

```sql
ALTER TABLE skin_analyses ADD COLUMN is_shared BOOLEAN DEFAULT false;
ALTER TABLE skin_analyses ADD COLUMN share_token TEXT UNIQUE;
ALTER TABLE skin_analyses ADD COLUMN share_expires_at TIMESTAMPTZ;

CREATE INDEX idx_analyses_share_token ON skin_analyses(share_token) 
WHERE share_token IS NOT NULL;
```

### share_views Table

**New Table** (migration `20250107_create_share_views_table.sql`):

```sql
CREATE TABLE share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token TEXT NOT NULL REFERENCES skin_analyses(share_token) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_share_views_token ON share_views(share_token);
CREATE INDEX idx_share_views_viewed_at ON share_views(viewed_at DESC);
CREATE INDEX idx_share_views_ip ON share_views(ip_address);
```

### RLS Policies

**Public Share Access**:
```sql
CREATE POLICY "Public can view shared analyses"
  ON skin_analyses
  FOR SELECT
  TO anon, authenticated
  USING (
    is_shared = true 
    AND (share_expires_at IS NULL OR share_expires_at > NOW())
  );
```

**Stats Access**:
```sql
CREATE POLICY "Users can view stats for own shares"
  ON share_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM skin_analyses sa
      WHERE sa.share_token = share_views.share_token
      AND (
        sa.user_id = auth.uid()
        OR sa.sales_staff_id IN (SELECT id FROM sales_staff WHERE user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM sales_staff ss
          WHERE ss.user_id = auth.uid()
          AND (ss.role = 'super_admin' OR ss.role = 'clinic_admin')
        )
      )
    )
  );
```

## Workflows

### Create and Share Link

```typescript
// 1. Sales staff opens analysis detail page
const analysis = await fetchAnalysis(analysisId)

// 2. Click "Share Report" button
<Button onClick={() => setShowShareDialog(true)}>
  <Share2 className="mr-2 h-4 w-4" />
  Share Report
</Button>

// 3. ShareDialog opens, select expiry
<ShareDialog 
  open={showShareDialog}
  analysisId={analysis.id}
  clinicName={clinic.name}
/>

// 4. Click "Create Share Link"
const response = await fetch('/api/analysis/share', {
  method: 'POST',
  body: JSON.stringify({ 
    analysis_id: analysisId, 
    expiry_days: 7 
  })
})

// 5. Get share URL
const { data } = await response.json()
// data.share_url = "https://yourapp.com/share/xxx"

// 6. Copy link or share via Line/Email
navigator.clipboard.writeText(data.share_url)
```

### View Shared Report

```typescript
// 1. Recipient opens link: https://yourapp.com/share/xxx

// 2. Server-side rendering (app/share/[token]/page.tsx)
export default async function SharePage({ params }) {
  const { token } = params
  
  // Fetch analysis with RLS (no auth required)
  const analysis = await supabase
    .from('skin_analyses')
    .select('*, clinic(*), sales_staff(*)')
    .eq('share_token', token)
    .eq('is_shared', true)
    .single()
  
  // Check expiry
  if (isShareExpired(analysis.share_expires_at)) {
    notFound()  // Show 404
  }
  
  // Track view (fire and forget)
  fetch(`/api/share/${token}/view`, { method: 'POST' })
  
  // Render report
  return <ShareReportView analysis={analysis} />
}

// 3. Beautiful branded report displayed
// - Clinic logo and brand colors
// - Overall skin health score
// - Detected conditions
// - AI recommendations
// - Contact information
```

### View Statistics

```typescript
// 1. Sales staff/admin opens analysis detail
const analysis = await fetchAnalysis(analysisId)

// 2. Fetch share statistics
const response = await fetch(
  `/api/analysis/share/stats?analysis_id=${analysisId}`
)
const { data } = await response.json()

// 3. Display stats
<div>
  <p>Total Views: {data.total_views}</p>
  <p>Unique Visitors: {data.unique_ips}</p>
  <p>Last Viewed: {formatDate(data.last_viewed_at)}</p>
  {data.days_remaining && (
    <p>Expires in {data.days_remaining} days</p>
  )}
</div>

// 4. Show recent views
{data.views.map(view => (
  <div key={view.viewed_at}>
    <p>{formatDate(view.viewed_at)}</p>
    <p>{view.ip_address}</p>
    <p>{view.user_agent}</p>
  </div>
))}
```

### Revoke Share Link

```typescript
// 1. Click "Revoke Share" button
<Button 
  onClick={handleRevoke}
  variant="destructive"
>
  Revoke Share Link
</Button>

// 2. Confirm action
const confirmed = await showConfirmDialog(
  'Are you sure you want to revoke this share link?'
)

// 3. Call revoke API
if (confirmed) {
  await fetch('/api/analysis/share', {
    method: 'DELETE',
    body: JSON.stringify({ analysis_id: analysisId })
  })
  
  // Link immediately becomes invalid
  // Public page shows 404
}
```

## Testing Checklist

### ✅ Token Generation
- [ ] Tokens are 32 characters
- [ ] Tokens match pattern `/^[A-Za-z0-9_-]{32}$/`
- [ ] Tokens are unique (no duplicates in database)
- [ ] Token validation function works correctly

### ✅ Share Creation
- [ ] Authenticated users can create share links
- [ ] Permission checks work (owner/sales_staff/admin only)
- [ ] Expiry dates calculated correctly (7/30/90 days)
- [ ] Database updated with share_token and expires_at
- [ ] Share URL generated correctly

### ✅ Public Access
- [ ] Public share page loads without authentication
- [ ] Clinic branding displayed correctly (logo, colors)
- [ ] Analysis data displayed accurately
- [ ] Expired links show 404
- [ ] Revoked links show 404
- [ ] Invalid tokens show 404

### ✅ View Tracking
- [ ] Views tracked on page load
- [ ] IP address extracted from x-forwarded-for header
- [ ] User agent and referrer captured
- [ ] View records saved to share_views table
- [ ] Timestamps accurate (UTC timezone)

### ✅ Statistics
- [ ] Total views count accurate
- [ ] Unique IPs counted correctly (Set deduplication)
- [ ] Last viewed timestamp correct
- [ ] Expiry countdown calculated correctly
- [ ] Permission checks work for stats endpoint

### ✅ ShareDialog Component
- [ ] Dialog opens/closes correctly
- [ ] Expiry dropdown changes value
- [ ] Generate button creates share link
- [ ] Copy button copies to clipboard
- [ ] QR code displays correctly
- [ ] Line share opens Line app
- [ ] Email form validates recipient email
- [ ] Loading states display during API calls
- [ ] Error messages shown on failures

### ✅ Revocation
- [ ] Revoke button calls DELETE endpoint
- [ ] Database fields cleared (is_shared=false, share_token=null)
- [ ] Public page returns 404 after revocation
- [ ] Permission checks work for revoke endpoint

### ✅ Multi-Channel Sharing
- [ ] Email HTML template renders correctly
- [ ] Email plain text fallback works
- [ ] SMS message within 160 characters
- [ ] Line Flex Message JSON valid
- [ ] QR code generates correctly (api.qrserver.com)

## Troubleshooting

### Issue: Share link returns 404

**Possible Causes**:
1. Link expired (check `share_expires_at`)
2. Link revoked (check `is_shared = false`)
3. Invalid token format
4. Analysis deleted

**Solution**:
```typescript
// Check analysis in database
const analysis = await supabase
  .from('skin_analyses')
  .select('is_shared, share_token, share_expires_at')
  .eq('id', analysisId)
  .single()

console.log('Is Shared:', analysis.is_shared)
console.log('Token:', analysis.share_token)
console.log('Expires At:', analysis.share_expires_at)
```

### Issue: Views not tracked

**Possible Causes**:
1. `share_views` table doesn't exist (run migration)
2. Network error during tracking
3. Invalid token

**Solution**:
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'share_views'
);

-- Check recent views
SELECT * FROM share_views 
WHERE share_token = 'your-token' 
ORDER BY viewed_at DESC 
LIMIT 10;
```

### Issue: Permission denied when creating share

**Possible Causes**:
1. User not authenticated
2. User not owner/sales_staff/admin
3. Analysis doesn't exist

**Solution**:
```typescript
// Verify authentication
const { data: { session } } = await supabase.auth.getSession()
console.log('User ID:', session?.user.id)

// Check analysis ownership
const analysis = await supabase
  .from('skin_analyses')
  .select('user_id, sales_staff_id, clinic_id')
  .eq('id', analysisId)
  .single()

console.log('Analysis Owner:', analysis.user_id)
console.log('Sales Staff:', analysis.sales_staff_id)
```

## Performance Considerations

### Indexing
- ✅ `idx_analyses_share_token`: Fast lookup by token
- ✅ `idx_share_views_token`: Fast view queries
- ✅ `idx_share_views_viewed_at`: Fast date range queries
- ✅ `idx_share_views_ip`: Fast unique IP counting

### Caching
- **Recommendation**: Cache public share pages for 5 minutes
- **Implementation**: Use Next.js revalidate or CDN caching

```typescript
export const revalidate = 300 // 5 minutes

export default async function SharePage({ params }) {
  // Page automatically cached by Next.js
}
```

### View Tracking
- **Fire and Forget**: Don't block page load
- **Edge Function**: Use Vercel Edge for fast response
- **Batch Inserts**: Consider batching views if high traffic

## Security Best Practices

### ✅ DO
- Use crypto-secure random token generation
- Validate token format on all endpoints
- Check expiry dates server-side
- Implement RLS policies for public access
- Rate limit share creation (max 10/minute per user)
- Log suspicious activity (mass views from single IP)

### ❌ DON'T
- Don't use sequential IDs as tokens
- Don't expose patient info unless opted in
- Don't allow unlimited expiry for all users
- Don't skip permission checks
- Don't include sensitive data in QR codes
- Don't trust client-side expiry validation

## Future Enhancements

### Phase 2
- [ ] Password-protected shares
- [ ] Custom expiry dates (not just presets)
- [ ] Share with multiple recipients
- [ ] Email notification when link viewed
- [ ] Custom branding per share (override clinic defaults)

### Phase 3
- [ ] WhatsApp sharing integration
- [ ] Facebook Messenger sharing
- [ ] PDF export of shared reports
- [ ] Analytics dashboard for shares
- [ ] A/B testing for email templates

### Phase 4
- [ ] Two-factor authentication for sensitive shares
- [ ] Watermarking for shared images
- [ ] Blockchain verification of reports
- [ ] API for third-party integrations

---

**Last Updated**: January 7, 2025
**Version**: 1.0.0
**Maintainer**: AI Beauty Platform Team

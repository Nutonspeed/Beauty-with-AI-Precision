# 📧 Email System Documentation

## Overview

Email notification system for AI367 Beauty Platform with 4 automated email templates.

## 📦 Components

### 1. Email Service (`lib/notifications/email.tsx`)
Core email sending service using Resend API.

**Main Functions:**
- `sendEmail()` - Core email sending function
- `sendBookingConfirmation()` - Booking confirmation email
- `sendBookingReminder()` - Appointment reminder
- `sendAnalysisComplete()` - Analysis completion notification

**New Functions (Phase 1):**
- `sendWeeklyProgressDigest()` - Weekly summary email
- `sendAutomatedProgressReport()` - Bi-weekly progress comparison
- `sendGoalAchievementEmail()` - Goal celebration email
- `sendReEngagementEmail()` - Re-engagement for inactive users

### 2. Email Templates (`lib/notifications/email-templates.ts`)

#### Template 1: Weekly Progress Digest
**Purpose:** Send every Monday with weekly summary

**Data Structure:**
```typescript
interface WeeklyDigestData {
  userName: string;
  weekStart: string;        // "1 ม.ค. 2567"
  weekEnd: string;          // "7 ม.ค. 2567"
  totalAnalyses: number;    // Number of analyses this week
  improvements: Array<{
    parameter: string;      // "ความชุ่มชื้น"
    change: number;         // +15 (percentage)
  }>;
  goalsCompleted: number;   // 2
  totalGoals: number;       // 5
  nextSteps: string[];      // ["ทำความสะอาดหน้า 2 ครั้งต่อวัน", ...]
  viewReportUrl: string;    // Link to full report
}
```

**Features:**
- Stats cards (analyses count, goals completed)
- Improvements table with color-coded changes
- Next steps checklist
- CTA button to view full report

**API Endpoint:** `POST /api/email/weekly-digest`

---

#### Template 2: Automated Progress Report
**Purpose:** Send every 2 weeks comparing latest analysis with previous

**Data Structure:**
```typescript
interface ProgressReportData {
  userName: string;
  reportPeriod: string;           // "30 วันที่ผ่านมา"
  currentAnalysis: Analysis;      // Latest analysis data
  previousAnalysis: Analysis;     // Previous analysis data
  improvements: Array<{
    concern: string;              // "สิว"
    before: number;               // 7/10
    after: number;                // 4/10
    change: number;               // -43%
  }>;
  treatmentFollowed: number;      // 85% (adherence percentage)
  recommendations: string[];      // AI recommendations
  pdfUrl?: string;                // Optional PDF download link
  viewOnlineUrl: string;          // View online link
}
```

**Features:**
- Treatment adherence progress bar
- Before/after comparison cards
- Improvement metrics with visual indicators
- AI recommendations box
- Download PDF button (optional)

**API Endpoint:** `POST /api/email/progress-report`

---

#### Template 3: Goal Achievement
**Purpose:** Send immediately when customer achieves a goal

**Data Structure:**
```typescript
interface GoalAchievementData {
  userName: string;
  goalName: string;              // "ลดสิวให้เหลือ 3 คะแนน"
  goalType: string;              // "ลดปัญหาสิว"
  startValue: number;            // 7
  targetValue: number;           // 3
  currentValue: number;          // 3
  daysToComplete: number;        // 45
  celebrationMessage: string;    // Personalized message
  nextGoalSuggestion: string;    // Suggest next goal
  viewProgressUrl: string;       // Link to progress page
  shareUrl?: string;             // Social share link (optional)
}
```

**Features:**
- Celebration header with confetti emoji
- Achievement card with trophy icon
- Progress visualization (start → current → target)
- Days to complete stat
- Next goal suggestion
- Share achievement button (optional)

**API Endpoint:** `POST /api/email/goal-achievement`

---

#### Template 4: Re-engagement
**Purpose:** Send to inactive users (no analysis for 7+ days)

**Data Structure:**
```typescript
interface ReEngagementData {
  userName: string;
  daysSinceLastAnalysis: number;  // 14
  lastAnalysisDate: string;       // "1 ม.ค. 2567"
  lastScore: number;              // 7.5/10
  personalizedMessage: string;    // AI-generated message
  incentive?: {
    type: 'discount' | 'free_analysis' | 'upgrade';
    value: string;                // "20%" or "Premium 1 เดือน"
    code?: string;                // "COMEBACK20"
  };
  quickActionUrl: string;         // Direct link to analysis
}
```

**Features:**
- "We miss you" header
- Days since last analysis counter
- Last analysis summary
- Special offer card (optional)
- Why come back section (3 reasons)
- Quick action CTA button

**API Endpoint:** `POST /api/email/re-engagement`

---

## 🔧 Setup

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com/signup)
2. Create API key from dashboard
3. Free tier: 100 emails/day, 3,000/month

### 2. Configure Environment Variables

Add to `.env.local`:
```bash
# Email Service
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"
```

### 3. Verify Domain (Production)

For production use, verify your sending domain:
1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for verification (usually 1-2 hours)

---

## 🧪 Testing

### Test Email Configuration

```bash
# Start dev server
pnpm dev

# Visit test endpoint
http://localhost:3000/api/email/test
```

Expected response:
```json
{
  "success": true,
  "configured": true,
  "from": "noreply@yourdomain.com",
  "message": "Email sent successfully!"
}
```

### Test Individual Templates

#### 1. Weekly Digest
```bash
curl -X POST http://localhost:3000/api/email/weekly-digest \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "data": {
      "userName": "สมหญิง",
      "weekStart": "1 ม.ค. 2567",
      "weekEnd": "7 ม.ค. 2567",
      "totalAnalyses": 3,
      "improvements": [
        {"parameter": "ความชุ่มชื้น", "change": 15},
        {"parameter": "สิว", "change": -25}
      ],
      "goalsCompleted": 2,
      "totalGoals": 5,
      "nextSteps": [
        "ทำความสะอาดหน้า 2 ครั้งต่อวัน",
        "ทาครีมกันแดด SPF 50+"
      ],
      "viewReportUrl": "https://example.com/report"
    }
  }'
```

#### 2. Progress Report
```bash
curl -X POST http://localhost:3000/api/email/progress-report \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "data": {
      "userName": "สมหญิง",
      "reportPeriod": "30 วันที่ผ่านมา",
      "currentAnalysis": {},
      "previousAnalysis": {},
      "improvements": [
        {"concern": "สิว", "before": 7, "after": 4, "change": -43}
      ],
      "treatmentFollowed": 85,
      "recommendations": ["ใช้ครีมบำรุงก่อนนอน"],
      "viewOnlineUrl": "https://example.com/progress"
    }
  }'
```

#### 3. Goal Achievement
```bash
curl -X POST http://localhost:3000/api/email/goal-achievement \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "data": {
      "userName": "สมหญิง",
      "goalName": "ลดสิวให้เหลือ 3 คะแนน",
      "goalType": "ลดปัญหาสิว",
      "startValue": 7,
      "targetValue": 3,
      "currentValue": 3,
      "daysToComplete": 45,
      "celebrationMessage": "คุณทำได้แล้ว! ผิวของคุณดีขึ้นมาก",
      "nextGoalSuggestion": "ลดรอยดำจากสิว",
      "viewProgressUrl": "https://example.com/progress"
    }
  }'
```

#### 4. Re-engagement
```bash
curl -X POST http://localhost:3000/api/email/re-engagement \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "data": {
      "userName": "สมหญิง",
      "daysSinceLastAnalysis": 14,
      "lastAnalysisDate": "1 ม.ค. 2567",
      "lastScore": 7.5,
      "personalizedMessage": "มานานแล้วนะ! กลับมาดูแลผิวกันต่อนะ",
      "incentive": {
        "type": "discount",
        "value": "20%",
        "code": "COMEBACK20"
      },
      "quickActionUrl": "https://example.com/analysis"
    }
  }'
```

---

## 🤖 Automation (Cron Jobs)

### Recommended Schedule

#### 1. Weekly Digest
- **When:** Every Monday 9:00 AM
- **Who:** All active users (analyzed in past 7 days)
- **Cron:** `0 9 * * 1`

```typescript
// pseudocode
async function sendWeeklyDigests() {
  const users = await getActiveUsers(last7Days);
  for (const user of users) {
    const data = await calculateWeeklyStats(user);
    await sendWeeklyProgressDigest(user.email, data);
  }
}
```

#### 2. Progress Report
- **When:** Every 2 weeks (Sunday 6:00 PM)
- **Who:** Users with 2+ analyses in past 30 days
- **Cron:** `0 18 * * 0/14`

```typescript
async function sendProgressReports() {
  const users = await getUsersWithMultipleAnalyses(last30Days);
  for (const user of users) {
    const data = await compareLatestAnalyses(user);
    await sendAutomatedProgressReport(user.email, data);
  }
}
```

#### 3. Goal Achievement
- **When:** Immediately when goal is achieved
- **Who:** User who completed goal
- **Trigger:** Event-based (not cron)

```typescript
// In goal tracking system
async function onGoalCompleted(userId: string, goalId: string) {
  const user = await getUser(userId);
  const goal = await getGoal(goalId);
  const data = await prepareGoalAchievementData(goal);
  await sendGoalAchievementEmail(user.email, data);
}
```

#### 4. Re-engagement
- **When:** Daily 10:00 AM
- **Who:** Users inactive for 7+ days (send once)
- **Cron:** `0 10 * * *`

```typescript
async function sendReEngagementEmails() {
  const inactiveUsers = await getInactiveUsers(7); // 7+ days
  for (const user of inactiveUsers) {
    // Check if already sent re-engagement email
    if (await hasRecentReEngagementEmail(user.id, 14)) continue;
    
    const data = await prepareReEngagementData(user);
    await sendReEngagementEmail(user.email, data);
    await markReEngagementEmailSent(user.id);
  }
}
```

---

## 📊 Email Analytics

### Track These Metrics

1. **Open Rate**
   - Target: >20%
   - Formula: Opens / Delivered × 100

2. **Click Rate**
   - Target: >5%
   - Formula: Clicks / Delivered × 100

3. **Conversion Rate**
   - Target: >2%
   - Formula: Actions / Delivered × 100

4. **Unsubscribe Rate**
   - Target: <0.5%
   - Formula: Unsubscribes / Delivered × 100

### Resend Dashboard

View metrics at: https://resend.com/emails

---

## 🎨 Email Design Guidelines

### 1. Mobile-First
- Max width: 600px
- Font size: 14-16px body, 20-28px headings
- Touch targets: 44×44px minimum

### 2. Color Palette
- Primary: `#667eea` (purple)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (orange)
- Info: `#3b82f6` (blue)
- Background: `#f9fafb` (light gray)

### 3. Typography
- Font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Line height: 1.6
- Links: Underlined on hover

### 4. CTA Buttons
- Primary: Gradient background
- Secondary: White with border
- Padding: 12-16px vertical, 30-50px horizontal
- Border radius: 8px

---

## 🚀 Production Checklist

- [ ] Configure `RESEND_API_KEY` in production environment
- [ ] Verify sending domain (for better deliverability)
- [ ] Set up cron jobs for automated emails
- [ ] Test all 4 templates in staging
- [ ] Configure email preferences for users
- [ ] Set up unsubscribe links
- [ ] Monitor delivery rates in Resend dashboard
- [ ] Set up error alerts (failed sends)
- [ ] Implement email logs in database
- [ ] Add rate limiting (prevent spam)

---

## 📝 Next Steps

### Week 2 Tasks:
1. Privacy Controls UI
   - Email preferences (which emails to receive)
   - Unsubscribe management
   - Data export feature

2. Enhanced PDF Reports
   - Include email preview in PDF
   - Better visual design
   - Progress charts

### Future Enhancements:
- [ ] Email personalization with AI
- [ ] A/B testing for subject lines
- [ ] Dynamic content based on user behavior
- [ ] Multi-language support
- [ ] SMS fallback for critical notifications
- [ ] Email scheduling (best send time per user)

---

## 🆘 Troubleshooting

### Email Not Sending

1. **Check API Key**
   ```bash
   echo $RESEND_API_KEY
   # Should output: re_xxxxx...
   ```

2. **Check Logs**
   ```bash
   # In terminal where dev server is running
   # Look for: [Email] Sent successfully
   ```

3. **Test Endpoint**
   ```bash
   curl http://localhost:3000/api/email/test
   ```

### Email Goes to Spam

1. Verify your domain (SPF, DKIM, DMARC)
2. Use a professional "from" address
3. Avoid spam trigger words
4. Include unsubscribe link
5. Maintain low bounce rate (<5%)

### Template Not Rendering

1. Check HTML validity (close all tags)
2. Test in multiple email clients
3. Use inline CSS (avoid `<style>` blocks)
4. Use tables for layout (better compatibility)

---

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Email HTML Best Practices](https://www.emailonacid.com/blog/article/email-development/best-practices-for-coding-html-emails/)
- [Can I Email](https://www.caniemail.com/) - CSS support in email clients
- [Really Good Emails](https://reallygoodemails.com/) - Email inspiration

---

**Created:** Week 1 Phase 1  
**Last Updated:** จันทร์ 1 ม.ค. 2568  
**Status:** ✅ Ready for Testing

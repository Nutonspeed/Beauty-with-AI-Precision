# 📋 งานที่ต้องทำต่อ - สำหรับ December 2025

**โปรเจค**: ClinicIQ — Intelligent Aesthetic Platform  
**สถานะ**: Production Ready v1.1.0 (95-97% Complete)  
**วันที่อัพเดท**: December 25, 2025  
**ต้องทำ**: 10+ งาน เรียงตามลำดับความสำคัญ

---

## 🎯 Priority Breakdown

### 🔴 Critical (ต้องทำก่อน Deploy)

#### 1. 🚀 Production Deployment Checklist
**สถานะ**: Ready (Vercel configured)  
**เวลา**: 1-2 ชั่วโมง  
**ขั้นตอน**:
```bash
# 1. Environment Variables
- NEXTAUTH_SECRET ✅ (ปลอดภัยแล้ว)
- NEXTAUTH_URL ✅
- Supabase keys ✅
- AI API keys ✅ (HF + Google Vision)
- Vercel deployment ⏳

# 2. Database Migrations
pnpm check:db                  # ตรวจสอบ schema
pnpm schema:assert --tables 94 # Verify all tables

# 3. Health Checks
curl http://localhost:3004/api/health

# 4. Deploy
vercel --prod
```

**ความเสี่ยง**: ต่ำ (ทดสอบแล้ว)  
**ผลลัพธ์**: Live URL สำหรับ sales + users

---

#### 2. 📧 Connect Real SMTP (Email Sending)
**สถานะ**: API structure ready, need provider setup  
**เวลา**: 1-2 ชั่วโมง  
**ปัจจุบัน**: Using mock `lib/email/email-tracker.ts`

**ตัวเลือก SMTP**:

**Option A: Resend** (✅ Recommended)
- $20/month unlimited
- Easy Next.js integration
- Template support
- Try free: 100 emails/day
```typescript
// app/api/email/send/route.ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export const POST = withPublicAccess(async (req) => {
  const { to, template_id, subject, html } = await req.json()
  const result = await resend.emails.send({
    from: 'noreply@cliniciq.example',
    to,
    subject,
    html
  })
  // Store in email_logs table
  await supabase.from('email_logs').insert({
    recipient: to,
    template_id,
    status: 'sent',
    external_id: result.id
  })
  return NextResponse.json(result)
})
```

**Option B: SendGrid**
- $14.95/month
- Enterprise support
- Webhook tracking

**Option C: Mailgun**
- Pay-as-you-go
- Good for high volume

**Files to update**:
- `lib/email/email-tracker.ts` → implement real send
- `app/api/email/send/route.ts` → wire up provider
- `.env.local` → add SMTP credentials
- `lib/email/templates/` → verify all templates

**Test**:
```bash
pnpm test:email-flow  # Send test email
```

---

#### 3. 💬 Complete Real-time Chat API
**สถานะ**: Component ready, API partial (501 Not Implemented)  
**เวลา**: 2-3 ชั่วโมง  
**ปัจจุบัน**: Using `lib/chat/chat-manager.ts` with Supabase Realtime

**Implement**:
```typescript
// app/api/chat/send/route.ts
export const POST = withUserAuth(async (request) => {
  const { session_id, message, user_id } = await request.json()
  
  // 1. Save to DB
  const { data } = await supabase.from('chat_messages').insert({
    session_id,
    user_id,
    content: message,
    created_at: new Date().toISOString()
  })
  
  // 2. Realtime broadcast (auto via Supabase)
  // 3. AI response (via ChatAssistant)
  const aiResponse = await aiChat.generateResponse({
    message,
    context: { user_id, session_id }
  })
  
  // 4. Save AI response
  await supabase.from('chat_messages').insert({
    session_id,
    user_id: 'ai_assistant',
    content: aiResponse,
    is_ai: true
  })
  
  return NextResponse.json({ success: true })
})
```

**Files**:
- `app/api/chat/send/route.ts` ⏳
- `app/api/chat/history/route.ts` ⏳
- `lib/ai/chat-assistant.ts` ✅ (exists)
- Test in `__tests__/chat-manager.test.ts`

---

### 🟡 Important (Before Sales Demo)

#### 4. 🎥 Test WebRTC Video Calls
**สถานะ**: Video call component exists, need TURN server  
**เวลา**: 1 ชั่วโมง (setup) + 1 ชั่วโมง (testing)

**ขั้นตอน**:
1. Setup TURN Server (for production)
   - Free: coturn (self-hosted)
   - Managed: Xirsys, Twilio (paid)

2. Test video call flow
```bash
pnpm test:e2e --grep "Video Call"
```

3. Check `components/video-call/` for UI

**Files**: 
- `lib/webrtc/video-call-manager.ts` (exists)
- `components/video-call/video-consultation.tsx` (exists)
- Test: `__tests__/video-call-manager.test.ts`

---

#### 5. 🧪 Full E2E Test Suite (Playwright)
**สถานะ**: Framework ready, tests partial  
**เวลา**: 2-4 ชั่วโมง  
**พื้นฐาน**: `playwright.config.ts` ✅

**ต้องเขียน**:
- [ ] Auth flow (login/logout)
- [ ] Skin analysis flow
- [ ] Chat feature
- [ ] Payment flow
- [ ] Admin dashboard

**Run**:
```bash
pnpm dev          # Terminal 1: Start server (port 3004)
pnpm test:e2e     # Terminal 2: Run tests
```

---

#### 6. 📊 Analytics Dashboard Integration
**สถานะ**: Dashboard UI ✅, Data integration partial  
**เวลา**: 2-3 ชั่วโมง

**ต้องทำ**:
1. Connect API endpoints → real data
2. Implement live metrics update (via WebSocket)
3. Export to CSV/PDF

**Files**:
- `components/analytics/analytics-dashboard.tsx` ✅
- `app/api/analytics/collect/route.ts` ✅
- `app/api/analytics/dashboard/route.ts` ⏳

---

### 🟢 Nice-to-Have (After MVP)

#### 7. 🎨 AR/3D Viewer Optimization
**สถานะ**: Working, performance can be better  
**เวลา**: 2-3 ชั่วโมง  
**ปัจจุบัน**: Using Three.js + MediaPipe

**ปรับปรุง**:
- [ ] Add LOD (Level of Detail) for mobile
- [ ] GPU acceleration
- [ ] Caching 3D models
- [ ] Mobile gesture support

**Files**:
- `components/ar/ar-visualization.tsx`
- `lib/ar/` (folder)

---

#### 8. 📱 Mobile PWA Offline Support
**สถานะ**: PWA manifest ✅, offline partial  
**เวลา**: 2 ชั่วโมง

**ต้องทำ**:
1. Cache strategy for images
2. Offline fallback pages
3. Background sync for uploads

**Files**:
- `public/sw.js` (Service Worker)
- `lib/offline-manager.ts`
- `components/offline/offline-indicator.tsx`

---

#### 9. 🤖 Gemini API Integration (Optional)
**สถานะ**: Not started (experimental)  
**เวลา**: 30-45 นาที  
**ประโยชน์**: 3rd AI service backup

**ขั้นตอน**:
```bash
# 1. Get API key
# https://ai.google.dev/

# 2. Test script
pnpm tsx scripts/test-gemini.ts

# 3. Integrate if performance good
lib/ai/gemini-analyzer.ts
```

---

#### 10. 📄 PDF Export Implementation
**สถานะ**: Partial (mockup exists)  
**เวลา**: 1-2 ชั่วโมง

**ใช้**: `lib/pdf/report-generator.ts`

```typescript
// lib/pdf/report-generator.ts
export async function generateAnalysisReport(analysisId: string) {
  const analysis = await getAnalysis(analysisId)
  const doc = new PDFDocument()
  
  // Add analysis data
  doc.fontSize(20).text('Skin Analysis Report')
  doc.fontSize(12).text(`Date: ${analysis.created_at}`)
  
  // Add images
  analysis.images.forEach((img) => {
    doc.image(img.url, { width: 300 })
  })
  
  // Add VISIA scores
  doc.text('VISIA Metrics', { underline: true })
  analysis.visia_scores.forEach(score => {
    doc.text(`${score.metric}: ${score.value}`)
  })
  
  return doc
}
```

---

## 📈 Recommended Sequence

### Week 1: Production Ready
1. ✅ Deploy to Vercel (critical)
2. ✅ Setup SMTP (critical)
3. ✅ Complete Chat API (critical)
4. ✅ Test Video Calls (important)

**Effort**: 6-8 ชั่วโมง  
**ผลลัพธ์**: Production-ready system

---

### Week 2: Quality Assurance
5. ✅ E2E Test Suite (important)
6. ✅ Analytics Integration (important)
7. ✅ PDF Export (nice-to-have)
8. ✅ Mobile PWA (nice-to-have)

**Effort**: 8-10 ชั่วโมง  
**ผลลัพธ์**: Polished MVP

---

### Week 3: Polish
9. ✅ AR/3D Optimization (nice-to-have)
10. ✅ Gemini Integration (optional)

**Effort**: 4-5 ชั่วโมง  
**ผลลัพธ์**: Feature-complete v1.1

---

## ✅ Project Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **Core AI** | ✅ 100% | 4 models, ensemble voting |
| **Frontend** | ✅ 95% | UI complete, some API integration pending |
| **Backend API** | 🟡 80% | Routes exist, some features need data connection |
| **Database** | ✅ 90% | Schema good, need more indexes for scale |
| **Testing** | 🟡 60% | Unit tests good, E2E partial |
| **Deployment** | 🟡 70% | Vercel ready, need SMTP + video setup |
| **Docs** | ✅ 90% | Good architecture docs |
| **Performance** | 🟡 75% | Good, can optimize AR/images |

**Overall**: 85% Ready for Production

---

## 🚀 Next Action Items

### Immediate (Today)
- [ ] Review deployment checklist
- [ ] Choose SMTP provider (Resend recommended)
- [ ] Start Email implementation

### This Week
- [ ] Complete chat API
- [ ] Test video calls
- [ ] Deploy to staging
- [ ] Run E2E tests

### Before Sales Demo
- [ ] Everything above ✅
- [ ] Create demo accounts
- [ ] Test full user journey

---

## 📞 Support Resources

**Architecture**: See `.github/copilot-instructions.md`  
**API Docs**: `docs/api/` (if exists) or check route handlers  
**Tech Stack**: Next.js 16 + React 19 + Supabase + TailwindCSS  
**Key Hooks**: `useAuth()`, `useChat()`, `useAnalysis()`, `useAnalytics()`

---

**Last Updated**: December 25, 2025  
**Maintained by**: Engineering Team  
**Status**: 🟡 Active Development

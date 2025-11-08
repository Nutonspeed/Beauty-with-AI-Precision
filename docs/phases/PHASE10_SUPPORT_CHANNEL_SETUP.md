# 🛠️ AI367 Beta Testing - Support Channel Setup Guide

**วันที่:** 3 พฤศจิกายน 2025  
**Phase:** 10 - Beta User Recruitment  
**เป้าหมาย:** ตั้งค่า support channels พร้อมรองรับ 10-15 beta testers

---

## 📋 Overview

### Support Channels

| Channel | Purpose | Response Time | Setup Time |
|---------|---------|---------------|------------|
| **Discord** | Primary (bugs, testing, community) | < 30 min | 30 min |
| **Line OA** | Secondary (quick questions, Thai users) | < 2 hours | 20 min |
| **Email** | Tertiary (complex issues, formal) | < 24 hours | 10 min |

---

## 🎮 Discord Server Setup

### Step 1: สร้าง Discord Server (5 นาที)

1. เปิด Discord → คลิก "+" → "Create My Own"
2. เลือก "For a club or community"
3. ตั้งชื่อ: **AI367 Beta Testing**
4. Upload server icon (ใช้โลโก้ AI367)

### Step 2: สร้าง Channels (10 นาที)

**📢 Information Channels**

\`\`\`
📢 INFORMATION
├── 📋 welcome (อ่านอย่างเดียว)
├── 📖 announcements (อ่านอย่างเดียว)
├── 📝 testing-guide (อ่านอย่างเดียว)
└── ❓ faq (อ่านอย่างเดียว)
\`\`\`

**💬 Communication Channels**

\`\`\`
💬 TESTING
├── 💬 general-chat
├── 🧪 testing-discussion
├── 🐛 bugs
├── 💡 feature-requests
├── 📸 screenshots
└── 🆘 help
\`\`\`

**🎉 Community Channels**

\`\`\`
🎉 COMMUNITY
├── 🏆 leaderboard
├── 🎯 achievements
└── 💭 off-topic
\`\`\`

**🔧 Admin Channels**

\`\`\`
🔧 ADMIN (private)
├── 🛡️ mod-chat
└── 📊 analytics
\`\`\`

### Step 3: ตั้งค่า Roles (5 นาที)

**สร้าง Roles:**

| Role | Color | Permissions | Purpose |
|------|-------|-------------|---------|
| **👑 Admin** | Red | Administrator | ทีมพัฒนา |
| **🛡️ Moderator** | Orange | Manage Messages, Kick | ดูแล community |
| **🧪 Beta Tester** | Blue | Send Messages, Attach Files | ผู้ทดสอบ |
| **⭐ Top Contributor** | Gold | - | Beta tester ที่ active สุด |
| **🤖 Bot** | Grey | Bot permissions | Automation bots |

**ตั้งค่า Permissions:**

1. คลิก Server Settings → Roles
2. สร้าง roles ตามตาราง
3. ตั้งค่า channel permissions:
   - #welcome, #announcements: @everyone อ่านอย่างเดียว
   - #bugs, #feature-requests: @Beta Tester ส่งได้
   - #mod-chat: @Admin, @Moderator อย่างเดียว

### Step 4: เขียน Welcome Message (5 นาที)

**Channel: #welcome**

\`\`\`markdown
# 🎉 Welcome to AI367 Beta Testing!

ยินดีต้อนรับเข้าสู่ AI367 Beta Testing Program! 🚀

## 📋 Quick Start

1. **อ่านประกาศ** → #announcements
2. **ดู Testing Guide** → #testing-guide
3. **ถามคำถาม** → #help
4. **Report bugs** → #bugs
5. **แนะนำ features** → #feature-requests

## 🎁 Beta Tester Benefits

- ✅ Premium 6 เดือนฟรี (฿1,794)
- ✅ ชื่อใน Special Thanks page
- ✅ Early access features
- ✅ Exclusive badge

## 🏆 Leaderboard

ทดสอบเยอะ → รับ points → ลุ้นรางวัล!
ดูคะแนนได้ที่ #leaderboard

## 📅 Timeline

- **5-10 พ.ย.:** Testing period
- **8 พ.ย.:** Feedback form deadline
- **10 พ.ย.:** Beta ends

## 📞 Contact

- 🆘 Help: #help
- 🐛 Bugs: #bugs
- 💡 Ideas: #feature-requests
- 📧 Email: beta@ai367bar.com

---

**🔔 โปรด:**
- แนะนำตัวใน #general-chat
- เปิด notifications สำหรับ #announcements
- ถ่ายรูป bugs/screenshots แชร์ที่ #screenshots

ขอให้ testing สนุก! 🎊
\`\`\`

### Step 5: เขียน Testing Guide (5 นาที)

**Channel: #testing-guide**

\`\`\`markdown
# 📖 Beta Testing Guide

## 🎯 What to Test

### Must Test (ทุกคน)
- [ ] Registration + Login
- [ ] Skin Analysis (อัพรูป → ดูผล)
- [ ] Analysis History
- [ ] Profile Management
- [ ] Mobile compatibility (ถ้ามีมือถือ)

### Nice to Test
- [ ] AR Treatment Simulator
- [ ] Booking System
- [ ] Dashboard (Clinic Owners)
- [ ] PDF Export

## 🐛 How to Report Bugs

**Good Bug Report:**
\`\`\`
❌ Bug: PDF export ไม่ได้บน Safari iOS

Priority: P1 (High)

Steps to Reproduce:
1. Login → Dashboard
2. Click "Export PDF" บน analysis page
3. ไม่มีอะไรเกิดขึ้น (no download, no error)

Expected: PDF download
Actual: Nothing happens

Device: iPhone 14 Pro, iOS 17.1
Browser: Safari
Screenshot: [attach]
\`\`\`

**Bad Bug Report:**
\`\`\`
ระบบช้า
\`\`\`

## 💡 How to Request Features

**Good Feature Request:**
\`\`\`
💡 Feature: เพิ่ม progress bar ระหว่าง AI วิเคราะห์

Reason: ตอนนี้รอ 8-10 วินาที ไม่รู้ว่าโหลดถึงไหน ทำให้กังวลว่าค้างหรือเปล่า

Suggested Solution: แสดง progress bar 0-100% หรือ spinner + "Analyzing... X seconds"

Impact: ทำให้ UX ดีขึ้น, ลด anxiety
\`\`\`

## 📊 Testing Checklist

Full checklist: [link to PHASE10_BETA_TESTING_CHECKLIST.md]

## 🎁 Rewards

- +5 pts: Test all features
- +10 pts: Report each bug
- +15 pts: Suggest useful feature
- +20 pts: Complete feedback form
- +50 pts: P0/P1 critical bug

Top 3 → รางวัล ฿500 / ฿300 / ฿100

---

**Questions?** Ask in #help
\`\`\`

### Step 6: Setup FAQ (5 นาที)

**Channel: #faq**

\`\`\`markdown
# ❓ Frequently Asked Questions

## 📱 Account & Login

**Q: ลืมรหัส?**
A: คลิก "Forgot Password" หน้า login → กรอก email → check inbox

**Q: ไม่ได้รับ verification email?**
A: 1) Check spam 2) รอ 5-10 นาที 3) คลิก "Resend" 4) ยังไม่ได้ → ถาม #help

## 🧪 Skin Analysis

**Q: AI ใช้เวลานานแค่ไหน?**
A: ปกติ 8-10 วินาที (ถ้า >15 วินาที report bug พร้อม internet speed)

**Q: รูปไหนที่ทำงานได้ดี?**
A:
- ✅ Full face, ไม่ใส่แว่น, แสงสว่างดี
- ✅ ขนาด < 10MB
- ✅ .jpg, .png, .heic
- ❌ ไม่เหมาะ: มืดเกินไป, ภาพเบลอ, ครึ่งหน้า

## 🎮 AR Simulator

**Q: AR lag?**
A: 1) ปิด tabs อื่น 2) ใช้ Chrome (recommended) 3) ลดความละเอียดหน้าจอ (mobile)

**Q: 3D viewer ไม่โหลด?**
A: 1) Refresh page 2) Clear cache 3) ลอง browser อื่น 4) Report bug

## 📄 PDF Export

**Q: PDF คุณภาพไม่ดี?**
A: Report bug + แนบ screenshot → เราจะปรับ

## 📞 Support

**Q: ช่องทางไหนตอบเร็วสุด?**
A: Discord #help (< 30 min work hours)

**Q: ถาม email ตอบเมื่อไหร่?**
A: < 24 hours

---

**ไม่เจอคำถามที่ต้องการ?** ถามได้ที่ #help
\`\`\`

### Step 7: Setup Bots (Optional, 10 นาที)

**Recommended Bots:**

1. **MEE6** (Leveling + Leaderboard)
   - เพิ่ม MEE6 bot: mee6.xyz
   - ตั้งค่า leaderboard: #leaderboard
   - Configure XP: +5 XP per message

2. **Dyno** (Auto-moderation)
   - เพิ่ม Dyno: dyno.gg
   - Auto-delete spam
   - Auto-role @Beta Tester

3. **Simple Poll** (Voting)
   - เพิ่ม Simple Poll: top.gg/bot/simple-poll
   - สำหรับ vote features

**Setup Instructions:**
- คลิก link → "Invite Bot"
- เลือก server "AI367 Beta Testing"
- ตั้งค่าตาม bot documentation

---

## 📱 Line Official Account Setup

### Step 1: สร้าง Line OA (5 นาที)

1. ไป manager.line.biz
2. คลิก "Create Account"
3. กรอกข้อมูล:
   - Account name: **AI367 Beta Support**
   - Category: Technology / Software
   - Business type: Small business
4. เลือก plan: Free (0 บาท, 500 messages/month)

### Step 2: ตั้งค่าโปรไฟล์ (3 นาที)

1. ไป Settings → Account settings
2. Upload profile picture (โลโก้ AI367)
3. Status message: "🧪 Beta Testing Support - ตอบภายใน 2 ชม."
4. Description:
   \`\`\`
   AI367 Beta Testing Support
   
   🧪 Skin Analysis + AR Simulator
   📞 ตอบคำถาม < 2 ชม.
   
   Discord: discord.gg/ai367bar
   Email: beta@ai367bar.com
   \`\`\`

### Step 3: ตั้งค่า Auto-Reply (5 นาที)

**Greeting Message:**
\`\`\`
สวัสดีครับ! ยินดีต้อนรับสู่ AI367 Beta Testing 🎉

🧪 คุณสามารถ:
- ถามคำถาม → ตอบภายใน 2 ชม.
- Report bugs → แจ้งตรงนี้ได้เลย
- ขอความช่วยเหลือ

📋 Quick Links:
- Testing Guide: [link]
- Discord: discord.gg/ai367bar
- Feedback Form: [link]

มีคำถามอะไรไหมครับ? 😊
\`\`\`

**Auto-Reply Keywords:**

| Keyword | Reply |
|---------|-------|
| สวัสดี, hello, hi | [Greeting Message] |
| ช่วย, help | ตอบภายใน 2 ชม. หรือถามได้ที่ Discord #help (ตอบเร็วกว่า) |
| bug | กรุณาแจ้ง: 1) Bug อะไร 2) Steps 3) Device/Browser 4) Screenshot (ถ้ามี) |
| feedback | กรอก Feedback Form ได้ที่ [link] |
| ลืมรหัส, password | Reset ได้ที่ https://ai367bar.vercel.app/forgot-password |

**ตั้งค่า:**
1. ไป Messaging API → Auto-reply messages
2. เพิ่ม keywords + replies ตามตาราง
3. Enable "Auto-reply"

### Step 4: Rich Menu (5 นาที)

**สร้าง Rich Menu:**
\`\`\`
┌─────────┬─────────┐
│ 🧪 Test │ 🐛 Bugs │
├─────────┼─────────┤
│ 📝 Form │ 🆘 Help │
└─────────┴─────────┘
\`\`\`

**Links:**
- 🧪 Test: https://ai367bar.vercel.app
- 🐛 Bugs: Discord bugs channel
- 📝 Form: Google Form feedback
- 🆘 Help: Discord help channel

**ตั้งค่า:**
1. ไป Home → Rich menu
2. Create rich menu
3. Upload template (สร้างใน Canva 2500x1686px)
4. ตั้งค่า links

### Step 5: Broadcast Message Template (2 นาที)

**เก็บไว้ใช้ broadcast ข่าวสาร:**

\`\`\`
🎉 ประกาศ: [หัวข้อ]

[รายละเอียด]

📋 อ่านเพิ่มเติม: [link]

---
AI367 Beta Testing Team
\`\`\`

---

## 📧 Email Support Setup

### Step 1: สร้าง Email Alias (2 นาที)

**Email Addresses:**
- `beta@ai367bar.com` - Primary support
- `support@ai367bar.com` - General support
- `bugs@ai367bar.com` - Bug reports

**Setup (Google Workspace / Gmail):**
1. ไป Gmail → Settings → Accounts
2. Add alias: beta@ai367bar.com
3. Forward to: [main email]

**Setup (Custom Domain):**
1. ไป domain provider (Namecheap, GoDaddy, etc.)
2. Email forwarding → Add alias
3. Forward beta@ → main email

### Step 2: Auto-Responder (3 นาที)

**Gmail Vacation Responder:**

\`\`\`
Subject: ได้รับ email แล้ว - AI367 Beta Support

สวัสดีครับ,

ได้รับ email ของคุณแล้ว เราจะตอบภายใน 24 ชั่วโมง

📞 ต้องการคำตอบเร็วกว่า?
- Discord: discord.gg/ai367bar (< 30 min)
- Line: @ai367bar (< 2 hours)

📋 Useful Links:
- Testing Guide: [link]
- Feedback Form: [link]
- FAQ: [link]

ขอบคุณครับ,
AI367 Beta Testing Team
\`\`\`

**ตั้งค่า:**
1. Gmail → Settings → General → Vacation responder
2. Enable "Vacation responder on"
3. First day: 5 Nov 2025
4. Last day: 10 Nov 2025
5. Message: [copy ข้างบน]

### Step 3: Email Templates (5 นาที)

**Template 1: Bug Report Acknowledgment**

\`\`\`
Subject: Re: [Bug] [original subject]

สวัสดีครับ คุณ [ชื่อ],

ขอบคุณสำหรับการ report bug!

Bug: [สรุป]
Priority: [P0/P1/P2]
Status: Investigating

เราจะอัพเดทให้ทราบเมื่อแก้ไขเสร็จครับ

📋 Track status:
- Discord #bugs
- GitHub Issues: [link]

ขอบคุณครับ,
AI367 Team
\`\`\`

**Template 2: Feature Request Response**

\`\`\`
Subject: Re: [Feature Request] [original subject]

สวัสดีครับ คุณ [ชื่อ],

ขอบคุณสำหรับ feedback!

Feature: [สรุป]
Status: Under review

เราจะนำไปพิจารณาและอาจเพิ่มใน roadmap ครับ

📋 Vote for this feature:
Discord #feature-requests

ขอบคุณครับ,
AI367 Team
\`\`\`

**Template 3: General Question**

\`\`\`
Subject: Re: [original subject]

สวัสดีครับ คุณ [ชื่อ],

[ตอบคำถาม]

มีคำถามอื่นๆ ถามได้เลยครับ

📞 Quick help:
- Discord: discord.gg/ai367bar
- Line: @ai367bar

ขอบคุณครับ,
AI367 Team
\`\`\`

**บันทึก Templates:**
1. Gmail → Settings → Advanced → Templates
2. Enable "Templates"
3. Compose → สร้างแต่ละ template → เลือก "Save as template"

---

## 📊 Support Analytics

### Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| **Response Time** | < 30 min (Discord) | Manual tracking |
| **Resolution Time** | < 24 hours | Manual tracking |
| **Bug Reports** | 10-30 bugs | Discord #bugs + spreadsheet |
| **Questions** | 20-50 questions | Count messages |
| **Satisfaction** | 80%+ | Feedback form |

### Daily Check (10 นาที/วัน)

**Morning (09:00):**
- เช็ค Discord #bugs, #help (ตอบข้อความค้างคืน)
- เช็ค Line messages (ตอบ)
- เช็ค emails (ตอบ urgent)

**Evening (18:00):**
- Summary: จำนวน bugs, questions, feedback วันนี้
- Update #announcements ถ้ามีข่าวสำคัญ
- Plan tomorrow's tasks

---

## 🚨 Escalation Procedures

### P0 - Critical (ตอบทันที)

**ตัวอย่าง:**
- ระบบล่ม (crash)
- ข้อมูลหาย (data loss)
- Security issues

**Actions:**
1. ตอบทันที "กำลังตรวจสอบ"
2. แจ้ง dev team ทันที
3. Fix ภายใน 2-4 ชม.
4. Update ทุก 30 นาที

### P1 - High (ตอบภายใน 30 นาที)

**ตัวอย่าง:**
- Feature ใช้ไม่ได้ (AI analysis fail)
- Performance issue (> 20s load)

**Actions:**
1. ตอบภายใน 30 นาที
2. Investigate + reproduce
3. Fix ภายใน 24 ชม.
4. Update ทุก 4 ชม.

### P2 - Medium (ตอบภายใน 2 ชม.)

**ตัวอย่าง:**
- UI bugs
- Minor features ไม่ทำงาน

**Actions:**
1. ตอบภายใน 2 ชม.
2. Add to backlog
3. Fix ภายใน 2-3 วัน

### P3 - Low (ตอบภายใน 24 ชม.)

**ตัวอย่าง:**
- คำถามทั่วไป
- Feature requests
- Suggestions

**Actions:**
1. ตอบภายใน 24 ชม.
2. Add to roadmap

---

## 📋 Pre-Launch Checklist

### Discord ✅

- [ ] Server created
- [ ] Channels สร้างครบ (12 channels)
- [ ] Roles ตั้งค่าแล้ว (5 roles)
- [ ] Welcome message พร้อม
- [ ] Testing guide พร้อม
- [ ] FAQ พร้อม
- [ ] Bots ติดตั้งแล้ว (optional)

### Line OA ✅

- [ ] Account สร้างแล้ว
- [ ] Profile ตั้งค่าแล้ว
- [ ] Auto-reply พร้อม
- [ ] Rich menu พร้อม
- [ ] Greeting message พร้อม

### Email ✅

- [ ] Email alias พร้อม (beta@, support@, bugs@)
- [ ] Auto-responder เปิดแล้ว
- [ ] Templates บันทึกแล้ว (3 templates)
- [ ] Test send email (ตัวเองส่งลองดู)

### Testing ✅

- [ ] ส่ง test message Discord (ตอบกลับเองได้)
- [ ] ส่ง test message Line (auto-reply ทำงาน)
- [ ] ส่ง test email (auto-responder ทำงาน)
- [ ] เชิญ 1-2 คนทดลองใช้ (soft launch)

---

## 📞 Contact Information

**Support Channels:**
- Discord: discord.gg/ai367bar
- Line: @ai367bar
- Email: beta@ai367bar.com

**Admin:**
- Nutparit (nutparit@ai367bar.com)
- Discord DM: @nutparit

---

*เอกสารนี้เป็นส่วนหนึ่งของ Phase 10: Beta User Recruitment*  
*Last updated: 3 พฤศจิกายน 2025*

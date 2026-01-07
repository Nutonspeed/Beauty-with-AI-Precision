# 🔄 AI367 Beauty Platform - System Flows & Workflows จริง

**Version:** 1.0 (ความเป็นจริง)  
**Last Updated:** 9 พฤศจิกายน 2025  
**Coverage:** 70% ของระบบ (มี mock data และ incomplete flows)

> ⚠️ **เอกสารนี้แสดง flow ที่ทำงานได้จริง:** ไม่ใช่ ideal flow แต่เป็น actual implementation

---

## 🎯 User Journey Flows จริง

### 1. Skin Analysis Flow (ทำงานได้ 80%)

\`\`\`mermaid
graph TD
    A[User visits /analysis] --> B{Logged in?}
    B -->|No| C[Show free analysis mode]
    B -->|Yes| D[Show full analysis interface]

    C --> E[Upload photo or take selfie]
    D --> E

    E --> F[Lighting quality check]
    F --> G[Face positioning guide]

    G --> H[Submit for analysis]
    H --> I{Use local AI?}

    I -->|Yes| J[Run 6 CV algorithms locally]
    I -->|No| K[Call Hugging Face API]

    J --> L[Aggregate results]
    K --> M{Hugging Face success?}
    M -->|Yes| N[Process HF results]
    M -->|No| O[Use mock data fallback]

    N --> L
    O --> L

    L --> P[Map to VISIA metrics]
    P --> Q{Logged in?}

    Q -->|No| R[Show results without saving]
    Q -->|Yes| S[Save to skin_analyses table]

    R --> T[Display heatmap + scores]
    S --> T

    T --> U[Generate PDF report]
    U --> V[Show treatment recommendations]

    V --> W[AR Simulator option]
    W --> X[End]
\`\`\`

**ปัญหาจริงใน flow นี้:**

- ❌ Step P: VISIA metrics ฮาร์ดโค้ด (7, 2, 1.5)
- ❌ Step O: Mock data fallback ไม่มี warning
- ❌ Step M: Hugging Face API rate limiting ไม่ handle ดี

---

### 2. Authentication Flow (ทำงานได้)

\`\`\`mermaid
graph TD
    A[User clicks Login] --> B[Redirect to /auth/login]
    B --> C[Enter email/password]
    C --> D[Call Supabase auth.signInWithPassword]

    D --> E{Login success?}
    E -->|Yes| F[Set session cookie]
    E -->|No| G[Show error message]

    F --> H[Redirect to intended page]
    H --> I[Middleware checks session]

    I --> J{Session valid?}
    J -->|Yes| K[Allow access]
    J -->|No| L[Redirect to /auth/login]

    K --> M[User can access protected routes]
\`\`\`

---

### 3. Booking System Flow (ทำงานได้บางส่วน)

\`\`\`mermaid
graph TD
    A[User visits booking page] --> B[Select service type]
    B --> C[Choose date/time]
    C --> D[Check availability API]

    D --> E{Slot available?}
    E -->|Yes| F[Show booking form]
    E -->|No| G[Show next available slots]

    F --> H[Enter customer details]
    H --> I[Submit booking]

    I --> J[Create booking record]
    J --> K{Save success?}

    K -->|Yes| L[Send confirmation email]
    K -->|No| M[Show error]

    L --> N[Show booking confirmation]
    N --> O[Add to calendar if supported]
\`\`\`

**ปัญหาจริง:** Integration ไม่ complete - booking ไม่ connect กับ analysis เต็มรูปแบบ

---

## 🤖 AI Processing Flows จริง

### 4. Multi-Mode Skin Analysis Flow (ทำงานได้)

\`\`\`mermaid
graph TD
    A[Image uploaded] --> B[Validate image quality]
    B --> C[Extract face region]

    C --> D{Use Python service?}
    D -->|Yes| E[Call ai-service API]
    D -->|No| F[Run local CV algorithms]

    E --> G[Python service processes 8 modes]
    F --> H[JavaScript CV processes 6 modes]

    G --> I[Return JSON results]
    H --> I

    I --> J[Calculate VISIA scores]
    J --> K{Use real calculation?}

    K -->|Yes| L[Calculate from CV results]
    K -->|No| M[Use hardcoded values]

    L --> N[Generate heatmap overlay]
    M --> N

    N --> O[Store in database]
    O --> P[Return to frontend]
\`\`\`

**ความเป็นจริง:** Step K มักเป็น "No" - ใช้ hardcoded values

---

### 5. AI Service (Python) Flow

\`\`\`mermaid
graph TD
    A[FastAPI receives request] --> B[Validate image]
    B --> C[Load ML models]

    C --> D[Run parallel processing]
    D --> E[Mode 1: Spots detection]
    D --> F[Mode 2: Wrinkles analysis]
    D --> G[Mode 3: Texture analysis]
    D --> H[Mode 4: Pores detection]
    D --> I[Mode 5: UV spots]
    D --> J[Mode 6: Brown spots]
    D --> K[Mode 7: Red areas]
    D --> L[Mode 8: Porphyrins]

    E --> M[Aggregate results]
    F --> M
    G --> M
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M

    M --> N[Generate visualization]
    N --> O[Return JSON response]
\`\`\`

**สถานะจริง:** AI service แยกอยู่ แต่ integration ไม่ seamless

---

## 💾 Data Flow จริง

### 6. Skin Analysis Data Flow

\`\`\`mermaid
graph TD
    A[User uploads image] --> B[Store in Supabase Storage]
    B --> C[Get public URL]

    C --> D[Send URL to AI processing]
    D --> E[AI analyzes image]

    E --> F[Return analysis results]
    F --> G[Store in skin_analyses table]

    G --> H{User logged in?}
    H -->|Yes| I[Link to user account]
    H -->|No| J[Store anonymously]

    I --> K[Generate analysis ID]
    J --> K

    K --> L[Create heatmap overlay]
    L --> M[Store overlay image]

    M --> N[Return results to user]
    N --> O[User views analysis]
\`\`\`

---

### 7. Real-time Features Flow

\`\`\`mermaid
graph TD
    A[User opens app] --> B[Connect to Supabase realtime]
    B --> C[Subscribe to announcements]

    C --> D[Socket.IO server running?]
    D -->|Yes| E[Connect for video calls]
    D -->|No| F[Use WebRTC direct]

    E --> G[Room management active]
    F --> H[Peer-to-peer calls]

    G --> I[Real-time chat available]
    H --> I

    I --> J[Presence indicators]
    J --> K[Live notifications]
\`\`\`

**ปัญหาจริง:** WebSocket server ไม่ integrated เต็มรูปแบบ

---

## 🔄 API Flows จริง

### 8. Analysis API Flow

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Route
    participant S as Supabase
    participant AI as AI Service

    U->>F: Upload image
    F->>A: POST /api/skin-analysis/analyze
    A->>S: Auth check
    A->>AI: Send image for analysis
    AI->>A: Return results
    A->>S: Store analysis data
    A->>F: Return analysis ID
    F->>U: Show results
\`\`\`

---

### 9. Booking API Flow

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Route
    participant S as Supabase

    U->>F: Request booking
    F->>A: POST /api/bookings/create
    A->>S: Check availability
    S->>A: Return available slots
    A->>S: Create booking record
    S->>A: Booking created
    A->>F: Return booking details
    F->>U: Show confirmation
\`\`\`

---

## 🎨 AR/VR Flows จริง

### 10. AR Treatment Simulator Flow

\`\`\`mermaid
graph TD
    A[User selects treatment] --> B[Load 3D model]
    B --> C[Initialize PIXI.js canvas]

    C --> D[Apply treatment effect]
    D --> E[Real-time rendering]

    E --> F[User adjusts intensity]
    F --> G[Update shader parameters]

    G --> H[Generate before/after]
    H --> I[Show comparison slider]

    I --> J[Export simulation image]
    J --> K[Share or save]
\`\`\`

---

## 📱 Mobile-Specific Flows จริง

### 11. PWA Installation Flow

\`\`\`mermaid
graph TD
    A[User visits site on mobile] --> B[Check PWA criteria]
    B --> C{Installable?}

    C -->|Yes| D[Show install prompt]
    C -->|No| E[Show manual install instructions]

    D --> F{User accepts?}
    F -->|Yes| G[Install PWA]
    F -->|No| H[Continue as web app]

    G --> I[App installed on home screen]
    I --> J[Launch as native app]
\`\`\`

---

## 🔐 Security Flows จริง

### 12. Authentication & Authorization Flow

\`\`\`mermaid
graph TD
    A[User attempts access] --> B[Check session cookie]
    B --> C{Valid session?}

    C -->|Yes| D[Check user role]
    C -->|No| E[Redirect to login]

    D --> F{Required role?}
    F -->|Yes| G[Grant access]
    F -->|No| H[Access denied]

    G --> I[Apply RLS policies]
    I --> J[Filter data by user/tenant]
\`\`\`

---

## 🚀 Deployment Flows จริง

### 13. Development Deployment Flow

\`\`\`mermaid
graph TD
    A[Developer pushes code] --> B[GitHub Actions trigger]
    B --> C[Run tests]

    C --> D{Tests pass?}
    D -->|Yes| E[Build Next.js app]
    D -->|No| F[Fail deployment]

    E --> G[Deploy to Vercel]
    G --> H[Update environment]

    H --> I[Run health checks]
    I --> J{Health OK?}

    J -->|Yes| K[Deployment successful]
    J -->|No| L[Rollback]
\`\`\`

**ความเป็นจริง:** Dev server ไม่รันได้ - บล็อก deployment

---

## 📊 Monitoring Flows จริง

### 14. Error Tracking Flow

\`\`\`mermaid
graph TD
    A[Error occurs] --> B[Capture error details]
    B --> C[Send to logging service]

    C --> D[Store in database]
    D --> E[Alert developers]

    E --> F[Analyze error patterns]
    F --> G[Identify root cause]

    G --> H[Deploy fix]
    H --> I[Monitor for recurrence]
\`\`\`

**ความเป็นจริง:** Monitoring ไม่ implement เต็มรูปแบบ

---

## 🎯 Business Logic Flows จริง

### 15. Lead Scoring Flow

\`\`\`mermaid
graph TD
    A[New lead created] --> B[Analyze lead data]
    B --> C[Calculate engagement score]

    C --> D[Check interaction history]
    D --> E[Update lead score]

    E --> F{Score > threshold?}
    F -->|Yes| G[Mark as hot lead]
    F -->|No| H[Keep in nurturing]

    G --> I[Notify sales team]
    I --> J[Prioritize in dashboard]
\`\`\`

---

## 📈 Analytics Flows จริง

### 16. Performance Tracking Flow

\`\`\`mermaid
graph TD
    A[User action] --> B[Track event]
    B --> C[Send to analytics]

    C --> D[Process in real-time]
    D --> E[Update dashboards]

    E --> F[Generate insights]
    F --> G[Store in database]

    G --> H[Trigger alerts if needed]
    H --> I[Notify stakeholders]
\`\`\`

---

## 🔧 Maintenance Flows จริง

### 17. Database Migration Flow

\`\`\`mermaid
graph TD
    A[Schema change needed] --> B[Create migration file]
    B --> C[Test migration locally]

    C --> D{Tests pass?}
    D -->|Yes| E[Deploy to staging]
    D -->|No| F[Fix migration]

    E --> G[Test on staging data]
    G --> H{Staging OK?}

    H -->|Yes| I[Deploy to production]
    H -->|No| J[Rollback staging]

    I --> K[Update RLS policies]
    K --> L[Validate data integrity]
\`\`\`

---

## 📋 Summary: Flow Coverage จริง

| Flow Category | Status | Coverage | Issues |
|---------------|--------|----------|--------|
| **User Journeys** | 🟡 Partial | 70% | Mock data, incomplete booking |
| **AI Processing** | 🟡 Works | 80% | Hardcoded VISIA scores |
| **Data Management** | ✅ Working | 90% | Good Supabase integration |
| **API Communications** | ✅ Working | 85% | Some endpoints incomplete |
| **Real-time Features** | 🟡 Partial | 60% | WebSocket not fully integrated |
| **Security** | ✅ Working | 90% | RLS policies active |
| **Deployment** | 🔴 Blocked | 20% | Dev server crash |
| **Monitoring** | 🟡 Basic | 40% | No advanced monitoring |
| **Mobile/PWA** | ✅ Working | 80% | Good mobile optimization |
| **AR/VR** | ✅ Working | 85% | PIXI.js + Three.js working |

---

## 🎯 Next Steps for Flow Improvements

1. **Fix Critical Issues:**
   - Resolve dev server crash
   - Remove hardcoded VISIA values
   - Implement proper error handling

2. **Complete Incomplete Flows:**
   - Full booking system integration
   - WebSocket server integration
   - Advanced monitoring setup

3. **Add Missing Flows:**
   - Payment processing
   - Notification system
   - Advanced analytics

---

**Document Status:** 🟡 Actively Updated  
**Last Reviewed:** 9 พฤศจิกายน 2025  
**Next Review:** After critical fixes
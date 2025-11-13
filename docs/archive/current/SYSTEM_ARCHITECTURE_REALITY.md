# 🏗️ AI367 Beauty Platform - System Architecture จริง

**Version:** 1.0 (ความเป็นจริง)  
**Last Updated:** 9 พฤศจิกายน 2025  
**Current Stack:** Free-Tier AI + Next.js 16 + Supabase + Python AI Service  
**สถานะ:** ทำงานได้ 70% (มี mock data และ hardcoded values)

> ⚠️ **เอกสารนี้สะท้อนความเป็นจริง:** อิงจากโค๊ดที่ตรวจสอบได้ ไม่ใช่ planning documents

---

## 📊 System Overview จริง

### High-Level Architecture ที่ใช้งานจริง

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                          │
│  Next.js 16 (React 19) + TypeScript + Tailwind CSS         │
│  - 49 Pages (App Router)                                    │
│  - Components 100+ (shadcn/ui + custom)                     │
│  - PWA Support (Service Worker + Manifest)                 │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/HTTPS (REST + Server Actions)
┌─────────────────▼───────────────────────────────────────────┐
│                      API LAYER (Next.js)                    │
│  - 50+ API Routes (app/api/**/route.ts)                    │
│  - Server Components + Middleware                          │
│  - Supabase Auth + RLS Policies                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐    ┌──────────────────────┐
│   AI LAYER    │    │   DATABASE LAYER     │
│  (Python FastAPI) │    │   (Supabase)         │
└───────────────┘    └──────────────────────┘
\`\`\`

**ความเป็นจริง:** AI Layer แยกเป็น service อิสระ (Python) ไม่ได้ integrate เต็มรูปแบบ

---

## 🤖 AI Analysis Layer จริง (ทำงานได้ 70-80%)

### Architecture Pattern: Hybrid Multi-Source (แต่มี mock data)

\`\`\`
User Image Upload
    │
    ▼
┌─────────────────────────────────────────────┐
│  Hybrid Skin Analyzer Orchestrator          │
│  (lib/ai/hybrid-skin-analyzer.ts)           │
│  ❌ ปัญหา: มี hardcoded values              │
└─────┬───────────────────────────────────────┘
      │
      ├─────────────────────┬─────────────────┐
      ▼                     ▼                 ▼
┌──────────────┐   ┌─────────────────┐  ┌────────────┐
│  Hugging     │   │  6 CV           │  │  Google    │
│  Face API    │   │  Algorithms     │  │  Vision    │
│  (Primary)   │   │  (ทำงานได้)     │  │  (พร้อมแต่ │
│              │   │                 │  │  ไม่ได้ใช้)│
└──────┬───────┘   └────────┬────────┘  └─────┬──────┘
       │                    │                  │
       │  AI-based         │  Heuristic        │  Face
       │  Detection        │  Analysis         │  Detection
       ▼                    ▼                  ▼
┌───────────────────────────────────────────────────┐
│  Result Aggregator + VISIA Mapper                 │
│  - รวมคะแนน AI confidence                         │
│  - Map เป็น 8 VISIA metrics (spots, pores, etc.) │
│  ❌ ปัญหา: VISIA scores ฮาร์ดโค้ด (7, 2, 1.5)    │
└───────────────────┬───────────────────────────────┘
                    ▼
            ┌──────────────┐
            │  JSON Result │
            │  + Image URL │
            └──────────────┘
\`\`\`

### Component Details จริง

#### 1. Hugging Face Inference API (Primary - แต่มี fallback)

**File:** `lib/ai/huggingface-analyzer.ts`

**Models ที่ใช้:**
- `facebook/deit-base-distilled-patch16-224` - Vision Transformer
- `facebook/detr-resnet-50` - Object detection
- `google/vit-base-patch16-224` - Image classification

**API Endpoint:** `https://api-inference.huggingface.co/models/{model}`

**ปัญหาจริง:**
- ❌ Rate limiting บ่อย (free tier)
- ❌ Classifications ไม่เกี่ยวข้อง ("sunscreen", "face powder")
- ❌ Fallback เป็น mock data โดยปริยาย

#### 2. Computer Vision Algorithms (ทำงานได้จริง)

**Files:** `lib/cv/*.ts` (6 algorithms)

**Algorithms ที่ implement:**
1. **Spot Detector** - Gaussian blur + threshold + blob detection
2. **Pore Analyzer** - Sobel edge + Hough Circle + size classification
3. **Wrinkle Detector** - Shadow detection + Canny edge + Hough Line
4. **Texture Analyzer** - Local Binary Patterns + roughness calculation
5. **Color Analyzer** - RGB→HSV + pigmentation detection
6. **Redness Detector** - Red channel extraction + flood fill

**ข้อดีจริง:**
- ✅ Free (local processing)
- ✅ Fast (1-2 seconds รวม 6 algorithms)
- ✅ Deterministic (reproducible)
- ✅ No API dependencies

**ข้อเสียจริง:**
- ❌ Heuristic-based (ไม่ใช่ ML trained)
- ❌ 65-75% accuracy (ต่ำกว่า AI)
- ❌ Sensitive to lighting conditions

#### 3. Google Cloud Vision API (พร้อมใช้งานแต่ไม่ได้ใช้)

**File:** `lib/ai/google-vision-skin-analyzer.ts`

**Credentials:** `google-credentials.json` (service account)

**ปัญหา:** Configured แต่ไม่ actively used (Hugging Face preferred for cost)

---

## 🎨 AR/3D Visualization Layer จริง

### Component Architecture

\`\`\`
┌─────────────────────────────────────────────┐
│           AR Component Layer                │
│  (components/ar/*.tsx)                      │
└─────────┬───────────────────────────────────┘
          │
    ┌─────┴─────┬─────────┬─────────┬─────────┐
    ▼           ▼         ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ PIXI.js│ │Three.js│ │Media-│ │Canvas│ │WebGL │
│ Engine │ │ 3D     │ │ Pipe │ │ API  │ │      │
└────────┘ └────────┘ └──────┘ └──────┘ └──────┘
\`\`\`

#### 1. Treatment Simulator (PIXI.js) - ทำงานได้

**File:** `components/ar/treatment-simulator.tsx`

**Features:**
- 6 treatment effects (Botox, Filler, Laser, Peel, etc.)
- Real-time preview with intensity sliders
- Before/After comparison

#### 2. 3D Face Viewer (Three.js) - ทำงานได้

**File:** `components/ar/face-3d-viewer.tsx`

**Features:**
- 3D face model rendering
- Heatmap overlay (color-coded severity)
- Auto-rotation + zoom controls

#### 3. MediaPipe Face Mesh - มีปัญหา

**File:** `lib/ar/mediapipe-face-mesh.ts`

**ปัญหาจริง:** Silent fallback to fake data เมื่อ MediaPipe fails

---

## 🗄️ Database Layer จริง (Supabase PostgreSQL)

### Schema ที่ใช้งานจริง

\`\`\`sql
-- Multi-tenant system
users ─────┐
           ├──> tenants (clinics)
           │
           ├──> user_profiles (preferences)
           │
           └──> skin_analyses ──┬──> treatment_plans
                                └──> bookings

-- Storage
skin-analysis-images/ (Supabase Storage)
  ├── {user_id}/
  │   ├── {analysis_id}_original.jpg
  │   └── {analysis_id}_analyzed.jpg
\`\`\`

### Key Tables จริง

#### `skin_analyses` (Core Table - ทำงานได้)
\`\`\`sql
CREATE TABLE skin_analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  booking_id VARCHAR(50) REFERENCES bookings(id),
  
  -- Images
  image_url TEXT NOT NULL,
  image_thumbnail_url TEXT,
  
  -- Analysis results (แต่มีปัญหา hardcoded)
  overall_score NUMERIC(5, 2), -- คำนวณได้ แต่ VISIA scores ฮาร์ดโค้ด
  skin_health_grade VARCHAR(2), -- A+, A, B+, B, C+, C, D, F
  
  -- Individual scores (0-100)
  spots_score NUMERIC(5, 2),
  wrinkles_score NUMERIC(5, 2),
  texture_score NUMERIC(5, 2),
  pores_score NUMERIC(5, 2),
  uv_spots_score NUMERIC(5, 2),
  brown_spots_score NUMERIC(5, 2),
  red_areas_score NUMERIC(5, 2),
  porphyrins_score NUMERIC(5, 2),
  
  -- Detection counts
  spots_count INTEGER,
  wrinkles_count INTEGER,
  pores_count INTEGER,
  -- ... etc
  
  -- Detailed results (JSON from AI)
  spots_detections JSONB,
  wrinkles_detections JSONB,
  -- ... etc
  
  -- Processing metadata
  processing_time_ms INTEGER,
  ai_model_version VARCHAR(50),
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
\`\`\`

### RLS Policies จริง

**Users can view own analyses:**
\`\`\`sql
CREATE POLICY "Users can view own analyses"
ON skin_analyses FOR SELECT
USING (auth.uid() = user_id);
\`\`\`

---

## 🔌 API Layer จริง (Next.js App Router)

### API Design Pattern: RESTful + Server Actions

#### REST APIs ที่มี (50+ routes)

**Skin Analysis:**
- `POST /api/skin-analysis/analyze` - Upload + analyze
- `GET /api/skin-analysis/history` - List user analyses
- `GET /api/skin-analysis/[id]` - Get single analysis

**User Management:**
- `GET /api/user/profile` - Get profile
- `PATCH /api/user/profile` - Update profile

**Bookings:**
- `POST /api/bookings/create` - Schedule appointment
- `GET /api/schedule/availability` - Check availability

#### ปัญหาจริง:
- ❌ บาง API อาจมี mock responses
- ❌ Error handling ไม่ครบถ้วน
- ❌ Authentication middleware อาจมีช่องโหว่

---

## 🚀 Frontend Layer จริง (Next.js 16 + React 19)

### Page Structure ที่มีจริง (49 pages)

\`\`\`
app/
├── page.tsx                    # Landing page (SSG)
├── analysis/
│   ├── page.tsx               # Upload interface (SSR)
│   ├── results/page.tsx       # Results with heatmap (SSR)
│   └── history/page.tsx       # History (ISR)
├── ar-simulator/page.tsx      # AR simulator (CSR)
├── dashboard/page.tsx         # User dashboard (SSR)
├── sales/
│   └── dashboard/page.tsx     # Hot leads manager (SSR)
└── ... (46 more pages)
\`\`\`

### Rendering Strategies จริง

| Page Type | Strategy | Status |
|-----------|----------|--------|
| Landing | SSG | ✅ ทำงานได้ |
| Analysis Upload | SSR | ✅ ทำงานได้ |
| Results | SSR | 🟡 มีปัญหา VISIA scores |
| History | ISR | ✅ ทำงานได้ |
| AR Simulator | CSR | ✅ ทำงานได้ |

---

## 🔐 Security Architecture จริง

### Authentication Flow (Supabase Auth)

\`\`\`
User Login
    ↓
Supabase Auth (JWT issued)
    ↓
Middleware (verify JWT)
    ↓
Server Action / API Route
    ↓
RLS Policy Check (Supabase)
    ↓
Data Access Granted/Denied
\`\`\`

### Authorization Levels จริง

| Role | Permissions | Status |
|------|-------------|--------|
| `customer` | View own analyses, book appointments | ✅ |
| `premium_customer` | + Advanced AR features | 🟡 |
| `clinic_staff` | + View clinic analyses | ✅ |
| `clinic_admin` | + Manage staff, edit clinic settings | ✅ |
| `super_admin` | + View all tenants | ✅ |

---

## 📊 Monitoring & Observability จริง

### Current Status: ไม่ได้ implement เต็มรูปแบบ

**ที่มี:**
- Vercel Analytics (built-in)
- Basic error logging

**ไม่มี:**
- ❌ Sentry (error tracking)
- ❌ Performance monitoring
- ❌ AI model performance tracking
- ❌ Database query performance

---

## 🔄 Alternative Architectures (Planning vs Reality)

### Path A: AI Gateway Multi-Model (Planning)
- ใช้ Vercel AI Gateway
- 3 models: GPT-4o, Claude 3.5, Gemini 2.0
- Cost: ฿30-50 per analysis

### Path B: VISIA-Parity Hardware (Planning)
- Hardware augmentation
- UV/polarized imaging
- Cost: $5,000-10,000

### Reality: Free-Tier Hybrid (Current)
- Hugging Face + 6 CV algorithms
- Cost: ฿0 (แต่มี mock data)
- Accuracy: 70-80% (แต่ VISIA scores ฮาร์ดโค้ด)

---

## 📚 Related Documentation จริง

- **CURRENT_PROJECT_STATUS_REALITY.md** - สถานะปัจจุบันจริง
- **ROADMAP.md** - แผนการพัฒนา (planning)
- **ARCHITECTURE.md** - Architecture ตาม planning (ไม่ใช่ reality)
- **docs/api/** - API documentation (บางส่วน)

---

## 🔄 Architecture Review จริง

เอกสารนี้ควร review และ update:
- **Weekly** - เมื่อมี code changes
- **After major fixes** - เช่นแก้ VISIA hardcoded values
- **Before deployment** - เพื่อ validate architecture

**Next Review:** 16 พฤศจิกายน 2025

---

**Maintained by:** Development Team  
**Stakeholders:** Tech Lead, Engineers  
**Approval:** Required for architecture changes
# 🏗️ AI367 Beauty Platform - System Architecture

**Version:** 1.0 (Master Document)  
**Last Updated:** January 2025  
**Current Stack:** Free-Tier AI + Next.js 16 + Supabase  
**Alternative Stacks:** Documented for future consideration

> ⚠️ **NOTE:** This document describes the ACTUAL implemented architecture.  
> See `ROADMAP.md` for alternative strategies (AI Gateway, VISIA Parity).

---

## 📊 System Overview

### High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                          │
│  Next.js 16 (React 19) + TypeScript + Tailwind CSS         │
│  - 49 Pages (SSR + CSR)                                     │
│  - 6 AR Components (PIXI.js + Three.js + MediaPipe)        │
│  - Responsive UI (Mobile-first)                             │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/HTTPS (REST + Server Actions)
┌─────────────────▼───────────────────────────────────────────┐
│                      API LAYER (Next.js)                    │
│  - 50+ API Routes (app/api/**/route.ts)                    │
│  - Server Components (React Server Components)             │
│  - Middleware (Authentication + Session Management)        │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐    ┌──────────────────────┐
│   AI LAYER    │    │   DATABASE LAYER     │
│  (Node.js)    │    │   (Supabase)         │
└───────────────┘    └──────────────────────┘
\`\`\`

---

## 🤖 AI Analysis Layer (Current Implementation)

### Architecture Pattern: Hybrid Multi-Source

\`\`\`
User Image Upload
    │
    ▼
┌─────────────────────────────────────────────┐
│  Hybrid Skin Analyzer Orchestrator          │
│  (lib/ai/hybrid-skin-analyzer.ts)           │
└─────┬───────────────────────────────────────┘
      │
      ├─────────────────────┬─────────────────┐
      ▼                     ▼                 ▼
┌──────────────┐   ┌─────────────────┐  ┌────────────┐
│  Hugging     │   │  6 CV           │  │  Google    │
│  Face API    │   │  Algorithms     │  │  Vision    │
│  (Primary)   │   │  (Supplement)   │  │  (Backup)  │
└──────┬───────┘   └────────┬────────┘  └─────┬──────┘
       │                    │                  │
       │  AI-based         │  Heuristic        │  Face
       │  Detection        │  Analysis         │  Detection
       ▼                    ▼                  ▼
┌───────────────────────────────────────────────────┐
│  Result Aggregator + VISIA Mapper                 │
│  - Combines AI confidence scores                  │
│  - Maps to 8 VISIA metrics (spots, pores, etc.)  │
│  - Generates recommendations                      │
└───────────────────┬───────────────────────────────┘
                    ▼
            ┌──────────────┐
            │  JSON Result │
            │  + Image URL │
            └──────────────┘
\`\`\`

### Component Details

#### 1. Hugging Face Inference API (Primary)

**File:** `lib/ai/huggingface-analyzer.ts`

**Models:**
- `facebook/deit-base-distilled-patch16-224` - Vision Transformer for feature extraction
- `facebook/detr-resnet-50` - Object detection (segmentation)
- `google/vit-base-patch16-224` - Image classification

**API Endpoint:** `https://api-inference.huggingface.co/models/{model}`

**Request Format:**
\`\`\`typescript
// Binary blob (not JSON)
const blob = await imageDataToBlob(imageData)
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/octet-stream'
  },
  body: blob
})
\`\`\`

**Response Processing:**
\`\`\`typescript
// Feature extraction → analyze skin condition
const result = await analyzer.analyzeSkin(imageData)
// Returns: { features, segmentation, classification }

// Map to dermatology terms
const skinCondition = analyzer.analyzeSkinCondition(result.classification)
// Returns: { condition: 'wrinkles'|'pigmentation'|'oily'|'dry', severity: 0-100, confidence: 0-1 }
\`\`\`

**Strengths:**
- ✅ Free tier (no cost)
- ✅ Fast inference (~11 seconds)
- ✅ 70-80% accuracy (generic vision)

**Limitations:**
- ❌ Generic models (not dermatology-specific)
- ❌ Classifications may be off-topic ("sunscreen", "face powder" instead of skin conditions)
- ❌ Rate limiting on free tier (unknown exact limits)

---

#### 2. Computer Vision Algorithms (Supplemental)

**Files:** `lib/cv/*.ts` (6 separate algorithms)

##### A. Spot Detector (`spot-detector.ts`)
\`\`\`typescript
export async function detectSpots(imageData: ImageData): Promise<SpotDetectionResult>
\`\`\`
**Algorithm:**
1. Convert to grayscale
2. Apply Gaussian blur (reduce noise)
3. Threshold segmentation (dark spots = pigmentation)
4. Blob detection (connected component analysis)
5. Flood fill to measure spot size

**Output:** Array of spots with `{ x, y, width, height, severity }`

##### B. Pore Analyzer (`pore-analyzer.ts`)
\`\`\`typescript
export async function analyzePores(imageData: ImageData): Promise<PoreAnalysisResult>
\`\`\`
**Algorithm:**
1. Sobel edge detection (find pore boundaries)
2. Hough Circle Transform (detect circular pores)
3. Size classification (small/medium/large)
4. Density calculation (pores per square cm)

**Output:** `{ count, avgSize, density, severity }`

##### C. Wrinkle Detector (`wrinkle-detector.ts`)
\`\`\`typescript
export async function detectWrinkles(imageData: ImageData): Promise<WrinkleDetectionResult>
\`\`\`
**Algorithm:**
1. Shadow detection (wrinkles = shadows)
2. Canny edge detection (line detection)
3. Hough Line Transform (find straight/curved lines)
4. Depth estimation (multi-angle if available)

**Output:** `{ lines, depth, severity }`

##### D. Texture Analyzer (`texture-analyzer.ts`)
\`\`\`typescript
export async function analyzeTexture(imageData: ImageData): Promise<TextureResult>
\`\`\`
**Algorithm:**
1. Local Binary Patterns (LBP) - texture descriptor
2. Roughness calculation (variance in pixel intensity)
3. Smoothness score (inverse of roughness)

**Output:** `{ smoothness: 0-100, roughness: 0-100 }`

##### E. Color Analyzer (`color-analyzer.ts`)
\`\`\`typescript
export async function analyzeColor(imageData: ImageData): Promise<ColorAnalysisResult>
\`\`\`
**Algorithm:**
1. RGB → HSV conversion
2. Dominant color extraction
3. Pigmentation detection (dark vs light areas)
4. Evenness calculation (color variance)

**Output:** `{ skinTone, pigmentation, evenness }`

##### F. Redness Detector (`redness-detector.ts`)
\`\`\`typescript
export async function detectRedness(imageData: ImageData): Promise<RednessResult>
\`\`\`
**Algorithm:**
1. Red channel extraction (R from RGB)
2. Threshold for redness (R > threshold)
3. Flood fill to identify red areas
4. Inflammation scoring

**Output:** `{ redAreas: [...], severity, inflammation }`

**Strengths:**
- ✅ Completely free (local processing)
- ✅ Fast (1-2 seconds total for all 6)
- ✅ Deterministic (reproducible results)
- ✅ No API dependencies

**Limitations:**
- ❌ Heuristic-based (not ML-trained)
- ❌ 65-75% accuracy (lower than AI)
- ❌ Sensitive to lighting conditions

---

#### 3. Google Cloud Vision API (Backup)

**File:** `lib/ai/google-vision-skin-analyzer.ts`

**API Features:**
- Face detection (landmarks, bounding box)
- Label detection (image tagging)
- Dominant colors extraction

**Credentials:** `google-credentials.json` (service account key)

**Usage:**
\`\`\`typescript
import { analyzeSkinWithVision } from '@/lib/ai/google-vision-skin-analyzer'

const result = await analyzeSkinWithVision(imageBuffer)
// Returns: { confidence, skinType, concerns, recommendations }
\`\`\`

**Current Status:** Configured but NOT actively used (Hugging Face preferred for cost)

**Cost:**
- First 1,000 calls/month: FREE
- After 1,000: ฿5 per 1,000 calls
- Available credits: ฿9,665

**Use Case:** Fallback if Hugging Face rate-limited or unavailable

---

### Decision Matrix: When to Use Which AI Service

| Scenario | Use | Reason |
|----------|-----|--------|
| MVP / Low Budget | Hugging Face + 6 CV | ฿0 cost |
| Hugging Face Rate-Limited | Google Vision | Free tier available |
| High Accuracy Required | AI Gateway Multi-Model | 95-99% accuracy (see ROADMAP.md) |
| Medical-Grade Needed | VISIA Parity Hardware | 99% accuracy (see ROADMAP.md) |

---

## 🎨 AR/3D Visualization Layer

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

#### 1. Treatment Simulator (PIXI.js)

**File:** `components/ar/treatment-simulator.tsx`

**Technology:** PIXI.js (WebGL-accelerated 2D rendering)

**Features:**
- 6 treatment effects (Botox, Filler, Laser, Peel, Microneedling, Thread Lift)
- Real-time effect preview
- Intensity sliders (0-100%)
- Before/After comparison

**Effect Processing:**
\`\`\`typescript
// lib/ar/skin-effects.ts
export class SkinEffectProcessor {
  applyBotoxEffect(image, intensity): ProcessedImage
  applyFillerEffect(image, intensity): ProcessedImage
  applyLaserEffect(image, intensity): ProcessedImage
  // ... etc
}
\`\`\`

**Performance:**
- 60 FPS rendering
- GPU-accelerated filters
- Lazy loading of effect shaders

---

#### 2. 3D Face Viewer (Three.js)

**File:** `components/ar/face-3d-viewer.tsx`

**Technology:** Three.js + @react-three/fiber

**Features:**
- 3D face model rendering
- Heatmap overlay (color-coded severity)
- Auto-rotate animation
- Zoom controls (50-200%)

**3D Model Pipeline:**
\`\`\`typescript
Face Landmarks (468 points)
    ↓
Delaunay Triangulation (create mesh)
    ↓
Three.js BufferGeometry
    ↓
Texture mapping (original image)
    ↓
Heatmap overlay (ShaderMaterial)
\`\`\`

**Shaders:**
- Vertex shader: Position + UV mapping
- Fragment shader: Color blending (heatmap + texture)

---

#### 3. MediaPipe Face Mesh

**File:** `lib/ar/mediapipe-face-mesh.ts`

**Technology:** MediaPipe Face Mesh (Google)

**Features:**
- 468 facial landmarks detection
- Real-time tracking (30 FPS)
- Works in browser (WASM)

**Landmark Groups:**
- Face oval (17 points)
- Left eyebrow (8 points)
- Right eyebrow (8 points)
- Left eye (16 points)
- Right eye (16 points)
- Nose (9 points)
- Lips outer (12 points)
- Lips inner (8 points)
- Face mesh (394 points)

**Usage:**
\`\`\`typescript
import { detectFaceMesh } from '@/lib/ar/mediapipe-face-mesh'

const landmarks = await detectFaceMesh(videoElement)
// Returns: Array<{ x, y, z }> (468 points)
\`\`\`

---

## 🗄️ Database Layer (Supabase PostgreSQL)

### Schema Design

\`\`\`sql
-- Multi-tenant architecture
users ─────┐
           ├──> tenants (clinics)
           │
           ├──> user_profiles (preferences)
           │
           └──> skin_analyses ──┬──> treatment_plans
                                └──> bookings

-- Storage
skin-analysis-images/ (Supabase Storage Bucket)
  ├── {user_id}/
  │   ├── {analysis_id}_original.jpg
  │   └── {analysis_id}_analyzed.jpg
\`\`\`

### Key Tables

#### `skin_analyses` (Core Table)
\`\`\`sql
CREATE TABLE skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  
  -- Images
  image_url TEXT NOT NULL,
  analyzed_image_url TEXT,
  
  -- AI Results
  analysis_data JSONB NOT NULL, -- Full AI response
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- VISIA Metrics
  visia_spots INTEGER,
  visia_wrinkles INTEGER,
  visia_texture INTEGER,
  visia_pores INTEGER,
  visia_uv_spots INTEGER,
  visia_brown_spots INTEGER,
  visia_red_areas INTEGER,
  visia_porphyrins INTEGER,
  
  -- Metadata
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  analysis_tier TEXT CHECK (analysis_tier IN ('free', 'premium', 'clinical')),
  processing_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### Row Level Security (RLS)

**Policy 1: Users see own data**
\`\`\`sql
CREATE POLICY "Users can view own analyses"
ON skin_analyses FOR SELECT
USING (auth.uid() = user_id);
\`\`\`

**Policy 2: Clinic admins see clinic data**
\`\`\`sql
CREATE POLICY "Clinic admins see clinic analyses"
ON skin_analyses FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin'
  )
);
\`\`\`

**Policy 3: Super admins see all**
\`\`\`sql
CREATE POLICY "Super admins see all"
ON skin_analyses FOR ALL
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);
\`\`\`

---

## 🔌 API Layer (Next.js App Router)

### API Design Pattern: RESTful + Server Actions

#### REST APIs (50+ routes)

**Skin Analysis:**
- `POST /api/skin-analysis/analyze` - Upload + analyze
- `GET /api/skin-analysis/history` - List user analyses
- `GET /api/skin-analysis/[id]` - Get single analysis

**User Management:**
- `GET /api/user/profile` - Get profile
- `PATCH /api/user/profile` - Update profile

**Treatment Plans:**
- `GET /api/treatment-plans` - List plans
- `POST /api/treatment-plans` - Create plan

**Bookings:**
- `POST /api/bookings/create` - Schedule appointment
- `GET /api/schedule/availability` - Check availability

**Admin:**
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

#### Server Actions (React Server Components)

Used for:
- Form submissions (e.g., profile updates)
- Server-side mutations (e.g., delete analysis)
- Optimistic UI updates

---

## 🚀 Frontend Layer (Next.js 16 + React 19)

### Page Structure (49 pages)

\`\`\`
app/
├── page.tsx                    # Landing page (SSG)
├── analysis/
│   ├── page.tsx               # Upload page (SSR)
│   ├── results/page.tsx       # Results page (SSR)
│   ├── history/page.tsx       # History (SSR + ISR)
│   └── detail/[id]/page.tsx   # Detail page (SSG + revalidate)
├── ar-simulator/page.tsx      # AR simulator (CSR)
├── dashboard/page.tsx         # User dashboard (SSR)
├── admin/page.tsx             # Admin dashboard (SSR + protected)
└── ... (46 more pages)
\`\`\`

### Rendering Strategies

| Page Type | Strategy | Reason |
|-----------|----------|--------|
| Landing | SSG (Static Generation) | SEO + fast load |
| Analysis Upload | SSR (Server-Side Rendering) | Auth check |
| Results | SSR | Real-time data |
| History | ISR (Incremental Static Regeneration) | Cache + revalidate |
| Detail | SSG + revalidate | SEO + dynamic content |
| AR Simulator | CSR (Client-Side Rendering) | Heavy 3D rendering |

---

## 🔐 Security Architecture

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

### Authorization Levels

| Role | Permissions |
|------|-------------|
| `customer` | View own analyses, book appointments |
| `premium_customer` | + Advanced AR features, priority support |
| `clinic_staff` | + View clinic analyses, manage bookings |
| `clinic_admin` | + Manage staff, edit clinic settings |
| `super_admin` | + View all tenants, system configuration |

---

## 📊 Monitoring & Observability

### Recommended Tools (Not Yet Implemented)

**Application Performance:**
- Vercel Analytics (built-in)
- Sentry (error tracking)

**Database Performance:**
- Supabase Dashboard (query performance)
- pg_stat_statements (slow query log)

**AI Performance:**
- Custom logging (`lib/ai/logger.ts`)
- Processing time tracking (stored in `skin_analyses.processing_time_ms`)

---

## 🔄 Alternative Architectures (Future Consideration)

### Option A: AI Gateway Multi-Model

See `ROADMAP.md` → Path A for details.

**Changes Required:**
- Add `lib/ai/gateway-client.ts`
- Add `lib/ai/multi-model-analyzer.ts`
- Update `lib/ai/hybrid-skin-analyzer.ts` to use gateway

**Cost Impact:** +฿15,000-25,000/month

---

### Option B: VISIA-Parity Hardware

See `ROADMAP.md` → Path B for details.

**Changes Required:**
- Add hardware integration layer (`lib/hardware/`)
- Add UV/polarized image processing
- Train custom dermatology models
- Add calibration system

**Cost Impact:** +$5,000-10,000 (one-time hardware)

---

## 📚 Related Documentation

- **PROJECT_STATUS.md** - Current system status
- **ROADMAP.md** - Development roadmap (MVP + future paths)
- **DEPLOYMENT_GUIDE.md** - Production deployment steps
- **docs/api/** - API documentation (if created)

---

## 🔄 Architecture Review

This document is reviewed and updated:
- **Quarterly** - Major architecture changes
- **After scaling events** - Performance bottlenecks identified
- **Before major upgrades** - E.g., switching to AI Gateway

**Next Review:** April 2025

---

**Maintained by:** Engineering Team  
**Stakeholders:** CTO, Lead Engineers  
**Approval:** Required for architecture changes

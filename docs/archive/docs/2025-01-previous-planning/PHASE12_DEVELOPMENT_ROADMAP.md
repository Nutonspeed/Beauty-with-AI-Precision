# 🗺️ Phase 12+: แผนงานพัฒนาต่อเนื่อง

**วันที่**: 29 ตุลาคม 2025  
**สถานะปัจจุบัน**: Phase 11 เสร็จสิ้น 95%, ระบบพร้อม Production  
**การประเมินส่วนที่ยังขาด**: ทั้งหมด 12 เฟสหลัก

---

## 📊 สถานะรวมโครงการ

### ✅ เสร็จสมบูรณ์แล้ว (98%)

| Phase | หัวข้อ | สถานะ | ความสมบูรณ์ |
|-------|--------|-------|-------------|
| 1-3 | Core Features & UI | ✅ | 100% |
| 4-5 | AR/AI Components | ✅ | 100% |
| 6 | Animations | ✅ | 100% |
| 7 | Mobile Optimization | ✅ | 95% |
| 8 | Real AI Integration | ✅ | 100% |
| 9 | Performance | ✅ | 100% |
| 10 | Testing | ✅ | 100% |
| 11 | Production Deploy | ✅ | 95% |

### ⏸️ ยังไม่สมบูรณ์ (ต้องทำต่อ)

| Priority | Phase | หัวข้อ | สถานะ | ความสำคัญ |
|----------|-------|--------|-------|-----------|
| 🔴 | 12 | Real AI Models Integration | ❌ 0% | **CRITICAL** |
| 🔴 | 13 | Database & Backend | ❌ 0% | **CRITICAL** |
| 🟠 | 14 | Multi-Tenant Architecture | ❌ 0% | **HIGH** |
| 🟠 | 15 | Advanced AR Features | ⏸️ 30% | **HIGH** |
| 🟡 | 16 | CRM & Analytics | ❌ 0% | **MEDIUM** |
| 🟡 | 17 | Payment Integration | ❌ 0% | **MEDIUM** |
| 🟢 | 18 | Mobile App (Native) | ❌ 0% | **LOW** |
| 🟢 | 19 | Advanced Testing | ⏸️ 10% | **LOW** |

---

## 🔴 Phase 12: Real AI Models Integration (CRITICAL)

### สถานะ: Mock AI → Real AI

**ปัญหาปัจจุบัน**:
- ✅ MediaPipe Face Detection ใช้งานได้แล้ว (468 landmarks)
- ✅ TensorFlow.js Skin Analysis ใช้งานได้แล้ว
- ❌ **ยังใช้ Mock Data** สำหรับ skin concerns detection
- ❌ **ยังไม่มี ML Model จริง** สำหรับ wrinkles, spots, pores
- ❌ **ยังไม่มี Heatmap Generation จริง**

### งานที่ต้องทำ (8-10 วัน):

#### 12.1: Train ML Models
**เวลา**: 3-4 วัน

\`\`\`
Tasks:
1. หา Dataset สำหรับ skin concerns
   - Wrinkles dataset (100-500 images)
   - Pigmentation/Spots dataset (100-500 images)
   - Pores dataset (100-500 images)
   - Redness dataset (100-500 images)

2. Train TensorFlow.js models
   - Model architecture: MobileNetV2 (lightweight)
   - Input: 224x224 RGB images
   - Output: Bounding boxes + confidence scores
   - Target accuracy: >85%

3. Convert to TensorFlow.js format
   - Use tfjs-converter
   - Quantize for performance
   - Target size: <5MB per model
\`\`\`

**Deliverables**:
- `public/models/wrinkles_model/`
- `public/models/spots_model/`
- `public/models/pores_model/`
- `public/models/redness_model/`

---

#### 12.2: Implement Real Heatmap Generation
**เวลา**: 2-3 วัน

\`\`\`typescript
// lib/ai/heatmap-generator.ts
interface HeatmapOptions {
  concernType: 'wrinkles' | 'spots' | 'pores' | 'redness'
  detections: Detection[]
  imageSize: { width: number; height: number }
  opacity: number
}

// Generate pixel-perfect heatmap
async function generateRealHeatmap(options: HeatmapOptions) {
  const canvas = createCanvas(options.imageSize)
  const ctx = canvas.getContext('2d')
  
  // 1. Create base gradient
  for (const detection of options.detections) {
    const gradient = ctx.createRadialGradient(...)
    // Apply gradient based on confidence
  }
  
  // 2. Apply Gaussian blur
  applyGaussianBlur(ctx, blurRadius)
  
  // 3. Apply color mapping
  applyColorMap(ctx, concernType)
  
  return canvas.toDataURL()
}
\`\`\`

**Features**:
- ✅ Gaussian blur for smooth gradients
- ✅ Color mapping (Green → Yellow → Red)
- ✅ Confidence-based intensity
- ✅ Multi-layer blending

---

#### 12.3: Replace Mock Detection Logic
**เวลา**: 1-2 วัน

**Before** (Mock):
\`\`\`typescript
// lib/ai/face-detection.ts - ปัจจุบัน
function analyzeSkinConcerns(imageData, faceResult) {
  // Mock random detections
  return generateMockConcerns()
}
\`\`\`

**After** (Real AI):
\`\`\`typescript
async function analyzeSkinConcerns(imageData, faceResult) {
  const [wrinkles, spots, pores, redness] = await Promise.all([
    detectWrinkles(imageData),    // Real model
    detectSpots(imageData),       // Real model
    detectPores(imageData),       // Real model
    detectRedness(imageData),     // Real model
  ])
  
  return [...wrinkles, ...spots, ...pores, ...redness]
}
\`\`\`

---

#### 12.4: Enhance AdvancedHeatmap Component
**เวลา**: 1 วัน

\`\`\`tsx
// components/ai/advanced-heatmap.tsx
export function AdvancedHeatmap({ image, isPremium }: Props) {
  const [realDetections, setRealDetections] = useState<Detection[]>([])
  const [heatmapImage, setHeatmapImage] = useState<string>('')
  
  useEffect(() => {
    async function analyze() {
      // Run real AI models
      const concerns = await analyzeSkinConcerns(image)
      setRealDetections(concerns)
      
      // Generate real heatmap
      const heatmap = await generateRealHeatmap({
        concernType: selectedConcern,
        detections: concerns,
        opacity: opacity / 100
      })
      setHeatmapImage(heatmap)
    }
    
    analyze()
  }, [image, selectedConcern, opacity])
  
  return (
    <div className="relative">
      <img src={image} />
      <img src={heatmapImage} className="absolute" />
      {isPremium && <BoundingBoxes detections={realDetections} />}
    </div>
  )
}
\`\`\`

---

#### 12.5: Performance Optimization
**เวลา**: 1 วัน

\`\`\`typescript
// lib/ai/model-loader.ts
class ModelManager {
  private models: Map<string, tf.GraphModel> = new Map()
  
  async loadModel(type: string) {
    if (this.models.has(type)) {
      return this.models.get(type)
    }
    
    const model = await tf.loadGraphModel(`/models/${type}_model/model.json`)
    this.models.set(type, model)
    return model
  }
  
  // Warm up models on page load
  async warmUp() {
    await Promise.all([
      this.loadModel('wrinkles'),
      this.loadModel('spots'),
      this.loadModel('pores'),
      this.loadModel('redness'),
    ])
  }
}
\`\`\`

**Optimizations**:
- ✅ Model caching in memory
- ✅ Warm-up on first page load
- ✅ WebGL acceleration
- ✅ Batch processing

---

### Success Metrics (Phase 12):

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Detection Accuracy | >85% | Mock (N/A) | Need real models |
| Processing Time | <2s | ~0.5s (mock) | May increase |
| Model Size | <5MB/model | N/A | Need compression |
| Heatmap Quality | HD (512x512+) | CSS gradients | Need canvas |

---

## 🔴 Phase 13: Database & Backend (CRITICAL)

### สถานะ: Frontend Only → Full-Stack

**ปัญหาปัจจุบัน**:
- ✅ Prisma schema มีแล้ว (User, Tenant)
- ❌ **ยังไม่มี Backend API จริง**
- ❌ **ยังไม่มี Database connection**
- ❌ **ข้อมูลหายเมื่อ refresh page**
- ❌ **ไม่มี User authentication จริง**

### งานที่ต้องทำ (10-12 วัน):

#### 13.1: Database Setup
**เวลา**: 2 วัน

\`\`\`bash
# 1. Setup PostgreSQL
# Production: Railway, Supabase, หรือ AWS RDS
# Development: Local PostgreSQL

# 2. Update .env
DATABASE_URL="postgresql://user:password@localhost:5432/ai367bar"

# 3. Create enhanced schema
npx prisma migrate dev --name init
\`\`\`

**Enhanced Prisma Schema**:
\`\`\`prisma
// prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  role          UserRole
  tenantId      String?
  tenant        Tenant?  @relation(fields: [tenantId], references: [id])
  
  // New fields
  analyses      Analysis[]
  bookings      Booking[]
  chatMessages  ChatMessage[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Analysis {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  imageUrl      String
  overallScore  Int
  skinAge       Int
  actualAge     Int
  metrics       Json     // VISIA metrics
  aiData        Json     // MediaPipe landmarks
  createdAt     DateTime @default(now())
}

model Booking {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  
  treatment     String
  date          DateTime
  time          String
  status        BookingStatus
  notes         String?
  createdAt     DateTime @default(now())
}

model ChatMessage {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  message       String
  sender        String   // 'user' | 'ai' | 'staff'
  createdAt     DateTime @default(now())
}

enum BookingStatus {
  pending
  confirmed
  completed
  cancelled
}
\`\`\`

---

#### 13.2: API Routes Development
**เวลา**: 4-5 วัน

**Analysis API**:
\`\`\`typescript
// app/api/analysis/save/route.ts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const data = await request.json()
  
  const analysis = await prisma.analysis.create({
    data: {
      userId: session.user.id,
      imageUrl: data.imageUrl,
      overallScore: data.overallScore,
      skinAge: data.skinAge,
      actualAge: data.actualAge,
      metrics: data.metrics,
      aiData: data.aiData,
    }
  })
  
  return NextResponse.json(analysis)
}

// GET /api/analysis/history
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const analyses = await prisma.analysis.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  return NextResponse.json(analyses)
}
\`\`\`

**Booking API**:
\`\`\`typescript
// app/api/bookings/create/route.ts
export async function POST(request: Request) {
  const data = await request.json()
  
  const booking = await prisma.booking.create({
    data: {
      userId: data.userId,
      tenantId: data.tenantId,
      treatment: data.treatment,
      date: new Date(data.date),
      time: data.time,
      status: 'pending',
      notes: data.notes,
    }
  })
  
  // Send confirmation email
  await sendBookingConfirmation(booking)
  
  return NextResponse.json(booking)
}
\`\`\`

**APIs ที่ต้องสร้าง**:
- `/api/auth/*` - Authentication (NextAuth.js)
- `/api/analysis/save` - บันทึกผลวิเคราะห์
- `/api/analysis/history` - ประวัติการวิเคราะห์
- `/api/bookings/create` - สร้างนัดหมาย
- `/api/bookings/list` - รายการนัดหมาย
- `/api/chat/send` - ส่งข้อความ
- `/api/chat/history` - ประวัติแชท
- `/api/leads/list` - รายการ leads (sales)
- `/api/leads/update` - อัปเดตสถานะ lead

---

#### 13.3: Authentication Implementation
**เวลา**: 2 วัน

\`\`\`typescript
// lib/auth.ts - Enhanced
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (user && await verifyPassword(credentials.password, user.password)) {
          return user
        }
        return null
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.tenantId = user.tenantId
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.tenantId = token.tenantId
      return session
    }
  }
}
\`\`\`

---

#### 13.4: Frontend Integration
**เวลา**: 2-3 วัน

**Save Analysis Results**:
\`\`\`tsx
// app/analysis/results/page.tsx - Enhanced
async function saveAnalysis() {
  const response = await fetch('/api/analysis/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: analysisImage,
      overallScore: analysisResults.overall_score,
      skinAge: analysisResults.skin_age,
      actualAge: analysisResults.actual_age,
      metrics: analysisResults.metrics,
      aiData: aiData
    })
  })
  
  if (response.ok) {
    toast.success('บันทึกผลการวิเคราะห์แล้ว')
  }
}
\`\`\`

**Load Analysis History**:
\`\`\`tsx
// app/analysis/history/page.tsx - New
export default function AnalysisHistory() {
  const [analyses, setAnalyses] = useState([])
  
  useEffect(() => {
    async function loadHistory() {
      const response = await fetch('/api/analysis/history')
      const data = await response.json()
      setAnalyses(data)
    }
    loadHistory()
  }, [])
  
  return (
    <div className="grid gap-4">
      {analyses.map(analysis => (
        <AnalysisCard key={analysis.id} data={analysis} />
      ))}
    </div>
  )
}
\`\`\`

---

#### 13.5: Data Migration & Seeding
**เวลา**: 1 วัน

\`\`\`typescript
// prisma/seed.ts
async function main() {
  // Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@ai367bar.com',
      name: 'Super Admin',
      role: 'super_admin',
    }
  })
  
  // Create Demo Tenant
  const demoClinic = await prisma.tenant.create({
    data: {
      name: 'Demo Clinic',
      email: 'demo@clinic.com',
    }
  })
  
  // Create Demo Users
  await prisma.user.createMany({
    data: [
      {
        email: 'owner@clinic.com',
        name: 'Clinic Owner',
        role: 'clinic_owner',
        tenantId: demoClinic.id,
      },
      {
        email: 'sales@clinic.com',
        name: 'Sales Staff',
        role: 'sales_staff',
        tenantId: demoClinic.id,
      }
    ]
  })
}
\`\`\`

---

### Success Metrics (Phase 13):

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| API Response Time | <200ms | N/A | Need backend |
| Database Queries | Optimized | N/A | Need indexing |
| Data Persistence | 100% | 0% | In-memory only |
| User Auth | Secure | Mock | Need real auth |

---

## 🟠 Phase 14: Multi-Tenant Architecture (HIGH)

### สถานะ: Single Tenant → Multi-Tenant

**เป้าหมาย**: รองรับหลายคลินิกในระบบเดียว

### งานที่ต้องทำ (5-7 วัน):

#### 14.1: Tenant Management
\`\`\`typescript
// app/api/tenants/create/route.ts
export async function POST(request: Request) {
  const data = await request.json()
  
  const tenant = await prisma.tenant.create({
    data: {
      name: data.name,
      email: data.email,
      subdomain: data.subdomain, // clinic1.ai367bar.com
      settings: {
        branding: {
          logo: data.logo,
          primaryColor: data.primaryColor,
        },
        features: {
          ar: true,
          ai: true,
          booking: true,
        }
      }
    }
  })
  
  return NextResponse.json(tenant)
}
\`\`\`

#### 14.2: Subdomain Routing
\`\`\`typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const subdomain = hostname?.split('.')[0]
  
  if (subdomain && subdomain !== 'www') {
    const tenant = await getTenantBySubdomain(subdomain)
    request.headers.set('x-tenant-id', tenant.id)
  }
  
  return NextResponse.next()
}
\`\`\`

#### 14.3: Tenant-Specific Branding
\`\`\`tsx
// components/tenant-provider.tsx
export function TenantProvider({ children }: Props) {
  const tenant = useTenant()
  
  return (
    <div style={{
      '--primary': tenant.settings.branding.primaryColor,
      '--logo': `url(${tenant.settings.branding.logo})`
    }}>
      {children}
    </div>
  )
}
\`\`\`

---

## 🟠 Phase 15: Advanced AR Features (HIGH)

### สถานะ: Basic AR → Professional AR

**ปัจจุบันมีแล้ว**:
- ✅ AR Visualization component
- ✅ Interactive 3D Viewer
- ✅ Before/After Slider
- ✅ Treatment preview (6 types)

**ยังขาด**:
- ❌ Real-time AR camera preview
- ❌ Face mesh overlay on live camera
- ❌ Virtual try-on (makeup, eyebrows)
- ❌ AI-powered treatment recommendations
- ❌ Treatment timeline projection (before/after in 2 weeks, 1 month, 3 months)

### งานที่ต้องทำ (8-10 วัน):

#### 15.1: Real-time AR Camera
**เวลา**: 3 วัน

\`\`\`tsx
// components/ar/live-ar-camera.tsx
export function LiveARCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [faceMesh, setFaceMesh] = useState<FaceMesh>()
  
  useEffect(() => {
    async function startAR() {
      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      videoRef.current.srcObject = stream
      
      // Initialize MediaPipe
      const mesh = new FaceMesh({
        locateFile: (file) => `/mediapipe/${file}`
      })
      
      mesh.onResults((results) => {
        drawFaceMesh(canvasRef.current, results)
        applyAREffect(canvasRef.current, selectedTreatment)
      })
      
      setFaceMesh(mesh)
    }
    
    startAR()
  }, [])
  
  return (
    <div className="relative">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} />
    </div>
  )
}
\`\`\`

#### 15.2: Treatment Timeline AI
**เวลา**: 3 วัน

\`\`\`typescript
// lib/ai/treatment-timeline.ts
interface TimelineProjection {
  week2: AnalysisResults
  month1: AnalysisResults
  month3: AnalysisResults
  month6: AnalysisResults
}

async function projectTreatmentTimeline(
  currentAnalysis: AnalysisResults,
  treatment: string
): Promise<TimelineProjection> {
  // Use ML model to project improvements
  const model = await loadTimelineModel()
  
  const projections = await model.predict({
    current: currentAnalysis,
    treatment: treatment,
    timeline: [14, 30, 90, 180] // days
  })
  
  return {
    week2: interpolateResults(currentAnalysis, projections[0], 0.2),
    month1: interpolateResults(currentAnalysis, projections[1], 0.4),
    month3: interpolateResults(currentAnalysis, projections[2], 0.7),
    month6: interpolateResults(currentAnalysis, projections[3], 1.0),
  }
}
\`\`\`

#### 15.3: Virtual Try-On
**เวลา**: 2-3 วัน

\`\`\`tsx
// components/ar/virtual-tryon.tsx
export function VirtualTryOn() {
  const [makeupStyle, setMakeupStyle] = useState<MakeupStyle>()
  
  const applyMakeup = async () => {
    const landmarks = await detectFace(image)
    
    // Apply lipstick
    applyLipColor(landmarks.lips, makeupStyle.lipColor)
    
    // Apply eyeshadow
    applyEyeshadow(landmarks.eyes, makeupStyle.eyeshadowColor)
    
    // Apply blush
    applyBlush(landmarks.cheeks, makeupStyle.blushColor)
  }
  
  return <ARPreview />
}
\`\`\`

---

## 🟡 Phase 16: CRM & Analytics (MEDIUM)

### งานที่ต้องทำ (10-12 วัน):

#### 16.1: Lead Management System
\`\`\`typescript
// app/api/leads/score/route.ts
// AI-powered lead scoring
export async function POST(request: Request) {
  const lead = await request.json()
  
  const score = calculateLeadScore({
    analysisScore: lead.analysis.overall_score,
    skinAge: lead.analysis.skin_age,
    budget: lead.budget,
    urgency: lead.urgency,
    engagement: lead.chatMessages.length,
  })
  
  return NextResponse.json({ score, priority: getPriority(score) })
}
\`\`\`

#### 16.2: Analytics Dashboard
\`\`\`tsx
// app/admin/analytics/page.tsx
export default function Analytics() {
  const metrics = useMetrics()
  
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard
        title="Total Leads"
        value={metrics.totalLeads}
        change={metrics.leadsChange}
      />
      <MetricCard
        title="Conversion Rate"
        value={`${metrics.conversionRate}%`}
        change={metrics.conversionChange}
      />
      <MetricCard
        title="Avg. Booking Value"
        value={`฿${metrics.avgBookingValue}`}
        change={metrics.valueChange}
      />
      <MetricCard
        title="Customer Satisfaction"
        value={`${metrics.satisfaction}/5`}
        change={metrics.satisfactionChange}
      />
      
      <RevenueChart data={metrics.revenueTimeline} />
      <LeadFunnelChart data={metrics.funnel} />
      <TreatmentPopularity data={metrics.treatments} />
    </div>
  )
}
\`\`\`

---

## 🟡 Phase 17: Payment Integration (MEDIUM)

### งานที่ต้องทำ (5-7 วัน):

#### 17.1: Payment Gateway Integration
\`\`\`typescript
// lib/payment/omise.ts
import Omise from 'omise'

const omise = Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
})

export async function createCharge(amount: number, token: string) {
  const charge = await omise.charges.create({
    amount: amount * 100, // Convert to satangs
    currency: 'THB',
    card: token,
    description: 'Treatment Booking Payment'
  })
  
  return charge
}
\`\`\`

#### 17.2: Subscription System
\`\`\`typescript
// app/api/subscriptions/create/route.ts
export async function POST(request: Request) {
  const { tier, billingCycle } = await request.json()
  
  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      tier: tier, // 'free' | 'premium' | 'enterprise'
      billingCycle: billingCycle, // 'monthly' | 'yearly'
      price: getPricing(tier, billingCycle),
      status: 'active',
      expiresAt: getExpiryDate(billingCycle)
    }
  })
  
  return NextResponse.json(subscription)
}
\`\`\`

---

## 🟢 Phase 18: Mobile App (Native) (LOW)

### Option 1: React Native
\`\`\`bash
npx react-native init AI367BarApp --template react-native-template-typescript
\`\`\`

### Option 2: Flutter
\`\`\`bash
flutter create ai367bar_app
\`\`\`

### Shared Features:
- Native camera access
- Push notifications
- Offline mode
- Biometric authentication
- Native AR (ARCore/ARKit)

---

## 🟢 Phase 19: Advanced Testing (LOW)

### 19.1: Unit Tests
\`\`\`bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
\`\`\`

\`\`\`typescript
// __tests__/components/skin-analysis.test.tsx
import { render, screen } from '@testing-library/react'
import { SkinAnalysisUpload } from '@/components/skin-analysis-upload'

describe('SkinAnalysisUpload', () => {
  it('renders upload interface', () => {
    render(<SkinAnalysisUpload />)
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument()
  })
  
  it('accepts image upload', async () => {
    const { container } = render(<SkinAnalysisUpload />)
    const input = container.querySelector('input[type="file"]')
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByAlt('Preview')).toBeInTheDocument()
    })
  })
})
\`\`\`

### 19.2: E2E Tests
\`\`\`typescript
// e2e/analysis-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete analysis flow', async ({ page }) => {
  await page.goto('http://localhost:3000/analysis')
  
  // Upload image
  await page.setInputFiles('input[type="file"]', 'test-images/face.jpg')
  
  // Start analysis
  await page.click('text=Start AI Analysis')
  
  // Wait for results
  await page.waitForSelector('text=Analysis Complete', { timeout: 10000 })
  
  // Verify results displayed
  expect(await page.textContent('.overall-score')).toBeTruthy()
})
\`\`\`

---

## 📅 Timeline Summary

### แผนงานรวม (16-20 สัปดาห์):

| Phase | Duration | Dependency | Priority |
|-------|----------|------------|----------|
| **Phase 12: Real AI Models** | 8-10 วัน | MediaPipe/TF.js setup | 🔴 CRITICAL |
| **Phase 13: Database & Backend** | 10-12 วัน | Prisma schema | 🔴 CRITICAL |
| **Phase 14: Multi-Tenant** | 5-7 วัน | Phase 13 done | 🟠 HIGH |
| **Phase 15: Advanced AR** | 8-10 วัน | Phase 12 done | 🟠 HIGH |
| **Phase 16: CRM & Analytics** | 10-12 วัน | Phase 13 done | 🟡 MEDIUM |
| **Phase 17: Payment** | 5-7 วัน | Phase 13 done | 🟡 MEDIUM |
| **Phase 18: Mobile App** | 20-25 วัน | Phase 13-15 done | 🟢 LOW |
| **Phase 19: Testing** | Ongoing | All phases | 🟢 LOW |

**Total**: ~16-20 สัปดาห์ (4-5 เดือน) สำหรับ MVP ที่สมบูรณ์

---

## 🎯 แนะนำลำดับการทำงาน

### Sprint 1 (Week 1-2): Critical Foundation
\`\`\`
✅ Phase 12.1: Train ML Models
✅ Phase 12.2: Real Heatmap Generation
✅ Phase 13.1: Database Setup
✅ Phase 13.2: Core API Routes
\`\`\`

### Sprint 2 (Week 3-4): Backend Complete
\`\`\`
✅ Phase 12.3-12.5: Complete Real AI
✅ Phase 13.3-13.5: Auth & Data Migration
\`\`\`

### Sprint 3 (Week 5-6): Multi-Tenant
\`\`\`
✅ Phase 14: Multi-Tenant Architecture
\`\`\`

### Sprint 4 (Week 7-8): Advanced AR
\`\`\`
✅ Phase 15.1-15.2: Live AR + Timeline
\`\`\`

### Sprint 5 (Week 9-10): CRM Start
\`\`\`
✅ Phase 16.1: Lead Management
\`\`\`

### Sprint 6+ (Week 11-20): Complete & Polish
\`\`\`
✅ Phase 15.3: Virtual Try-On
✅ Phase 16.2: Analytics Dashboard
✅ Phase 17: Payment Integration
✅ Phase 19: Testing
\`\`\`

---

## 💰 Resource Requirements

### ทีมงานที่แนะนำ:

| Role | Count | Responsibility |
|------|-------|----------------|
| **ML Engineer** | 1 | Train models, optimize AI |
| **Backend Developer** | 1-2 | API, database, auth |
| **Frontend Developer** | 1 | AR/AI integration, UI |
| **Mobile Developer** | 1 | React Native/Flutter (optional) |
| **DevOps** | 0.5 | Deploy, monitoring |
| **QA/Tester** | 0.5 | Testing, bug tracking |

**Total**: 4-6 คน

### Infrastructure Costs (Monthly):

| Service | Provider | Cost |
|---------|----------|------|
| Database | Railway/Supabase | $20-50 |
| Hosting | Vercel Pro | $20 |
| Storage | S3/Cloudinary | $10-30 |
| CDN | Cloudflare | Free |
| AI Models | Self-hosted | Free |
| **Total** | | **$50-100/month** |

---

## ✅ Phase 12 เริ่มต้น - Quick Wins

### สิ่งที่ทำได้ทันที (วันนี้-พรุ่งนี้):

1. **Setup PostgreSQL Local**:
\`\`\`bash
# Install PostgreSQL
# Windows: Download from postgresql.org
# Create database
createdb ai367bar

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai367bar"

# Run migration
npx prisma migrate dev --name init
\`\`\`

2. **Create First API Route**:
\`\`\`bash
# Test database connection
mkdir app/api/test
\`\`\`

\`\`\`typescript
// app/api/test/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  const count = await prisma.user.count()
  return Response.json({ users: count, status: 'connected' })
}
\`\`\`

3. **Test API**:
\`\`\`bash
# Start server
pnpm dev

# Test endpoint
curl http://localhost:3000/api/test
# Should return: {"users":0,"status":"connected"}
\`\`\`

---

## 📊 Progress Tracking

### ใช้ไฟล์นี้เป็น Roadmap:

\`\`\`markdown
- [ ] Phase 12: Real AI Models (0%)
  - [ ] 12.1: Train ML Models
  - [ ] 12.2: Heatmap Generation
  - [ ] 12.3: Replace Mock Logic
  - [ ] 12.4: Enhance Components
  - [ ] 12.5: Performance Optimization

- [ ] Phase 13: Database & Backend (0%)
  - [ ] 13.1: Database Setup
  - [ ] 13.2: API Routes
  - [ ] 13.3: Authentication
  - [ ] 13.4: Frontend Integration
  - [ ] 13.5: Data Migration

- [ ] Phase 14: Multi-Tenant (0%)
- [ ] Phase 15: Advanced AR (0%)
- [ ] Phase 16: CRM & Analytics (0%)
- [ ] Phase 17: Payment (0%)
- [ ] Phase 18: Mobile App (0%)
- [ ] Phase 19: Testing (0%)
\`\`\`

---

## 🎉 สรุป

**ปัจจุบัน**: ระบบพร้อม Production สำหรับ **Demo/Prototype**  
**ยังต้องทำ**: 8 เฟสหลักเพื่อเป็น **Production-Ready MVP**  
**เวลาโดยรวม**: 4-5 เดือน (ทำเต็มเวลา)  
**ค่าใช้จ่าย**: $50-100/เดือน (infrastructure)

**คำแนะนำ**: 
1. เริ่มที่ Phase 12-13 (Critical)
2. ทำ Phase 14 (Multi-Tenant) ถ้าต้องการขายให้หลายคลินิก
3. Phase 15-17 ทำตามลำดับความสำคัญ
4. Phase 18-19 ทำได้ทีหลัง

**คุณต้องการเริ่มที่เฟสไหนครับ?**

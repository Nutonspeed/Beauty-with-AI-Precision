# 🚀 Quick Start - ระบบผลการวิเคราะห์ผิวหนัง

**สำหรับ:** Developer ที่จะเริ่มพัฒนาระบบ  
**อัพเดท:** 10 พฤศจิกายน 2025

---

## 📂 โครงสร้างไฟล์สำคัญ

### 🤖 AI/ML Core
```
lib/ai/
├── hybrid-analyzer.ts          # Main analyzer (MediaPipe + TF + HF)
├── mediapipe-analyzer-phase1.ts
├── tensorflow-analyzer.ts
├── huggingface-analyzer.ts
├── multi-model-analyzer.ts     # Cloud ensemble
├── analysis-mapper.ts          # Convert results to DB format
└── gateway-client.ts           # GPT-4o, Claude API

lib/cv/
├── pore-analyzer.ts
├── spot-detector.ts
└── wrinkle-detector.ts

lib/types/
└── skin-analysis.ts            # All TypeScript types
```

### 🛣️ API Routes
```
app/api/
├── analyze/route.ts            # POST - Main analysis endpoint
├── analysis/
│   ├── save/route.ts          # POST - Save results
│   ├── [id]/route.ts          # GET - Get single analysis
│   ├── compare/route.ts       # POST - Compare 2 analyses
│   ├── history/[userId]/route.ts
│   ├── share/route.ts
│   ├── visualize/route.ts
│   └── multi-mode/route.ts
```

### 🎨 UI Components
```
components/analysis/
├── AnalysisDetailClient.tsx    # Main detail page
├── visia-report.tsx           # VISIA-style report
├── enhanced-visia-report.tsx  # Advanced report
├── analysis-comparison.tsx
├── analysis-timeline.tsx
├── history-gallery.tsx
├── treatment-recommendations.tsx
├── product-recommendation.tsx
└── progress-dashboard.tsx

components/sales/presentation/
├── presentation-wizard.tsx     # Sales wizard
└── steps/
    ├── customer-step.tsx
    ├── scan-step.tsx
    └── analysis-step.tsx      # AI analysis step
```

### 📄 Pages
```
app/[locale]/analysis/
├── page.tsx                   # Upload page
├── results/page.tsx          # Results page
├── detail/[id]/page.tsx      # Detail page (main)
├── progress/page.tsx
└── multi-angle/page.tsx
```

### 💾 Database
```
Supabase Table: skin_analyses
├── id (uuid, primary key)
├── clinic_id (uuid)
├── customer_id (uuid)
├── analyzed_by (uuid)
├── image_url (text)
├── image_metadata (jsonb)
├── overall_score (numeric 0-100)
├── confidence_level (numeric 0-1)
├── metrics (jsonb)           # VISIA scores
├── concerns (text[])         # Array of concerns
├── recommendations (jsonb)   # AI recommendations
├── processing_time_ms (integer)
├── ai_model_version (text)
└── created_at (timestamp)
```

---

## 🔄 Data Flow ภาพรวม

```
1. User uploads image → SkinAnalysisUpload component
2. Process with Hybrid Analyzer (Browser AI)
3. POST /api/analyze (send results)
4. mapBrowserResultToAnalysis() (convert format)
5. POST /api/analysis/save (save to DB)
6. Redirect to /analysis/detail/[id]
7. AnalysisDetailClient displays results
```

---

## 🎯 งาน Priority สูง (เริ่มได้เลย)

### ✅ Task 1: เพิ่ม Patient Info (4 hours)

**ไฟล์ที่ต้องสร้าง:**
```
supabase/migrations/20241110_add_patient_info.sql
```

**SQL:**
```sql
ALTER TABLE skin_analyses 
ADD COLUMN patient_info JSONB DEFAULT '{}'::jsonb;

CREATE INDEX idx_skin_analyses_patient_name 
ON skin_analyses ((patient_info->>'name'));
```

**Types:**
```typescript
// types/supabase.ts - Add to skin_analyses Row
patient_info: {
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  skinType?: SkinType;
  medicalHistory?: string[];
} | null;
```

**Test:**
```bash
# Run migration
pnpm supabase migration up

# Test insert
curl -X POST /api/analysis/save \
  -H "Content-Type: application/json" \
  -d '{"patientInfo": {"name": "Test", "age": 30}}'
```

---

### ✅ Task 2: Patient Info Card Component (4 hours)

**สร้างไฟล์:**
```
components/analysis/patient-info-card.tsx
```

**Code:**
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Droplet } from 'lucide-react';

interface PatientInfoCardProps {
  patientInfo: {
    name: string;
    age?: number;
    gender?: string;
    skinType?: string;
  };
  analysisDate: Date;
  isBaseline?: boolean;
}

export function PatientInfoCard({ 
  patientInfo, 
  analysisDate,
  isBaseline 
}: PatientInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Patient Information
          {isBaseline && <Badge variant="outline">Baseline</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-semibold">{patientInfo.name}</p>
        </div>
        {patientInfo.age && (
          <div>
            <p className="text-sm text-muted-foreground">Age</p>
            <p className="font-semibold">{patientInfo.age} years</p>
          </div>
        )}
        {patientInfo.skinType && (
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Droplet className="w-4 h-4" /> Skin Type
            </p>
            <Badge variant="secondary">{patientInfo.skinType}</Badge>
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Analysis Date
          </p>
          <p className="font-semibold">
            {new Date(analysisDate).toLocaleDateString('th-TH')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

**เพิ่มใน AnalysisDetailClient.tsx:**
```typescript
import { PatientInfoCard } from './patient-info-card';

// ในส่วน render (หลัง header, ก่อน tabs)
{analysis.patient_info && (
  <PatientInfoCard 
    patientInfo={analysis.patient_info}
    analysisDate={analysis.created_at}
    isBaseline={analysis.is_baseline}
  />
)}
```

---

### ✅ Task 3: Loading Component (4 hours)

**สร้างไฟล์:**
```
components/ui/analysis-loading.tsx
```

**Code:**
```typescript
import { Card } from './card';
import { Progress } from './progress';
import { Loader2, Upload, Cpu, Save, CheckCircle } from 'lucide-react';

type LoadingStep = 'upload' | 'processing' | 'saving' | 'complete';

interface AnalysisLoadingProps {
  step: LoadingStep;
  progress: number; // 0-100
  message?: string;
}

const STEP_CONFIG = {
  upload: {
    icon: Upload,
    title: 'Uploading Image',
    titleTh: 'กำลังอัพโหลดรูปภาพ',
    color: 'text-blue-500'
  },
  processing: {
    icon: Cpu,
    title: 'AI Processing',
    titleTh: 'กำลังวิเคราะห์ด้วย AI',
    color: 'text-purple-500'
  },
  saving: {
    icon: Save,
    title: 'Saving Results',
    titleTh: 'กำลังบันทึกผล',
    color: 'text-green-500'
  },
  complete: {
    icon: CheckCircle,
    title: 'Complete',
    titleTh: 'เสร็จสมบูรณ์',
    color: 'text-green-600'
  }
};

export function AnalysisLoading({ 
  step, 
  progress, 
  message 
}: AnalysisLoadingProps) {
  const config = STEP_CONFIG[step];
  const Icon = config.icon;

  return (
    <Card className="p-8">
      <div className="text-center space-y-4">
        {step !== 'complete' ? (
          <Loader2 className={`w-12 h-12 animate-spin mx-auto ${config.color}`} />
        ) : (
          <Icon className={`w-12 h-12 mx-auto ${config.color}`} />
        )}
        
        <div>
          <h3 className="text-lg font-semibold">{config.titleTh}</h3>
          <p className="text-sm text-muted-foreground">{config.title}</p>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <p className="text-sm text-muted-foreground">
          {message || `${progress}% complete`}
        </p>
      </div>
    </Card>
  );
}
```

**ใช้งานใน skin-analysis-upload.tsx:**
```typescript
{isAnalyzing && (
  <AnalysisLoading 
    step={currentStep}
    progress={progress}
    message={statusMessage}
  />
)}
```

---

## 🧪 Testing Commands

```bash
# Run dev server
pnpm dev

# Run tests
pnpm test

# Run specific test
pnpm test analysis

# Build production
pnpm build

# Database
pnpm supabase migration up
pnpm supabase db reset

# Python AI service
cd ai-service
python -m uvicorn main:app --reload
```

---

## 📊 API Testing (Postman/Thunder Client)

### Analyze Image
```http
POST http://localhost:3000/api/analyze
Content-Type: application/json

{
  "result": {
    "faceDetection": {...},
    "skinAnalysis": {...}
  },
  "tier": "premium"
}
```

### Save Analysis
```http
POST http://localhost:3000/api/analysis/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://...",
  "concerns": ["acne", "dark_spots"],
  "metrics": {
    "spots": 65,
    "wrinkles": 45
  },
  "patientInfo": {
    "name": "John Doe",
    "age": 35
  }
}
```

### Get Analysis
```http
GET http://localhost:3000/api/analysis/[id]
Authorization: Bearer <token>
```

---

## 🐛 Common Issues & Solutions

### Issue 1: AI Models Loading Slowly
**Solution:** Add lazy loading
```typescript
const { analyzeWithHybrid } = await import('@/lib/ai/hybrid-analyzer');
```

### Issue 2: Image Upload Fails
**Check:**
- File size < 10MB
- MIME type is image/*
- Supabase storage bucket configured

### Issue 3: Analysis Not Saving
**Check:**
- User is authenticated
- RLS policies allow insert
- All required fields present

### Issue 4: Build Errors
```bash
# Clear cache
rm -rf .next
pnpm install
pnpm build
```

---

## 📚 Key Documentation Links

- **Architecture:** `docs/current/SKIN_ANALYSIS_SYSTEM_AUDIT.md`
- **Development Plan:** `docs/current/DEVELOPMENT_PLAN.md`
- **API Docs:** `docs/architecture/API_DOCUMENTATION.md`
- **Database Schema:** Check Supabase Dashboard

---

## 🎯 Next Steps (Week 1)

1. ✅ เพิ่ม Patient Info (Task 1)
2. ✅ สร้าง Patient Info Card (Task 2)
3. ✅ เพิ่ม Loading Component (Task 3)
4. ⬜ Update Analysis Save API (Task 1.2)
5. ⬜ Add Error Handling (Task 1.3)

---

## 💡 Tips for Developers

### 1. Always Check Types
```typescript
// Import types
import type { HybridAnalysisResult } from '@/lib/ai/hybrid-analyzer';
import type { Database } from '@/types/supabase';
```

### 2. Use Consistent Naming
- API Routes: kebab-case (`/api/analysis-history`)
- Components: PascalCase (`AnalysisCard`)
- Functions: camelCase (`analyzeImage`)
- Types: PascalCase (`AnalysisResult`)

### 3. Error Handling Pattern
```typescript
try {
  const result = await analyzeImage(imageData);
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error('Analysis failed:', error);
  return NextResponse.json(
    { success: false, error: 'Analysis failed' },
    { status: 500 }
  );
}
```

### 4. Use Supabase Client Correctly
```typescript
// Server component
import { createServerClient } from '@/lib/supabase/server';
const supabase = await createServerClient();

// Client component
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

---

## 🆘 Getting Help

1. **Documentation:** Check `docs/` folder
2. **Code Examples:** Look at existing components
3. **Supabase:** Check RLS policies and logs
4. **AI Service:** Check logs in `ai-service/`
5. **GitHub Issues:** Create issue with reproduction steps

---

*Quick Start Guide by GitHub Copilot*  
*Last Updated: November 10, 2025*

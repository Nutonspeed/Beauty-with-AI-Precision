# Sales Presentation Mode - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Components](#components)
5. [PDF Export](#pdf-export)
6. [Treatment Packages](#treatment-packages)
7. [Usage Guide](#usage-guide)
8. [Customization](#customization)
9. [API Integration](#api-integration)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [Future Enhancements](#future-enhancements)

---

## Overview

The **Sales Presentation Mode** is a professional full-screen presentation system designed for beauty clinics to showcase skin analysis results and treatment proposals to customers during consultations. It combines analysis data, treatment recommendations, pricing packages, and timelines in an elegant, easy-to-navigate interface optimized for sales demos.

### Key Benefits

- 📊 **Professional Presentation**: Full-screen mode with clinic branding
- 💰 **Treatment Packages**: Pre-configured packages with pricing and effectiveness metrics
- 📄 **PDF Export**: Generate branded treatment proposals instantly
- 🎨 **Clinic Branding**: Customizable colors, logos, and contact information
- 📈 **Side-by-Side Comparison**: Show before/after results with interactive slider
- ⌨️ **Keyboard Navigation**: Arrow keys for seamless navigation during demos
- 🌐 **Multi-Language**: Full Thai and English support

---

## Features

### 1. Full-Screen Presentation Mode

**Description**: Immersive full-screen experience for professional demos

**Key Features**:
- Toggle full-screen with keyboard shortcut (F11 or button)
- Escape key to exit full-screen
- Distraction-free interface optimized for customer presentations
- Clinic branding header with logo and colors

**Usage**:
```tsx
import { PresentationMode } from '@/components/presentation/presentation-mode';

<PresentationMode
  analysis={analysis}
  clinicInfo={{
    name: 'Your Clinic',
    logo: '/logo.png',
    brandColor: '#6366f1'
  }}
  locale="th"
/>
```

**Keyboard Shortcuts**:
- `F` or button: Toggle full-screen
- `Escape`: Exit full-screen
- `Arrow Right`: Next tab
- `Arrow Left`: Previous tab

---

### 2. Five-Tab Navigation System

**Tab 1: Overview**
- Overall skin health score (large display)
- Analysis confidence percentage
- Detailed concern breakdown with severity bars
- Skin photo display

**Tab 2: Comparison**
- Side-by-side before/after slider
- Score comparison with improvement percentages
- Color-coded progress indicators
- Interactive drag slider

**Tab 3: Treatments**
- Three treatment package cards
- Package details: treatments included, sessions, duration
- Expected improvement percentages
- Effectiveness breakdown by concern
- Badge highlights (Popular, Best Value, Comprehensive)

**Tab 4: Pricing**
- Detailed cost breakdown for each package
- Discount badges and savings calculations
- Price per session display
- Effectiveness metrics (spots, pores, wrinkles, texture, redness)

**Tab 5: Timeline**
- Treatment plan visualization
- Step-by-step treatment schedules
- Duration in weeks/months
- Expected results for each package
- Next steps guidance

---

### 3. Before/After Comparison Slider

**Component**: `BeforeAfterSlider`

**Features**:
- Interactive drag slider with haptic feedback
- Position indicator (0-100%)
- Quick action buttons (Before Only, 50/50 Split, After Only)
- Full-screen mode support
- Download comparison as single image
- Improvement statistics display

**Usage**:
```tsx
<BeforeAfterSlider
  beforeImage="/before.jpg"
  afterImage="/after.jpg"
  title="Treatment Results"
  description="Drag to compare"
/>
```

**Haptic Feedback**:
- Light haptic at slider start/end
- Medium haptic at midpoint (50%)
- Selection haptic when dragging

---

### 4. PDF Export with Clinic Branding

**Generator**: `PresentationPDFExporter`

**PDF Structure**:
1. **Cover Page**: Clinic logo, patient info, overall score
2. **Analysis Page**: Detailed concern breakdown with bars
3. **Treatment Packages Page**: All packages with pricing
4. **Timeline Page**: Step-by-step treatment plan
5. **Contact Page**: Clinic info and disclaimer

**Features**:
- Professional A4 layout
- Clinic brand color throughout
- Patient information section
- Proposal ID and date
- Page numbers and confidential footer
- Multi-language support (Thai/English)

**Export Function**:
```typescript
import { exportPresentationToPDF } from '@/lib/presentation/pdf-exporter';

await exportPresentationToPDF(
  analysis,
  {
    locale: 'th',
    patientInfo: {
      name: 'คุณสมหญิง',
      age: 35,
      skinType: 'combination'
    },
    clinicInfo: {
      name: 'AI367 Skin Clinic',
      nameTh: 'คลินิก AI367',
      logo: 'data:image/png;base64,...',
      brandColor: '#6366f1',
      phone: '+66 2 XXX XXXX',
      email: 'info@ai367clinic.com',
      website: 'www.ai367clinic.com',
      address: '123 Medical Plaza, Bangkok',
      addressTh: '123 อาคารแมดิคัล พลาซ่า กรุงเทพฯ'
    },
    includePricing: true,
    includeTimeline: true,
    showDiscounts: true
  },
  'treatment-proposal.pdf'
);
```

---

### 5. Treatment Package System

**Pre-Configured Packages**:

#### Basic Care Package (฿12,000)
- **Sessions**: 8 sessions over 2 months
- **Treatments**:
  - Facial Cleansing (4 sessions)
  - Vitamin C Serum (8 sessions)
  - Moisturizing Treatment (4 sessions)
- **Expected Improvement**: 25%
- **Effectiveness**:
  - Spots: 40%
  - Pores: 30%
  - Wrinkles: 20%
  - Texture: 50%
  - Redness: 35%

#### Advanced Treatment (฿35,000)
- **Sessions**: 12 sessions over 3 months
- **Discount**: 15% (Save ฿6,200)
- **Treatments**:
  - Laser Therapy (6 sessions)
  - Chemical Peel (4 sessions)
  - Hydrafacial (6 sessions)
  - LED Light Therapy (8 sessions)
- **Expected Improvement**: 60%
- **Badge**: "Best Value"

#### Premium Package (฿85,000)
- **Sessions**: 19 sessions over 4 months
- **Discount**: 20% (Save ฿21,250)
- **Treatments**:
  - Fraxel Laser (4 sessions)
  - Botox Treatment (2 sessions)
  - Dermal Fillers (2 sessions)
  - PRP Therapy (4 sessions)
  - Microneedling (6 sessions)
  - Home Care Kit (1 unit)
- **Expected Improvement**: 85%
- **Badge**: "Comprehensive"

---

### 6. Interactive Elements

**Progress Bars**: Severity visualization for each skin concern

**Badge System**:
- `Popular`: Blue badge for most chosen package
- `Best Value`: Green badge for best price-to-effectiveness ratio
- `Comprehensive`: Purple badge for complete treatment

**Improvement Indicators**:
- Green `+XX%` badges for positive changes
- Color-coded severity levels (High/Medium/Low)
- Percentile rankings vs. other patients

---

## Architecture

### File Structure

```
ai367bar/
├── components/
│   ├── presentation/
│   │   └── presentation-mode.tsx          # Main presentation component
│   └── ar/
│       └── before-after-slider.tsx        # Comparison slider (existing)
├── lib/
│   └── presentation/
│       └── pdf-exporter.tsx               # PDF generation utility
├── app/
│   └── [locale]/
│       ├── analysis/
│       │   └── detail/
│       │       └── [id]/
│       │           └── page.tsx           # Enhanced with presentation button
│       └── sales/
│           └── presentation/
│               └── [id]/
│                   └── page.tsx           # Presentation page wrapper
└── docs/
    └── SALES_PRESENTATION.md              # This documentation
```

### Data Flow

```
┌─────────────────┐
│ Analysis Detail │
│      Page       │
└────────┬────────┘
         │ Click "Sales Presentation"
         ▼
┌─────────────────┐
│  Presentation   │
│   Page Route    │
└────────┬────────┘
         │ Load Analysis Data
         ▼
┌─────────────────┐
│ PresentationMode│
│   Component     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│  PDF  │ │ Share │
│Export │ │ Print │
└───────┘ └───────┘
```

### Component Hierarchy

```
PresentationMode
├── Header (Clinic Branding + Actions)
├── Patient Info Bar
├── Tabs Navigation
│   ├── Overview Tab
│   │   ├── Overall Score Card
│   │   ├── Concerns List
│   │   └── Photo Display
│   ├── Comparison Tab
│   │   ├── BeforeAfterSlider
│   │   └── Score Comparison Grid
│   ├── Treatments Tab
│   │   └── Package Cards (3)
│   ├── Pricing Tab
│   │   └── Detailed Pricing List
│   └── Timeline Tab
│       ├── Treatment Steps
│       └── Next Steps
└── Footer Navigation
```

---

## Components

### PresentationMode Component

**File**: `components/presentation/presentation-mode.tsx`

**Props**:
```typescript
interface PresentationModeProps {
  analysis: HybridSkinAnalysis;
  comparisonAnalysis?: HybridSkinAnalysis;
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
  };
  clinicInfo?: {
    name: string;
    logo?: string;
    brandColor?: string;
  };
  locale?: 'th' | 'en';
  onExport?: (format: 'pdf' | 'png') => void;
  onShare?: () => void;
  onPrint?: () => void;
  onClose?: () => void;
}
```

**State Management**:
- `isFullscreen`: Boolean for full-screen state
- `currentTab`: Active tab ('overview' | 'comparison' | 'treatments' | 'pricing' | 'timeline')

**Keyboard Handlers**:
- `Escape`: Exit full-screen
- `ArrowRight`: Next tab
- `ArrowLeft`: Previous tab

**Example**:
```tsx
<PresentationMode
  analysis={analysis}
  comparisonAnalysis={previousAnalysis}
  patientInfo={{
    name: 'Jane Smith',
    age: 35,
    gender: 'Female',
    skinType: 'combination'
  }}
  clinicInfo={{
    name: 'Beauty Clinic',
    logo: '/logo.png',
    brandColor: '#6366f1'
  }}
  locale="en"
  onExport={handleExport}
  onShare={handleShare}
  onPrint={handlePrint}
  onClose={() => router.back()}
/>
```

---

### BeforeAfterSlider Component

**File**: `components/ar/before-after-slider.tsx` (Existing)

**Props**:
```typescript
interface BeforeAfterSliderProps {
  beforeImage: string | null;
  afterImage: string | null;
  title?: string;
  description?: string;
}
```

**Features**:
- Drag slider with mouse/touch
- Position control (0-100%)
- Quick preset buttons
- Full-screen toggle
- Download comparison image
- Improvement statistics

---

## PDF Export

### PresentationPDFExporter Class

**File**: `lib/presentation/pdf-exporter.tsx`

**Constructor Options**:
```typescript
interface PresentationPDFOptions {
  locale?: 'th' | 'en';
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
    customerId?: string;
  };
  clinicInfo: {
    name: string;
    nameTh?: string;
    logo?: string;
    brandColor?: string;
    address?: string;
    addressTh?: string;
    phone?: string;
    email?: string;
    website?: string;
    license?: string;
  };
  treatmentPackages?: TreatmentPackage[];
  includePricing?: boolean;
  includeTimeline?: boolean;
  showDiscounts?: boolean;
}
```

**Methods**:
- `generate(analysis, options, filename)`: Generate and download PDF
- `addCoverPage()`: Create cover with logo and score
- `addAnalysisPage()`: Add detailed analysis with bars
- `addTreatmentPackagesPage()`: Add packages with pricing
- `addTimelinePage()`: Add treatment timeline
- `addContactPage()`: Add clinic contact info

**Usage Example**:
```typescript
const exporter = new PresentationPDFExporter({
  locale: 'th',
  clinicInfo: {
    name: 'AI367 Clinic',
    nameTh: 'คลินิก AI367',
    logo: logoBase64,
    brandColor: '#6366f1'
  }
});

await exporter.generate(
  analysis,
  options,
  'proposal.pdf'
);
```

### PDF Layout

**Page 1: Cover**
- Large brand header (80mm height)
- Clinic logo (30x30mm)
- Title: "Personalized Skin Treatment Proposal"
- Patient info box (50mm height)
- Overall score in circle (50mm diameter)
- Confidence percentage
- Footer: Contact info

**Page 2: Analysis**
- Concern list with severity bars
- Score values (X/10)
- Percentile rankings
- Color-coded levels (Red/Yellow/Green)
- Optional: Skin photo (80x60mm)

**Page 3: Treatment Packages**
- Package boxes (65mm height each)
- Badge indicators
- Treatment lists
- Key metrics bar
- Pricing with discounts

**Page 4: Timeline**
- Package timelines with step circles
- Treatment lists with bullets
- Expected results boxes
- Next steps section

**Page 5: Contact**
- Brand header
- Clinic details
- Address (multi-line support)
- Disclaimer text

---

## Treatment Packages

### Package Data Structure

```typescript
interface TreatmentPackage {
  id: string;
  name: { en: string; th: string };
  badge?: { en: string; th: string };
  badgeColor: string;
  treatments: {
    name: { en: string; th: string };
    sessions: number;
  }[];
  duration: { weeks: number; months: number };
  price: number;
  perSession: number;
  sessions: number;
  improvement: number;
  effectiveness: {
    spots: number;
    pores: number;
    wrinkles: number;
    texture: number;
    redness: number;
  };
  discount?: number;
  originalPrice?: number;
}
```

### Adding Custom Packages

**Step 1**: Define package data
```typescript
const CUSTOM_PACKAGE: TreatmentPackage = {
  id: 'custom_acne',
  name: { en: 'Acne Treatment Plan', th: 'แผนรักษาสิว' },
  badge: { en: 'Specialist', th: 'ผู้เชี่ยวชาญ' },
  badgeColor: 'bg-orange-500',
  treatments: [
    { name: { en: 'Salicylic Acid Peel', th: 'ผลัดเซลล์ผิวกรดซาลิไซลิค' }, sessions: 6 },
    { name: { en: 'Blue LED Therapy', th: 'บำบัดด้วยแสง LED สีน้ำเงิน' }, sessions: 8 },
    { name: { en: 'Acne Extraction', th: 'เกาะสิว' }, sessions: 4 }
  ],
  duration: { weeks: 10, months: 2.5 },
  price: 18000,
  perSession: 1000,
  sessions: 18,
  improvement: 70,
  effectiveness: {
    spots: 80,
    pores: 60,
    wrinkles: 10,
    texture: 65,
    redness: 75
  },
  discount: 10,
  originalPrice: 20000
};
```

**Step 2**: Add to packages array in `presentation-mode.tsx`
```typescript
const TREATMENT_PACKAGES = [
  // ... existing packages
  CUSTOM_PACKAGE
];
```

---

## Usage Guide

### For Sales Staff

#### 1. Starting a Presentation

**Steps**:
1. Navigate to analysis detail page: `/[locale]/analysis/detail/[id]`
2. Click "Sales Presentation" button in top-right
3. System loads presentation mode with full data
4. Use arrow keys or navigation buttons to move between tabs

**Recommended Flow**:
1. **Overview**: Show overall score and concerns
2. **Comparison**: If available, show improvement
3. **Treatments**: Present package options
4. **Pricing**: Discuss costs and savings
5. **Timeline**: Explain treatment journey

#### 2. Presenting Treatment Packages

**Best Practices**:
- Start with middle package (Advanced) to anchor price
- Highlight "Best Value" badge
- Explain improvement percentages
- Show effectiveness breakdown by concern
- Mention discount savings prominently

**Sales Script Example** (Thai):
```
"สำหรับปัญหาผิวของคุณ เรามี 3 แพ็คเกจที่แนะนำ

แพ็คเกจ Advanced Treatment นี้เป็นที่นิยมมากที่สุด
- ราคา 35,000 บาท (ประหยัด 15%)
- รักษา 12 ครั้ง ภายใน 3 เดือน
- ผลลัพธ์ที่คาดหวัง: ดีขึ้น 60%

และสำหรับการรักษาที่ครบวงจรที่สุด เรามี Premium Package
- ราคา 85,000 บาท (ประหยัด 20%)
- ผลลัพธ์: ดีขึ้นถึง 85%"
```

#### 3. Exporting Proposals

**PDF Export**:
1. Click "Export PDF" button in header
2. PDF generates with clinic branding
3. Automatically downloads with timestamp
4. Give to customer or email

**Sharing**:
1. Click "Share" button
2. Select sharing method (Email, SMS, Line)
3. Customer receives link or document

**Printing**:
1. Click "Print" button
2. Browser print dialog opens
3. Use for physical handouts

#### 4. Full-Screen Tips

**Entering Full-Screen**:
- Click maximize button
- Press F key (some browsers)
- Better for large displays

**During Presentation**:
- Use arrow keys for navigation
- Point to screen elements while explaining
- Exit with Escape key when done

---

### For Clinic Admins

#### 1. Customizing Clinic Branding

**Edit Clinic Info** in code or database:
```typescript
const clinicInfo = {
  name: 'Your Clinic Name',
  nameTh: 'ชื่อคลินิกภาษาไทย',
  logo: '/path/to/logo.png',
  brandColor: '#your-hex-color',
  phone: '+66 X XXXX XXXX',
  email: 'contact@yourclinic.com',
  website: 'www.yourclinic.com',
  address: 'Your full address',
  addressTh: 'ที่อยู่ภาษาไทย'
};
```

**Logo Requirements**:
- Format: PNG with transparency
- Size: 200x200px minimum
- Aspect: Square recommended
- Background: Transparent

**Brand Color**:
- Format: Hex color (#RRGGBB)
- Used for: Headers, badges, accents
- Recommended: High contrast colors

#### 2. Managing Treatment Packages

**Updating Prices**:
Edit package data in `presentation-mode.tsx`:
```typescript
{
  id: 'advanced',
  price: 35000, // Update price
  originalPrice: 41200, // Update original
  discount: 15 // Update discount %
}
```

**Adding Treatments**:
```typescript
treatments: [
  // Add new treatment
  { 
    name: { 
      en: 'New Treatment', 
      th: 'การรักษาใหม่' 
    }, 
    sessions: 4 
  }
]
```

**Effectiveness Tuning**:
Update based on real results:
```typescript
effectiveness: {
  spots: 75,    // 0-100%
  pores: 65,
  wrinkles: 55,
  texture: 80,
  redness: 70
}
```

#### 3. Training Staff

**Training Checklist**:
- [ ] How to access presentation mode
- [ ] Keyboard shortcuts (arrows, escape)
- [ ] Package explanation scripts
- [ ] PDF export process
- [ ] Full-screen best practices
- [ ] Handling customer questions
- [ ] Closing techniques

---

### For Developers

#### 1. Adding New Features

**New Tab Example**:
```typescript
// 1. Add tab to TabsList
<TabsTrigger value="newtab">New Tab</TabsTrigger>

// 2. Add TabsContent
<TabsContent value="newtab">
  <Card>
    <CardHeader>
      <CardTitle>New Feature</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Your content */}
    </CardContent>
  </Card>
</TabsContent>

// 3. Update keyboard navigation
const tabs = ['overview', 'comparison', 'treatments', 'pricing', 'timeline', 'newtab'];
```

#### 2. Customizing PDF Layout

**Add New Page**:
```typescript
private addCustomPage(data: CustomData) {
  this.addNewPage();
  this.addHeader(this.clinicInfo);
  
  let y = this.marginTop + 30;
  
  this.pdf.setFontSize(16);
  this.pdf.setFont('helvetica', 'bold');
  this.pdf.text('Custom Section', this.marginLeft, y);
  
  // Add your content
  y += 15;
  this.pdf.text('Custom data here', this.marginLeft, y);
}
```

**Custom Colors**:
```typescript
const rgb = this.hexToRgb(customColor);
this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
this.pdf.rect(x, y, width, height, 'F');
```

#### 3. API Integration

**Fetching Comparison Analysis**:
```typescript
// Add API endpoint: GET /api/analysis/comparison/:id
const response = await fetch(`/api/analysis/comparison/${analysisId}`);
const data = await response.json();
setComparisonAnalysis(data.previousAnalysis);
```

**Saving Presentation Views**:
```typescript
// Track when presentations are viewed
await fetch('/api/analytics/presentation-view', {
  method: 'POST',
  body: JSON.stringify({
    analysisId,
    staffId,
    timestamp: new Date(),
    duration: viewDuration
  })
});
```

---

## Customization

### Theme Customization

**Colors**:
```typescript
// In presentation-mode.tsx
const THEME = {
  primary: '#6366f1',      // Indigo
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber
  danger: '#ef4444',       // Red
  muted: '#64748b'         // Slate
};
```

**Fonts**:
```typescript
// In PDF exporter
this.pdf.setFont('helvetica', 'bold');
// Options: helvetica, times, courier
```

### Translation Customization

**Add New Locale**:
```typescript
const TRANSLATIONS = {
  // ... existing en, th
  jp: {
    presentationMode: 'プレゼンテーションモード',
    overview: '概要',
    // ... add all keys
  }
};
```

### Layout Customization

**Change Tab Order**:
```typescript
const TAB_ORDER = ['overview', 'treatments', 'pricing', 'timeline', 'comparison'];
```

**Grid Layouts**:
```typescript
// 2 columns instead of 3 for packages
<div className="grid gap-6 md:grid-cols-2">
  {TREATMENT_PACKAGES.map(pkg => ...)}
</div>
```

---

## API Integration

### Required Endpoints

**1. Get Analysis**
```
GET /api/skin-analysis/:id
```
Returns: HybridSkinAnalysis with all data

**2. Get Comparison Analysis** (Optional)
```
GET /api/skin-analysis/:id/previous
```
Returns: Previous analysis for same patient

**3. Get Patient Info** (Optional)
```
GET /api/patients/:id
```
Returns: Patient demographic data

**4. Track Presentation View** (Optional)
```
POST /api/analytics/presentation-view
Body: { analysisId, staffId, timestamp, duration }
```

### Database Schema

**For tracking presentation usage**:
```sql
CREATE TABLE presentation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES skin_analyses(id),
  staff_id UUID REFERENCES users(id),
  viewed_at TIMESTAMP DEFAULT NOW(),
  duration_seconds INTEGER,
  exported_pdf BOOLEAN DEFAULT FALSE,
  shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_presentation_views_analysis ON presentation_views(analysis_id);
CREATE INDEX idx_presentation_views_staff ON presentation_views(staff_id);
```

---

## Best Practices

### Sales Presentation

**DO**:
- ✅ Start with overview to establish context
- ✅ Use comparison tab if previous analysis exists
- ✅ Focus on middle-tier package first
- ✅ Highlight discount savings
- ✅ Show effectiveness metrics for customer's concerns
- ✅ Use keyboard shortcuts for smooth flow
- ✅ Export PDF at end of consultation

**DON'T**:
- ❌ Jump between tabs randomly
- ❌ Skip the overview
- ❌ Present all packages at once
- ❌ Focus only on price
- ❌ Forget to show timeline

### PDF Proposals

**DO**:
- ✅ Include patient name and date
- ✅ Use clinic branding consistently
- ✅ Show discounts prominently
- ✅ Include timeline
- ✅ Add contact information
- ✅ Mark as confidential

**DON'T**:
- ❌ Generic proposals without branding
- ❌ Missing patient information
- ❌ Unclear pricing
- ❌ No expiry date
- ❌ Incomplete contact details

### Performance

**Optimization Tips**:
- Use lazy loading for images
- Minimize re-renders with React.memo
- Compress clinic logo before uploading
- Cache treatment package data
- Preload fonts for PDF generation

**Image Sizes**:
- Clinic logo: 200x200px, <50KB
- Analysis photos: 1024x768px, <200KB
- Before/after: 800x600px, <150KB each

---

## Troubleshooting

### Issue: Full-Screen Not Working

**Symptoms**: Button clicks but doesn't go full-screen

**Causes**:
1. Browser doesn't support Fullscreen API
2. User hasn't interacted with page yet
3. Popup blockers interfering

**Solutions**:
```typescript
// Check support
if (!document.fullscreenEnabled) {
  console.warn('Fullscreen not supported');
  // Fall back to maximized window
}

// Require user interaction
// Full-screen must be triggered by user gesture
```

---

### Issue: PDF Not Generating

**Symptoms**: Error when clicking "Export PDF"

**Causes**:
1. Missing jsPDF library
2. Image loading failures
3. Invalid clinic logo format

**Solutions**:
```bash
# Install jsPDF if missing
pnpm install jspdf

# Check image formats
# Logo must be PNG, JPEG, or base64 data URL
```

**Debug Code**:
```typescript
try {
  await exportPresentationToPDF(analysis, options);
} catch (error) {
  console.error('PDF Export failed:', error);
  // Show user-friendly error
  alert('Failed to generate PDF. Please try again.');
}
```

---

### Issue: Keyboard Navigation Not Working

**Symptoms**: Arrow keys don't change tabs

**Causes**:
1. Focus on input element
2. Event listener not attached
3. Full-screen mode conflict

**Solutions**:
```typescript
// Ensure global event listener
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only handle if not typing in input
    if (e.target instanceof HTMLInputElement) return;
    
    if (e.key === 'ArrowRight') {
      // Next tab logic
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [currentTab]);
```

---

### Issue: Clinic Logo Not Showing in PDF

**Symptoms**: PDF generates but logo is missing

**Causes**:
1. Logo URL not accessible from server
2. CORS issues
3. Invalid image format

**Solutions**:
```typescript
// Convert logo to base64
const logoBase64 = await fetch(logoUrl)
  .then(res => res.blob())
  .then(blob => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  }));

// Use base64 in PDF options
clinicInfo: {
  logo: logoBase64 as string
}
```

---

### Issue: Comparison Tab Empty

**Symptoms**: "No comparison data available" message

**Causes**:
1. No previous analysis for patient
2. API endpoint not implemented
3. Data not passed to component

**Solutions**:
```typescript
// Check if comparison analysis exists
const previousAnalysis = await fetchPreviousAnalysis(patientId);

if (previousAnalysis) {
  setComparisonAnalysis(previousAnalysis);
} else {
  // Hide comparison tab or show placeholder
  console.log('No previous analysis found');
}
```

---

### Issue: Thai Text Not Displaying in PDF

**Symptoms**: Thai characters show as boxes or question marks

**Causes**:
1. jsPDF doesn't include Thai fonts by default
2. Font embedding required

**Solutions**:
```typescript
// Option 1: Add custom Thai font to jsPDF
// This requires adding font files to jsPDF

// Option 2: Use images for Thai text in PDF
// Render Thai text as canvas, then add as image

// Option 3: Use SVG for Thai text
// Convert text to SVG paths
```

**Workaround**:
For now, Latin characters work fine. For production with Thai:
1. Use jsPDF-AutoTable with font support
2. Or use server-side PDF generation with Thai fonts
3. Or use images for Thai text sections

---

## Future Enhancements

### Planned Features

#### 1. Interactive Treatment Selector
**Description**: Let customers choose specific treatments to customize packages

**Implementation**:
```typescript
<TreatmentSelector
  availableTreatments={allTreatments}
  onSelectionChange={(selected) => {
    const customPackage = calculateCustomPackage(selected);
    setCustomPackage(customPackage);
  }}
/>
```

**Benefits**:
- Customer feels more involved
- Personalized recommendations
- Flexible pricing

---

#### 2. Live Pricing Calculator
**Description**: Real-time price updates as treatments are selected/deselected

**UI**:
```typescript
<PricingCalculator
  baseTreatments={selectedTreatments}
  onPriceChange={(newTotal) => setTotalPrice(newTotal)}
/>

// Display
<div className="fixed bottom-0 right-0 p-4">
  <Card>
    <CardContent>
      <div className="text-2xl font-bold">
        ฿{totalPrice.toLocaleString()}
      </div>
      <div className="text-sm text-muted-foreground">
        Estimated Total
      </div>
    </CardContent>
  </Card>
</div>
```

---

#### 3. Digital Signature
**Description**: Customer can sign proposal directly in presentation mode

**Implementation**:
```typescript
import SignatureCanvas from 'react-signature-canvas';

<SignatureCanvas
  penColor="black"
  canvasProps={{
    width: 500,
    height: 200,
    className: 'signature-canvas'
  }}
  ref={signatureRef}
/>

// Save signature
const signature = signatureRef.current.toDataURL();
```

**Use Case**: Instant proposal acceptance during consultation

---

#### 4. Email Integration
**Description**: Send PDF proposal directly to customer's email

**Flow**:
```typescript
const sendProposal = async () => {
  const pdfBlob = await generatePDFBlob();
  
  await fetch('/api/email/send-proposal', {
    method: 'POST',
    body: JSON.stringify({
      to: customerEmail,
      subject: 'Your Treatment Proposal',
      pdfAttachment: pdfBlob
    })
  });
};
```

---

#### 5. Video Testimonials
**Description**: Embed video testimonials in presentation

**Implementation**:
```typescript
<TabsContent value="testimonials">
  <div className="grid gap-6 md:grid-cols-2">
    {testimonials.map(video => (
      <Card key={video.id}>
        <CardContent className="p-0">
          <video
            controls
            className="w-full rounded-lg"
            poster={video.thumbnail}
          >
            <source src={video.url} type="video/mp4" />
          </video>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>
```

---

#### 6. Analytics Dashboard
**Description**: Track presentation effectiveness

**Metrics**:
- View duration per tab
- Most viewed packages
- Export rate
- Conversion rate
- Common objections (tracked manually)

**Report Example**:
```
Presentation Analytics (Last 30 Days)
=====================================
Total Presentations: 150
Average Duration: 12 minutes
Export Rate: 75% (112 PDFs)
Top Package: Advanced (60% interest)
Conversion Rate: 45% (67 bookings)

Tab Engagement:
- Overview: 100%
- Comparison: 85%
- Treatments: 95%
- Pricing: 90%
- Timeline: 70%
```

---

#### 7. Multi-Analysis Comparison
**Description**: Compare 3+ analyses over time

**UI**:
```typescript
<TimelineComparison
  analyses={[analysis1, analysis2, analysis3, analysis4]}
  metrics={['spots', 'wrinkles', 'texture']}
/>

// Shows line chart of improvement over time
```

---

#### 8. Virtual Consultation Mode
**Description**: Share screen during video calls

**Features**:
- Screen sharing optimized layout
- Pointer annotations
- Customer can control some navigation
- Chat integration

---

#### 9. Mobile App Support
**Description**: Native mobile presentation mode

**Features**:
- Swipe gestures for navigation
- Portrait and landscape modes
- Offline PDF viewing
- Push notifications for follow-ups

---

#### 10. AI-Powered Package Recommendations
**Description**: Automatically suggest best package based on analysis

**Algorithm**:
```typescript
function recommendPackage(analysis: HybridSkinAnalysis): string {
  const severityScore = calculateAverageSeverity(analysis);
  
  if (severityScore > 7) return 'premium';
  if (severityScore > 4) return 'advanced';
  return 'basic';
}
```

**UI Enhancement**:
```typescript
<Badge className="bg-green-500">
  Recommended for You
</Badge>
```

---

## Testing Checklist

### Manual Testing

**Functional Tests**:
- [ ] Presentation mode loads with analysis data
- [ ] Full-screen toggle works (enter/exit)
- [ ] All 5 tabs render correctly
- [ ] Keyboard navigation (arrows) works
- [ ] Patient info displays correctly
- [ ] Clinic branding appears (logo, color)
- [ ] Before/after slider works (if comparison data)
- [ ] Package cards display all information
- [ ] Pricing shows correctly with discounts
- [ ] Timeline displays treatment steps
- [ ] PDF export generates successfully
- [ ] Share button works (if supported)
- [ ] Print button opens print dialog
- [ ] Close button returns to analysis detail
- [ ] Thai language displays correctly
- [ ] English language displays correctly

**UI/UX Tests**:
- [ ] Responsive on different screen sizes
- [ ] Colors contrast properly
- [ ] Text is readable
- [ ] Buttons have clear labels
- [ ] Loading states show appropriately
- [ ] Error messages are clear
- [ ] Animations are smooth
- [ ] No layout shifts

**PDF Tests**:
- [ ] Cover page includes logo
- [ ] Patient info correct
- [ ] Overall score displays
- [ ] Analysis page shows all concerns
- [ ] Severity bars render
- [ ] Treatment packages page complete
- [ ] Timeline page shows all steps
- [ ] Contact page has all info
- [ ] Page numbers correct
- [ ] Confidential footer on all pages
- [ ] Brand color throughout
- [ ] Thai/English text correct

**Cross-Browser Tests**:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers

---

### Automated Testing

**Unit Tests**:
```typescript
// presentation-mode.test.tsx
describe('PresentationMode', () => {
  it('renders with analysis data', () => {
    render(<PresentationMode analysis={mockAnalysis} />);
    expect(screen.getByText('Presentation Mode')).toBeInTheDocument();
  });
  
  it('switches tabs on arrow key press', () => {
    render(<PresentationMode analysis={mockAnalysis} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Comparison');
  });
  
  it('calls onExport when export button clicked', () => {
    const handleExport = jest.fn();
    render(<PresentationMode analysis={mockAnalysis} onExport={handleExport} />);
    fireEvent.click(screen.getByText('Export PDF'));
    expect(handleExport).toHaveBeenCalledWith('pdf');
  });
});
```

**Integration Tests**:
```typescript
// presentation-page.test.tsx
describe('Sales Presentation Page', () => {
  it('loads analysis and renders presentation', async () => {
    mockFetch('/api/skin-analysis/123', { success: true, data: mockAnalysis });
    
    render(<SalesPresentationPage params={{ id: '123', locale: 'en' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Presentation Mode')).toBeInTheDocument();
    });
  });
  
  it('handles missing analysis gracefully', async () => {
    mockFetch('/api/skin-analysis/invalid', { success: false }, 404);
    
    render(<SalesPresentationPage params={{ id: 'invalid', locale: 'en' }} />);
    
    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });
});
```

---

## Performance Metrics

### Target Metrics

**Load Time**:
- Initial render: <500ms
- Full-screen toggle: <100ms
- Tab switch: <50ms
- PDF generation: <3s

**Bundle Size**:
- PresentationMode component: <50KB
- PDF exporter: <100KB
- Total presentation code: <150KB

**Lighthouse Score**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+

---

## Conclusion

The **Sales Presentation Mode** is a comprehensive solution for beauty clinics to professionally present skin analysis results and treatment proposals to customers. With full-screen presentation, interactive comparisons, treatment packages with pricing, and branded PDF export, it provides everything needed for effective sales consultations.

### Quick Start Summary

1. **Access**: Click "Sales Presentation" button on analysis detail page
2. **Navigate**: Use arrow keys or buttons to move between 5 tabs
3. **Present**: Follow recommended flow (Overview → Comparison → Treatments → Pricing → Timeline)
4. **Export**: Generate branded PDF at end of consultation
5. **Close**: Exit to return to analysis detail

### Support

For questions or issues:
- Check troubleshooting section above
- Review code comments in source files
- Test with different browsers
- Verify clinic branding configuration

### Version History

- **v1.0.0** (Current): Initial release with core features
  - Full-screen presentation mode
  - 5-tab navigation system
  - Before/after comparison slider
  - Treatment package display
  - PDF export with clinic branding
  - Thai/English support
  - Keyboard shortcuts

---

**Last Updated**: January 2025  
**Maintainer**: AI367 Development Team  
**Status**: ✅ Production Ready

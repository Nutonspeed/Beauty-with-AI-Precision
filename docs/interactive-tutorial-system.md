# Interactive Tutorial System

## Overview
Custom-built tutorial system using Framer Motion (driver.js/intro.js installation failed due to pnpm/libpq conflicts).

## Components Created

### 1. Tutorial Steps Configuration (`lib/tutorials/tutorial-steps.ts`)
- **Type**: Tutorial configuration file
- **Exports**:
  - `TutorialStep` interface
  - `analysisTutorialSteps` (6 steps)
  - `arTutorialSteps` (7 steps)
  - `bookingTutorialSteps` (7 steps)
  - `getTutorialSteps(type)` helper

**Analysis Tutorial Flow**:
1. Welcome message
2. Upload button guide
3. Photo tips explanation
4. Analyze button guide
5. Results section overview
6. History button guide

**AR Simulator Tutorial Flow**:
1. Welcome message
2. Upload photo guide
3. 3D controls explanation
4. Treatment type selector
5. Intensity slider guide
6. Before/After comparison
7. Save results button

**Booking Tutorial Flow**:
1. Welcome message
2. Clinic selection
3. Service selection
4. Date picker
5. Time slot selection
6. Confirmation button
7. Booking history access

### 2. Tutorial Overlay Component (`components/tutorial/tutorial-overlay.tsx`)
- **Type**: Client Component with Framer Motion animations
- **Features**:
  - Dark overlay with cutout hole for highlighted element
  - Animated border around active element
  - Positioned tooltip (top/right/bottom/left/center)
  - Progress bar (visual feedback)
  - Navigation: Previous, Next, Skip All, Finish
  - Auto-scroll to highlighted elements

**Props**:
- `steps: TutorialStep[]` - Tutorial configuration
- `onComplete: () => void` - Called when tutorial completes
- `onSkip: () => void` - Called when user skips

**Animations**:
- Fade in/out overlay (opacity: 0 → 1)
- Scale in highlight border (scale: 0.9 → 1)
- Slide tooltip (y: 10 → 0)
- Smooth progress bar width transition

### 3. Tutorial Hook (`hooks/use-tutorial.ts`)
- **Type**: React Hook
- **LocalStorage Key**: `tutorial_completed_{type}`
- **Returns**:
  - `isActive: boolean` - Tutorial currently showing
  - `hasCompleted: boolean` - User completed before
  - `startTutorial()` - Show tutorial
  - `completeTutorial()` - Mark as complete, hide
  - `skipTutorial()` - Hide without marking complete
  - `resetTutorial()` - Clear completion status

### 4. Tutorial Button (`components/tutorial/tutorial-button.tsx`)
- **Type**: Reusable UI Component
- **Design**: Outline button with HelpCircle icon
- **Text**: "ดูคู่มือ" (View Guide)
- **Position**: Fixed top-right corner (recommended)

### 5. Analysis Tutorial Wrapper (`components/tutorial/analysis-tutorial-wrapper.tsx`)
- **Type**: Client Component for /analysis page
- **Features**:
  - Auto-start tutorial after 1 second (first visit only)
  - Fixed Tutorial Button in top-right
  - Conditional rendering of TutorialOverlay
- **Integration**: Imported in `/app/analysis/page.tsx`

## Integration Guide

### Step 1: Add Data-Tour Attributes
Mark elements with `data-tour="step-id"`:

\`\`\`tsx
<Button data-tour="upload-button">Upload</Button>
<div data-tour="photo-tips">Tips...</div>
<Button data-tour="analyze-button">Analyze</Button>
\`\`\`

### Step 2: Create Tutorial Wrapper
\`\`\`tsx
'use client';

import { TutorialOverlay } from '@/components/tutorial/tutorial-overlay';
import { TutorialButton } from '@/components/tutorial/tutorial-button';
import { getTutorialSteps } from '@/lib/tutorials/tutorial-steps';
import { useTutorial } from '@/hooks/use-tutorial';

export function YourTutorialWrapper() {
  const { isActive, hasCompleted, startTutorial, completeTutorial, skipTutorial } =
    useTutorial('your-type');

  // Auto-start on first visit
  useEffect(() => {
    if (!hasCompleted) {
      setTimeout(() => startTutorial(), 1000);
    }
  }, [hasCompleted, startTutorial]);

  return (
    <>
      <div className="fixed top-20 right-4 z-50">
        <TutorialButton onClick={startTutorial} />
      </div>

      {isActive && (
        <TutorialOverlay
          steps={getTutorialSteps('your-type')}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}
    </>
  );
}
\`\`\`

### Step 3: Import in Server Component
\`\`\`tsx
import { YourTutorialWrapper } from '@/components/tutorial/your-tutorial-wrapper';

export default async function YourPage() {
  return (
    <>
      <YourTutorialWrapper />
      {/* Page content */}
    </>
  );
}
\`\`\`

## Current Integration Status

### ✅ Analysis Page
- **File**: `app/analysis/page.tsx`
- **Tutorial**: `analysisTutorialSteps` (6 steps)
- **Data-Tour Elements**:
  - `upload-button` - Upload area
  - `photo-tips` - Camera positioning guide
  - `analyze-button` - Analyze button
- **Auto-Start**: Yes (1 second delay, first visit only)

### ⏳ AR Simulator (Pending)
- **File**: `app/ar-simulator/page.tsx`
- **Tutorial**: `arTutorialSteps` (7 steps)
- **Required Data-Tour Elements**:
  - `ar-upload`, `ar-canvas`, `treatment-selector`
  - `intensity-slider`, `compare-toggle`, `save-button`

### ⏳ Booking Page (Pending)
- **File**: `app/booking/page.tsx`
- **Tutorial**: `bookingTutorialSteps` (7 steps)
- **Required Data-Tour Elements**:
  - `clinic-list`, `service-selector`, `date-picker`
  - `time-slots`, `confirm-button`, `booking-history`

## Technical Details

### Highlight Calculation
- Uses `element.getBoundingClientRect()` for position
- Applies `highlightPadding` (default: 10px)
- Creates cutout in overlay using CSS `clip-path`

### Tooltip Positioning
- **Top**: Above element, center-aligned, `translateY(-100%)`
- **Right**: Right of element, middle-aligned
- **Bottom**: Below element, center-aligned
- **Left**: Left of element, middle-aligned, `translateX(-100%)`
- **Center**: Screen center (for body-level steps)

### Auto-Scroll
- Uses `element.scrollIntoView()` with smooth behavior
- Centers element in viewport: `block: 'center'`

### Z-Index Strategy
- Overlay: `z-[9999]` (highest layer)
- Tutorial Button: `z-50` (above content)
- Highlighted element: Remains in original layer

## Benefits Over Third-Party Libraries

1. **No Installation Issues**: Pure React + Framer Motion (already in project)
2. **Full Customization**: Complete control over styling and behavior
3. **Lightweight**: ~400 lines total vs 100KB+ libraries
4. **Type-Safe**: Full TypeScript support
5. **Framework-Aligned**: Uses existing shadcn/ui components
6. **Mobile-Friendly**: Responsive tooltip positioning

## Future Enhancements

1. **Keyboard Navigation**: Arrow keys for next/previous
2. **Multi-Language**: Support EN/TH/ZH tutorial text
3. **Analytics**: Track completion rates, drop-off points
4. **Smart Triggers**: Show tutorial based on user behavior
5. **Video Support**: Embed demo videos in steps
6. **Branching**: Conditional steps based on user choices

## Files Summary

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `lib/tutorials/tutorial-steps.ts` | Config | 178 | Tutorial step definitions |
| `components/tutorial/tutorial-overlay.tsx` | Component | 220 | Main tutorial UI |
| `hooks/use-tutorial.ts` | Hook | 40 | State management |
| `components/tutorial/tutorial-button.tsx` | Component | 20 | Launch button |
| `components/tutorial/analysis-tutorial-wrapper.tsx` | Wrapper | 38 | Analysis integration |

**Total**: ~500 lines of custom tutorial system

## Testing Checklist

- [x] Tutorial shows on first visit to /analysis
- [ ] Tutorial highlights correct elements
- [ ] Tooltip positioned correctly (all positions)
- [ ] Progress bar animates smoothly
- [ ] Navigation buttons work (Previous/Next/Skip)
- [ ] LocalStorage persists completion
- [ ] Tutorial button shows after completion
- [ ] Auto-scroll works on all steps
- [ ] Mobile responsive
- [ ] Dark mode compatible

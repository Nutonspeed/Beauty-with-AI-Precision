# Manual Testing Guide - AR Features
**Date:** November 1, 2025  
**Server:** http://localhost:3000  
**Status:** ✅ Ready for Testing

---

## 🎯 Quick Start

Your server is running at **http://localhost:3000** with all critical bugs fixed! Follow this guide to test the AR features.

---

## ✅ Pre-Testing Checklist

- [x] Server running (http://localhost:3000)
- [x] All compilation errors fixed
- [x] Analysis pipeline working (2 successful tests)
- [x] Database connected (Supabase)
- [x] Google Vision API active (฿9,665 credits)

---

## 📋 Test Plan

### Test 1: Basic Analysis Flow ⭐⭐⭐⭐⭐

**Steps:**
1. Open http://localhost:3000/analysis in browser
2. Click "Upload Image" or drag-and-drop a face photo
3. Wait for analysis to complete (~30 seconds)
4. Verify redirect to analysis detail page

**Expected Results:**
- ✅ Image preview shows before upload
- ✅ Progress bar appears during analysis
- ✅ "Analysis complete!" message displays
- ✅ Redirects to `/analysis/detail/[id]`

**What to Look For:**
- Any errors in browser console (F12)
- Upload button responsiveness
- Progress indicators working
- Smooth page transition

---

### Test 2: VISIA Report Tab ⭐⭐⭐⭐⭐

**Steps:**
1. After analysis, verify you're on "Report" tab (default)
2. Scroll through the report
3. Check all sections display correctly

**Expected Results:**
- ✅ Overall score displays (e.g., 41/100)
- ✅ 6 concern cards show (Spots, Pores, Wrinkles, Texture, Redness, Color)
- ✅ Each card has severity score (0-10)
- ✅ Percentile bars display
- ✅ Treatment recommendations appear
- ✅ Export buttons visible (PDF/PNG)

**What to Look For:**
- No missing images or broken layouts
- Scores make sense (0-10 range)
- Recommendations match severity
- Charts render correctly

---

### Test 3: 3D View Tab - 2D Fallback Mode ⭐⭐⭐⭐⭐

**Location:** Analysis Detail Page → "3D View" Tab

#### 3.1 Initial Rendering

**Steps:**
1. Click "3D View" tab
2. Observe the initial display

**Expected Results:**
- ✅ Face image displays in center
- ✅ Image has slight 3D perspective effect
- ✅ Controls visible at bottom (Auto-Rotate, Reset, Heatmap Intensity)
- ✅ Analysis scores legend on right side
- ✅ No "No face mesh data available" error message

**What to Look For:**
- Image loads correctly (not broken)
- No console errors
- Layout is centered and responsive

---

#### 3.2 Drag to Rotate (Mouse)

**Steps:**
1. Click and hold on the face image
2. Drag left/right slowly
3. Drag up/down slowly
4. Release mouse

**Expected Results:**
- ✅ Image rotates horizontally when dragging left/right (Y-axis: 0° to 360°)
- ✅ Image rotates vertically when dragging up/down (X-axis: -45° to +45°)
- ✅ Rotation is smooth (no jittering)
- ✅ Cursor changes to grabbing hand during drag
- ✅ Rotation stops when mouse released

**What to Look For:**
- Rotation feels natural (not inverted)
- Frame rate is smooth (~60fps)
- No performance issues during drag
- Image doesn't disappear or glitch

**Test Values:**
- Drag left: Image should rotate right (Y increases)
- Drag right: Image should rotate left (Y decreases)
- Drag up: Image should tilt back (X decreases, limited to -45°)
- Drag down: Image should tilt forward (X increases, limited to +45°)

---

#### 3.3 Drag to Rotate (Touch - Mobile)

**Steps (on mobile device or using browser DevTools device emulation):**
1. Touch and hold on the face image
2. Swipe left/right
3. Swipe up/down
4. Release touch

**Expected Results:**
- ✅ Same rotation behavior as mouse
- ✅ Touch tracking is accurate
- ✅ No scrolling interference
- ✅ Single-finger gesture only (no multi-touch)

**What to Look For:**
- Touch events don't cause page scroll
- Rotation is smooth on mobile
- No lag or delay in touch response

---

#### 3.4 Auto-Rotate Button

**Steps:**
1. Click "Auto-Rotate" button (should turn green)
2. Wait and observe image rotation
3. Click "Auto-Rotate" again to stop

**Expected Results:**
- ✅ Button toggles on/off (green when active)
- ✅ Image automatically rotates on Y-axis (360° loop)
- ✅ Rotation speed is ~1° per 50ms (smooth)
- ✅ Clicking again stops rotation
- ✅ Manual drag disables auto-rotate

**What to Look For:**
- Consistent rotation speed
- No performance issues during auto-rotate
- Button state reflects active/inactive correctly
- Can re-enable after manual drag

---

#### 3.5 Reset View Button

**Steps:**
1. Rotate image to any position (drag or auto-rotate)
2. Click "Reset View" button
3. Observe image return to default

**Expected Results:**
- ✅ Image smoothly transitions back to rotation {x: 0, y: 0}
- ✅ Front-facing view restored
- ✅ Animation is smooth (not instant snap)
- ✅ Auto-rotate stops if active

**What to Look For:**
- Reset animation duration (~300-500ms)
- No jumpy transitions
- View returns to exact initial state

---

#### 3.6 Heatmap Intensity Slider

**Steps:**
1. Locate "Heatmap Intensity" slider at bottom
2. Drag slider from 0% to 100%
3. Observe image brightness changes

**Expected Results:**
- ✅ Slider moves smoothly (0-100 range)
- ✅ Image brightness increases as slider increases
- ✅ Effect applies in real-time (no delay)
- ✅ At 0%: Normal image brightness
- ✅ At 100%: Noticeably brighter (heatmap effect)

**What to Look For:**
- Smooth gradient of brightness levels
- No flickering during adjustment
- Effect is visible but not overpowering
- Slider value displays (percentage or number)

**Note:** Currently this is a simple brightness filter. In Phase 16, it will show a true heatmap overlay with color coding for skin concerns.

---

#### 3.7 Analysis Scores Legend

**Steps:**
1. Check right sidebar (or bottom on mobile)
2. Verify all scores display

**Expected Results:**
- ✅ 6 scores visible: Spots, Pores, Wrinkles, Texture, Redness, Overall
- ✅ Each score has color-coded severity:
  - 🟢 Green: 0-3 (Good)
  - 🟡 Yellow: 4-6 (Moderate)
  - 🔴 Red: 7-10 (Severe)
- ✅ Scores match those in Report tab
- ✅ Layout is clean and readable

**What to Look For:**
- Color coding is correct for severity
- Text is legible
- Responsive on different screen sizes

---

### Test 4: Simulator Tab - Treatment Effects ⭐⭐⭐⭐⭐

**Location:** Analysis Detail Page → "Simulator" Tab

#### 4.1 Initial Rendering

**Steps:**
1. Click "Simulator" tab
2. Observe the canvas and controls

**Expected Results:**
- ✅ PIXI.js canvas displays at top (shows face image)
- ✅ 6 effect sliders visible:
  - Smoothing (0-100)
  - Brightening (0-100)
  - Spot Removal (0-100)
  - Redness Reduction (0-100)
  - Pore Minimizing (0-100)
  - Wrinkle Reduction (0-100)
- ✅ Preset buttons visible: Mild, Moderate, Intensive
- ✅ Export button visible
- ✅ No console errors

**What to Look For:**
- PIXI.js canvas is not blank
- Image loaded successfully in canvas
- All controls are interactive (not disabled)

**Known Issue (Fixed):**
This was previously showing "Could not find source type" error. If you see this, the File/Blob fix didn't apply correctly.

---

#### 4.2 Smoothing Slider

**Steps:**
1. Set all sliders to 0% (reset)
2. Drag "Smoothing" slider from 0% to 100%
3. Observe skin texture changes

**Expected Results:**
- ✅ At 0%: Original image (no blur)
- ✅ At 50%: Moderate blur on skin
- ✅ At 100%: Heavy blur (skin looks very smooth)
- ✅ Effect applies in real-time
- ✅ Other areas (eyes, hair) less affected

**What to Look For:**
- Blur is selective (doesn't blur everything equally)
- Effect is gradual (not on/off)
- Canvas updates smoothly without lag

---

#### 4.3 Brightening Slider

**Steps:**
1. Reset all sliders to 0%
2. Drag "Brightening" slider from 0% to 100%
3. Observe overall brightness

**Expected Results:**
- ✅ At 0%: Original brightness
- ✅ At 50%: Moderately brighter
- ✅ At 100%: Significantly brighter (but not blown out)
- ✅ Skin tone looks lighter/more radiant

**What to Look For:**
- Brightness increase is uniform
- No overexposure (washed out whites)
- Color balance maintained

---

#### 4.4 Spot Removal Slider

**Steps:**
1. Reset all sliders to 0%
2. Drag "Spot Removal" slider from 0% to 100%
3. Observe blemishes/spots

**Expected Results:**
- ✅ At 0%: Spots visible
- ✅ At 50%: Spots less noticeable
- ✅ At 100%: Spots mostly removed/blended
- ✅ Effect targets dark spots/blemishes

**What to Look For:**
- Spots fade gradually
- Surrounding skin blends naturally
- No artificial patches or artifacts

---

#### 4.5 Redness Reduction Slider

**Steps:**
1. Reset all sliders to 0%
2. Drag "Redness Reduction" slider from 0% to 100%
3. Observe red areas (cheeks, nose)

**Expected Results:**
- ✅ At 0%: Original redness
- ✅ At 50%: Less red/pink tones
- ✅ At 100%: Redness significantly reduced
- ✅ Skin looks more even-toned

**What to Look For:**
- Red channel reduction
- Doesn't turn skin gray or unnatural
- Even application across face

---

#### 4.6 Pore Minimizing Slider

**Steps:**
1. Reset all sliders to 0%
2. Drag "Pore Minimizing" slider from 0% to 100%
3. Observe pore visibility

**Expected Results:**
- ✅ At 0%: Pores visible
- ✅ At 50%: Pores less prominent
- ✅ At 100%: Pores mostly invisible
- ✅ Skin texture looks smoother

**What to Look For:**
- Pores blur/blend into skin
- Effect is localized (doesn't blur everything)
- Natural-looking result

---

#### 4.7 Wrinkle Reduction Slider

**Steps:**
1. Reset all sliders to 0%
2. Drag "Wrinkle Reduction" slider from 0% to 100%
3. Observe fine lines and wrinkles

**Expected Results:**
- ✅ At 0%: Wrinkles visible
- ✅ At 50%: Wrinkles softened
- ✅ At 100%: Wrinkles significantly reduced
- ✅ Skin looks younger/smoother

**What to Look For:**
- Wrinkle lines fade gradually
- Depth of wrinkles appears reduced
- Natural facial contours maintained

---

#### 4.8 Preset Buttons

**Steps:**
1. Reset all sliders to 0%
2. Click "Mild" button
3. Observe slider values change
4. Click "Moderate" button
5. Observe slider values increase
6. Click "Intensive" button
7. Observe maximum effect

**Expected Results:**
- ✅ **Mild**: All sliders ~20-30%
- ✅ **Moderate**: All sliders ~50-60%
- ✅ **Intensive**: All sliders ~80-100%
- ✅ Canvas updates immediately
- ✅ Preset buttons highlight when active

**What to Look For:**
- Preset values are balanced across all effects
- Visual difference between each preset level
- Buttons provide clear feedback (active state)

---

#### 4.9 Export Canvas

**Steps:**
1. Apply some effects (use any preset or manual adjustments)
2. Click "Export" button
3. Check browser downloads folder

**Expected Results:**
- ✅ Download starts immediately
- ✅ File saved as PNG image
- ✅ Filename includes timestamp (e.g., `treatment-result-2025-11-01.png`)
- ✅ Image quality is high (not pixelated)
- ✅ Effects are applied in exported image

**What to Look For:**
- Downloaded file opens correctly
- Effects match what was shown in canvas
- Image resolution is good
- No watermarks or artifacts

---

#### 4.10 Combined Effects

**Steps:**
1. Reset all sliders to 0%
2. Gradually increase all 6 sliders together
3. Observe cumulative effect

**Expected Results:**
- ✅ All effects apply simultaneously
- ✅ Result looks natural (not overly processed)
- ✅ Performance remains smooth (60fps)
- ✅ No canvas freezing or lag

**What to Look For:**
- Effects don't conflict with each other
- Canvas rendering stays smooth
- Memory usage doesn't spike
- Browser doesn't slow down

---

### Test 5: Live Camera AR (Future Feature) ⏸️

**Status:** Code complete but requires camera permission and manual interaction.

**Steps:**
1. Navigate to AR Simulator page (if accessible)
2. Grant camera permission when prompted
3. Observe face detection overlay

**Expected Results:**
- Camera stream displays
- MediaPipe detects face (468 landmarks)
- Face mesh overlay renders
- FPS counter shows ~30 FPS

**Note:** This feature may not be fully integrated into pages yet. Skip if not accessible.

---

### Test 6: Before/After Slider (Future Feature) ⏸️

**Status:** Code complete but not yet integrated into analysis detail page.

**Expected Results:**
- Interactive slider divides image
- Drag to compare before/after
- Haptic feedback at 50% midpoint (mobile)
- Fullscreen mode toggle

**Note:** This component exists but may not be visible in current UI. Skip if not accessible.

---

## 🐛 Bug Reporting Template

If you encounter any issues, please report using this format:

\`\`\`markdown
### Bug Report

**Feature:** [e.g., 3D View - Drag to Rotate]
**Browser:** [e.g., Chrome 120, Firefox 121, Safari 17]
**OS:** [e.g., Windows 11, macOS 14, iOS 17]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Third step]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Console Errors:** (Press F12 → Console tab)
\`\`\`
[Paste any error messages here]
\`\`\`

**Screenshot:** (if applicable)
[Attach screenshot]

**Additional Notes:**
[Any other relevant information]
\`\`\`

---

## ✅ Testing Completion Checklist

After completing all tests, verify:

- [ ] **Basic Analysis Flow** - Upload and analysis working
- [ ] **VISIA Report Tab** - All sections display correctly
- [ ] **3D View - Initial Rendering** - Image displays with 3D effect
- [ ] **3D View - Drag Rotation** - Mouse/touch rotation works
- [ ] **3D View - Auto-Rotate** - Button toggles animation
- [ ] **3D View - Reset View** - Returns to default position
- [ ] **3D View - Heatmap Slider** - Brightness adjusts
- [ ] **3D View - Analysis Scores** - Legend displays correctly
- [ ] **Simulator - Initial Rendering** - PIXI.js canvas loads
- [ ] **Simulator - All 6 Sliders** - Effects apply correctly
- [ ] **Simulator - Preset Buttons** - Mild/Moderate/Intensive work
- [ ] **Simulator - Export Canvas** - Download works
- [ ] **Simulator - Combined Effects** - Multiple effects work together
- [ ] **No Console Errors** - Browser console is clean
- [ ] **Responsive Design** - Works on desktop and mobile

---

## 🎯 Success Criteria

**Minimum Viable Product (MVP) Ready:**
- ✅ At least 80% of tests pass
- ✅ No critical errors (page crashes, data loss)
- ✅ Core analysis pipeline works end-to-end
- ✅ At least 4/6 simulator effects work correctly
- ✅ 3D View rotation works (drag OR auto-rotate)

**Production Ready:**
- ✅ 100% of current tests pass
- ✅ No console errors
- ✅ All effects work smoothly
- ✅ Performance is good (60fps, <100ms response)
- ✅ Works on multiple browsers/devices

---

## 📊 Test Results Summary

After testing, fill in:

**Tests Passed:** __ / 13  
**Tests Failed:** __ / 13  
**Tests Skipped:** __ / 13  

**Critical Issues Found:** [List any blocking bugs]  
**Minor Issues Found:** [List any non-blocking bugs]  
**Performance Notes:** [Any lag, slowness, or optimization needs]

**Overall Assessment:**
- [ ] ✅ Ready for production
- [ ] ⚠️ Ready with minor issues
- [ ] ❌ Needs fixes before production

---

## 🚀 Next Steps Based on Results

### If All Tests Pass (MVP Ready) ✅

**Immediate:**
1. Celebrate! 🎉 You have a working AR skin analysis system
2. Take screenshots/screen recordings for documentation
3. Show demo to stakeholders

**Short-term (1-2 weeks):**
1. Polish UI/UX based on user feedback
2. Optimize performance (lazy loading, caching)
3. Add analytics tracking
4. Prepare for production deployment

**Medium-term (3-4 weeks):**
1. Begin Phase 15: Real AI Detection (TensorFlow.js models)
2. Start collecting training data (5000+ labeled images)
3. Plan Phase 16: Advanced AR Features (real 3D mesh)

---

### If Some Tests Fail (Needs Fixes) ⚠️

**Priority 1: Fix Critical Bugs**
- Page crashes
- Image upload failures
- Analysis pipeline errors
- Database save failures

**Priority 2: Fix Major Bugs**
- PIXI.js rendering issues
- Rotation not working
- Effects not applying
- Export failures

**Priority 3: Fix Minor Bugs**
- UI glitches
- Slow performance
- Layout issues
- Browser compatibility

**Workflow:**
1. Document all bugs in detail
2. Prioritize by severity
3. Fix critical bugs first
4. Re-test after each fix
5. Repeat until MVP ready

---

### If Tests Reveal Major Issues (Not Ready) ❌

**Immediate Actions:**
1. Stop and analyze root cause
2. Check server logs for errors
3. Review recent code changes
4. Consider rolling back to last working state

**Recovery Steps:**
1. Identify which component/feature is broken
2. Isolate the issue (disable feature temporarily)
3. Fix underlying problem
4. Re-enable feature
5. Full regression testing

**Escalation:**
If issues are beyond quick fix:
- Document current state thoroughly
- Create detailed bug reports
- Consider architectural review
- May need to refactor problematic components

---

## 📞 Support & Resources

**Documentation:**
- `docs/AR_TESTING_RESULTS.md` - Session summary and fixes
- `docs/AR_COMPONENTS_INSPECTION.md` - Component verification
- `docs/QUICK_FIX_AI_GATEWAY_ERROR.md` - AI Gateway error fix
- `README.md` - Project overview

**Key Files:**
- `app/analysis/detail/[id]/page.tsx` - Analysis detail page with 3 tabs
- `components/ar/face-3d-viewer.tsx` - 3D View component (2D fallback)
- `components/ar/treatment-simulator.tsx` - Simulator component (PIXI.js)
- `lib/ar/skin-effects.ts` - PIXI.js effects processor
- `lib/ai/hybrid-skin-analyzer.ts` - Main analysis orchestrator

**Server URLs:**
- Local: http://localhost:3000
- Network: http://192.168.1.178:3000 (for mobile testing on same WiFi)

**API Endpoints:**
- POST `/api/skin-analysis/analyze` - Upload and analyze image
- GET `/api/skin-analysis/[id]` - Fetch analysis results

**Browser DevTools:**
- Press **F12** to open developer tools
- **Console** tab - View JavaScript errors
- **Network** tab - Check API requests
- **Performance** tab - Profile frame rate
- **Mobile** icon - Test responsive design

---

## 🎓 Testing Tips

**Performance Testing:**
- Open DevTools → Performance tab
- Record while interacting with 3D View/Simulator
- Look for:
  - Frame rate (should be ~60fps)
  - Long tasks (>50ms)
  - Memory leaks (increasing heap size)

**Mobile Testing:**
- Use Chrome DevTools device emulation
- Test common devices:
  - iPhone 12/13/14 (iOS Safari)
  - Samsung Galaxy S21/S22 (Android Chrome)
  - iPad Pro (tablet layout)
- Test both portrait and landscape orientations

**Cross-Browser Testing:**
- Chrome/Edge (Chromium) - Primary target
- Firefox - Secondary
- Safari - Important for iOS
- Mobile browsers - Critical for AR features

**Network Conditions:**
- Test on slow 3G to see loading behavior
- Chrome DevTools → Network → Throttling
- Ensure analysis doesn't timeout

---

**Good luck with testing! 🚀**

**Remember:** This is an MVP with 2D fallback mode. Phase 16 will bring true 3D mesh rendering, real treatment physics, and advanced AR features. For now, we're validating that the foundation works correctly.

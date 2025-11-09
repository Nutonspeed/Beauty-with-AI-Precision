# 🧪 E2E Testing Guide - Complete Workflow

## ✅ Pre-Test Checklist

Run automated checks first:
```powershell
powershell -ExecutionPolicy Bypass -File "test-e2e-workflow.ps1"
```

Expected output:
- ✅ AI Service: HEALTHY
- ✅ Next.js Server: RUNNING
- ✅ AI Analysis: VERIFIED (95.1 score, ~570ms)

---

## 📋 Manual E2E Test Steps

### Phase 1: Upload & Analysis

1. **Open Analysis Page**
   ```
   http://localhost:3000/analysis
   OR
   http://localhost:3000/en/analysis
   ```

2. **Upload Test Image**
   - Use file: `ai-service/test_images/face_sample.jpg`
   - OR drag & drop into upload area
   - Click "Start Analysis" button

3. **Wait for Analysis**
   - Progress indicator should show
   - Should complete in ~5-10 seconds
   - Watch browser console for logs

4. **Check Response**
   - Should redirect to results page OR
   - Should show analysis results inline
   - Note the analysis ID if visible

---

### Phase 2: Database Verification

**Option A: Using Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to Table Editor → `skin_analyses`
4. Sort by `analyzed_at` DESC
5. Find latest record
6. Copy the `id` column value

**Option B: Using SQL Query**
```sql
SELECT 
  id, 
  user_id, 
  overall_score, 
  spots_score,
  wrinkles_score,
  texture_score,
  analyzed_at 
FROM skin_analyses 
ORDER BY analyzed_at DESC 
LIMIT 1;
```

**Expected Data:**
- `overall_score`: ~95 (0-100)
- `spots_score`: ~90-100
- `wrinkles_score`: ~85-95
- `texture_score`: ~60-70
- All 8 mode scores should be populated
- `image_url`: Should have Supabase storage URL
- `user_id`: Should match logged-in user

---

### Phase 3: Detail Page Testing

1. **Navigate to Detail Page**
   ```
   http://localhost:3000/analysis/[ANALYSIS_ID]
   
   Example:
   http://localhost:3000/analysis/123e4567-e89b-12d3-a456-426614174000
   ```

2. **Verify Overall Score Section**
   - [ ] Overall score displayed (0-100)
   - [ ] Health grade badge (A+, A, B, C, D, F)
   - [ ] Badge color matches score
   - [ ] Original image shows
   - [ ] Visualization image shows (if available)
   - [ ] Processing time displayed
   - [ ] Analysis ID shown (truncated)
   - [ ] "Analyzed X ago" timestamp

3. **Verify Overview Tab**
   - [ ] 8 mode cards displayed in grid
   - [ ] Each card shows:
     - Mode icon (🔴 ✨ 📏 ⚪ ☀️ 🟤 🔺 💧)
     - Mode name
     - Score (0-100)
     - Count or percentage
     - Severity badge (mild/moderate/severe)
     - Badge color (green/yellow/orange/red)

4. **Verify Details Tab**
   - [ ] Click "Detailed Results" tab
   - [ ] All 8 modes listed vertically
   - [ ] Each mode shows:
     - Icon + Name
     - Detection count/percentage
     - Severity level
     - Health score with progress bar
     - Progress bar color matches score

5. **Verify Recommendations Tab**
   - [ ] Click "Recommendations" tab
   - [ ] If recommendations exist:
     - Treatments section
     - Products section
     - Lifestyle tips section
   - [ ] If no recommendations:
     - "No recommendations available" message shows

6. **Verify Navigation**
   - [ ] "Back to Analyses" button works
   - [ ] Returns to analysis list/home
   - [ ] Share button present (functionality TBD)
   - [ ] Export PDF button present (functionality TBD)

7. **Verify Security**
   - [ ] Logged-in user can view own analysis
   - [ ] Try accessing another user's analysis (should 404)
   - [ ] Logout and try accessing (should redirect to login)
   - [ ] Login as admin/doctor (should see all analyses)

8. **Verify Responsive Design**
   - [ ] Desktop (1920x1080): Grid layout
   - [ ] Tablet (768x1024): 2-column grid
   - [ ] Mobile (375x667): Single column
   - [ ] All content readable
   - [ ] No horizontal scroll
   - [ ] Images scale properly

---

## 🐛 Common Issues & Fixes

### Issue: "404 Not Found"
**Cause**: Analysis ID doesn't exist or user doesn't own it
**Fix**: 
- Verify analysis ID is correct
- Check user_id matches logged-in user
- Try with admin account

### Issue: "Redirect to Login"
**Cause**: Not authenticated
**Fix**: 
- Login or register
- Check session cookies
- Clear browser cache

### Issue: "Images Not Loading"
**Cause**: Storage bucket permissions or URL issues
**Fix**:
- Check Supabase storage bucket policies
- Verify image_url in database
- Check browser network tab for errors

### Issue: "Scores Show NaN or 0"
**Cause**: Database values are null
**Fix**:
- Re-run analysis
- Check API response saved data correctly
- Verify database migration

### Issue: "Recommendations Empty"
**Cause**: recommendations JSONB column is null
**Fix**:
- This is expected if AI didn't generate recommendations
- Can add mock recommendations for testing

---

## ✅ Test Results Checklist

### Backend Integration
- [ ] AI service returns valid response (95.1 score)
- [ ] All 8 modes return data
- [ ] Processing time reasonable (<1000ms)
- [ ] Database save successful
- [ ] Storage bucket upload works
- [ ] Image URLs accessible

### Frontend Components
- [ ] Server component fetches data
- [ ] Client component renders UI
- [ ] Authentication works
- [ ] Authorization enforced
- [ ] Images display correctly
- [ ] Tabs navigate properly
- [ ] Responsive design works

### User Experience
- [ ] Upload flow smooth
- [ ] Analysis completes quickly
- [ ] Results page loads fast (<2s)
- [ ] Detail page informative
- [ ] Navigation intuitive
- [ ] No console errors
- [ ] No visual bugs

---

## 📊 Performance Benchmarks

**Target Performance:**
- Upload → Analysis: < 10 seconds
- API Response: < 5 seconds
- Detail Page Load: < 2 seconds
- Image Display: < 1 second

**Current Performance:**
- AI Service: ~570ms ✅
- Database Save: ~500ms (estimate)
- Page Load: TBD (manual test)

---

## 🔜 Future Enhancements

After E2E test passes:
1. **Comparison View**
   - Select previous analysis for comparison
   - Side-by-side before/after
   - Score difference indicators

2. **Progress Tracking**
   - Chart showing score trends over time
   - Improvement/decline highlights

3. **Export Functionality**
   - Generate PDF report
   - Include images and recommendations

4. **Share Functionality**
   - Generate shareable link
   - Privacy controls
   - Expiration settings

---

## 📝 Test Log Template

```
=== E2E Test Log ===
Date: [DATE]
Tester: [NAME]
Browser: [Chrome/Firefox/Safari]
Device: [Desktop/Tablet/Mobile]

PHASE 1: Upload & Analysis
- Image uploaded: ✅/❌
- Analysis completed: ✅/❌
- Time taken: [X seconds]
- Error (if any): [ERROR]

PHASE 2: Database
- Record created: ✅/❌
- Analysis ID: [UUID]
- User ID: [UUID]
- Overall Score: [SCORE]

PHASE 3: Detail Page
- Page loaded: ✅/❌
- Overall score displayed: ✅/❌
- 8 modes displayed: ✅/❌
- Images displayed: ✅/❌
- Tabs working: ✅/❌
- Responsive: ✅/❌

ISSUES FOUND:
1. [ISSUE 1]
2. [ISSUE 2]

OVERALL STATUS: ✅ PASS / ❌ FAIL
```

---

## 🚀 Quick Start

```powershell
# 1. Check services
powershell -ExecutionPolicy Bypass -File "test-e2e-workflow.ps1"

# 2. Open browser
start http://localhost:3000/analysis

# 3. Upload test image
# File: ai-service/test_images/face_sample.jpg

# 4. Get analysis ID
# From database or console logs

# 5. View detail page
start http://localhost:3000/analysis/[ID]
```

---

**Ready to test!** 🎉

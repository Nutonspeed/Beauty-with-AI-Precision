# Skin Analysis Migration Guide

## Overview
This guide explains how to set up the new AI/AR Skin Analysis System (Phase 1-5) in your Supabase database.

## 🤖 AI Architecture Note

**Server-Side (Node.js API Routes)**:
- ✅ **Google Vision API**: Face detection & validation (85% confidence)
- ✅ **CV Algorithms**: 6 traditional algorithms (spots, pores, wrinkles, texture, color, redness)
- ❌ **Phase 1 Hybrid AI**: Not available (requires browser APIs)

**Client-Side (Browser - Future Enhancement)**:
- 🔄 **MediaPipe**: Face landmarks (478 points) + Segmentation [35%] - Requires `navigator`, WebGL
- 🔄 **TensorFlow.js**: MobileNetV3 + DeepLabV3+ [40%] - Requires `webgl` backend
- 🔄 **HuggingFace Transformers.js**: DINOv2 + SAM + CLIP [25%] - Requires CDN access

**Why Server-Side Hybrid AI Fails**:
- `navigator` is undefined in Node.js
- TensorFlow.js `webgl` backend not available in Node.js (only `cpu`, `wasm`)
- HuggingFace Transformers.js cannot download models from CDN in server environment
- MediaPipe requires browser `FilesetResolver` and DOM APIs

**Current Solution**: Google Vision API provides reliable server-side analysis with 85% confidence, combined with CV algorithms for comprehensive results.

---

## 📋 Prerequisites

1. **Supabase Project**: Active project with database access
2. **Supabase CLI**: Installed and authenticated
3. **Environment Variables**: Properly configured `.env.local`
4. **Google Cloud Vision API**: Credentials file (`google-credentials.json`)

---

## 🚀 Quick Start

### Option 1: Run Migration SQL Directly

1. **Open Supabase Dashboard**
   \`\`\`
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   \`\`\`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Run Migration**
   - Copy entire content from `supabase/migrations/20250101_skin_analyses.sql`
   - Paste into SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Success**
   - Check "Table Editor" → should see `skin_analyses` table
   - Check "Storage" → should see `skin-analysis-images` bucket

### Option 2: Use Supabase CLI (Recommended for production)

\`\`\`bash
# 1. Login to Supabase
supabase login

# 2. Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# 3. Apply migration
supabase db push

# Or run migration file directly
supabase db reset
\`\`\`

---

## 📊 Database Schema

### `skin_analyses` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key to auth.users |
| `image_url` | TEXT | URL to analysis image in storage |
| `overall_score` | INTEGER | Overall skin health score (0-100) |
| `confidence` | INTEGER | AI confidence percentage (0-100) |
| **CV Analysis - Spots** | | |
| `spots_severity` | INTEGER | Severity score (1-10) |
| `spots_count` | INTEGER | Number of spots detected |
| `spots_percentile` | INTEGER | Percentile ranking (0-100) |
| **CV Analysis - Pores** | | |
| `pores_severity` | INTEGER | Severity score (1-10) |
| `pores_count` | INTEGER | Number of pores detected |
| `pores_percentile` | INTEGER | Percentile ranking (0-100) |
| **CV Analysis - Wrinkles** | | |
| `wrinkles_severity` | INTEGER | Severity score (1-10) |
| `wrinkles_count` | INTEGER | Number of wrinkles detected |
| `wrinkles_percentile` | INTEGER | Percentile ranking (0-100) |
| **CV Analysis - Texture** | | |
| `texture_severity` | INTEGER | Severity score (1-10) |
| `texture_percentile` | INTEGER | Percentile ranking (0-100) |
| **CV Analysis - Redness** | | |
| `redness_severity` | INTEGER | Severity score (1-10) |
| `redness_count` | INTEGER | Number of red regions |
| `redness_percentile` | INTEGER | Percentile ranking (0-100) |
| **Overall Percentile** | | |
| `overall_percentile` | INTEGER | Overall percentile (0-100) |
| **AI Analysis** | | |
| `ai_skin_type` | TEXT | Detected skin type |
| `ai_concerns` | TEXT[] | Array of skin concerns |
| `ai_severity` | JSONB | AI severity breakdown |
| `ai_treatment_plan` | TEXT | Recommended treatment plan |
| **Recommendations** | | |
| `recommendations` | TEXT[] | Array of recommendations |
| **Patient Info** | | |
| `patient_name` | TEXT | Optional patient name |
| `patient_age` | INTEGER | Optional patient age |
| `patient_gender` | TEXT | Optional patient gender |
| `patient_skin_type` | TEXT | Optional patient skin type |
| **Metadata** | | |
| `notes` | TEXT | Doctor/clinic notes |
| `analysis_time_ms` | INTEGER | Analysis duration in ms |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

---

## 🔒 Row Level Security (RLS)

The migration automatically creates these RLS policies:

1. **SELECT**: Users can view their own analyses
2. **INSERT**: Users can create analyses for themselves
3. **UPDATE**: Users can update their own analyses
4. **DELETE**: Users can delete their own analyses

---

## 🖼️ Storage Bucket

### `skin-analysis-images`

**Folder Structure:**
\`\`\`
skin-analysis-images/
  ├── {user_id}/
  │   ├── {timestamp1}.jpg
  │   ├── {timestamp2}.jpg
  │   └── ...
\`\`\`

**Storage Policies:**
- ✅ Authenticated users can upload to their own folder
- ✅ Users can view their own images
- ✅ Public can view images (for sharing reports)
- ✅ Users can delete their own images

---

## 🧪 Testing Migration

### 1. Verify Table Structure

\`\`\`sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'skin_analyses';

-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'skin_analyses';
\`\`\`

### 2. Verify RLS Policies

\`\`\`sql
-- List all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'skin_analyses';
\`\`\`

### 3. Verify Storage Bucket

\`\`\`sql
-- Check bucket exists
SELECT * FROM storage.buckets 
WHERE name = 'skin-analysis-images';

-- Check storage policies
SELECT * FROM storage.policies 
WHERE bucket_id = 'skin-analysis-images';
\`\`\`

### 4. Test Insert (via API)

\`\`\`bash
# Test analysis API endpoint
curl -X POST http://localhost:3000/api/skin-analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
\`\`\`

---

## 🔧 Troubleshooting

### Error: "relation already exists"

**Solution**: Table already created. You can:
\`\`\`sql
-- Drop and recreate
DROP TABLE IF EXISTS public.skin_analyses CASCADE;
-- Then run migration again
\`\`\`

### Error: "bucket already exists"

**Solution**: Bucket already created. Ignore or:
\`\`\`sql
DELETE FROM storage.buckets WHERE name = 'skin-analysis-images';
-- Then run migration again
\`\`\`

### Error: "permission denied"

**Solution**: Check RLS policies are enabled and correct.

### Error: "foreign key violation"

**Solution**: Ensure `auth.users` table exists (default Supabase table).

---

## 📁 Related Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20250101_skin_analyses.sql` | Migration SQL |
| `app/api/skin-analysis/analyze/route.ts` | Analysis API endpoint |
| `app/api/skin-analysis/history/route.ts` | History API endpoint |
| `app/api/skin-analysis/[id]/route.ts` | Detail API endpoint |
| `app/api/skin-analysis/[id]/notes/route.ts` | Notes API endpoint |
| `components/analysis/visia-report.tsx` | VISIA-style report UI |
| `lib/ai/hybrid-skin-analyzer.ts` | Hybrid AI analyzer |

---

## 🎯 Next Steps

1. ✅ Run migration SQL
2. ✅ Verify table and bucket created
3. ✅ Test API endpoints
4. ✅ Upload test image
5. ✅ View analysis report
6. ✅ Export to PDF/PNG

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → API
2. Check database errors: Dashboard → Database → Logs
3. Verify environment variables in `.env.local`
4. Check API route logs in browser DevTools

---

## 🚨 Important Notes

- **Storage Limits**: Free tier = 1GB, upgrade if needed
- **Database Limits**: Free tier = 500MB, monitor usage
- **RLS**: Always enabled for security
- **Indexes**: Created for performance on `user_id`, `created_at`, `overall_score`
- **Triggers**: Auto-update `updated_at` timestamp

---

## 📈 Performance Tips

1. **Indexes**: Already created for common queries
2. **Pagination**: Use `limit` and `offset` in history API
3. **Image Optimization**: Resize before upload (max 2048x2048)
4. **Caching**: Consider Redis for frequent reads
5. **CDN**: Use Supabase CDN for image delivery

---

## ✅ Migration Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Migration SQL executed
- [ ] Table `skin_analyses` exists
- [ ] Storage bucket `skin-analysis-images` exists
- [ ] RLS policies verified
- [ ] Test upload successful
- [ ] Test API endpoints working
- [ ] Test report generation
- [ ] Test export features

---

**Migration Date**: January 1, 2025  
**Schema Version**: 1.0.0  
**Compatible with**: Phase 1-5 (AI/AR Skin Analysis System)

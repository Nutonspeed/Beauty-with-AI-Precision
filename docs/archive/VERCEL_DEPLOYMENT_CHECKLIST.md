# ✅ Vercel Deployment Checklist

## 📋 Pre-Deployment Tasks

### 1. Environment Variables (Vercel Dashboard)
ตั้งค่าใน: **Vercel Project Settings > Environment Variables**

#### Required (ต้องมี)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXTAUTH_SECRET=your-random-secret-minimum-32-chars
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Optional AI Features
```bash
# Hugging Face (Free tier)
HUGGINGFACE_TOKEN=hf_xxx

# Google Gemini (Free 1,500 req/day)
GEMINI_API_KEY=AIza...

# OpenAI GPT-4o
OPENAI_API_KEY=sk-xxx

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxx
```

#### Python AI Service (ถ้ามี)
```bash
# ⚠️ ต้อง deploy AI service แยกก่อน
AI_SERVICE_URL=https://your-ai-service.railway.app
```

---

## 🏗️ Build Configuration

### Vercel Settings (Auto-detect from vercel.json)
- **Framework**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Node Version**: 20.x (recommended)

---

## ⚙️ Current Configuration Status

### ✅ Ready Files
- [x] `vercel.json` - Build config, functions timeout (30s), CORS headers
- [x] `.vercelignore` - Excludes tests, docs, scripts
- [x] `next.config.mjs` - Production optimizations enabled
- [x] `package.json` - Build scripts ready

### ⚠️ Known Issues

#### 1. TypeScript Build Errors
**Current State**: `ignoreBuildErrors: true` ใน `next.config.mjs`
**Risk**: อาจมี type errors ที่ไม่ถูกตรวจสอบ
**Action**: 
- ถ้าต้องการ deploy ด่วน → ปล่อยไว้
- ถ้าต้องการ production ready → ต้องแก้ type errors ก่อน

```bash
# ตรวจสอบ type errors
pnpm type-check
```

#### 2. Python AI Service
**Current State**: `ai-service/` folder ใช้ FastAPI
**Problem**: Vercel ไม่รองรับ Python persistent servers
**Solutions**:
- **Option A**: Deploy AI service แยก (Railway, Render, AWS)
- **Option B**: Disable AI features ชั่วคราว
- **Option C**: Convert เป็น Vercel Serverless Functions (Python runtime)

#### 3. Image Optimization
**Current State**: `images.unoptimized = true`
**Impact**: รูปจะไม่ถูก optimize ทำให้โหลดช้า
**Recommendation**: เปิด optimization ใน production

```javascript
// next.config.mjs
images: {
  unoptimized: false, // เปลี่ยนเป็น false
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co', // เพิ่ม Supabase storage
    },
  ],
}
```

---

## 🚀 Deployment Steps

### Step 1: Verify Local Build
```bash
# ตรวจสอบว่า build ผ่านหรือไม่
pnpm build

# ทดสอบ production build
pnpm start
```

### Step 2: Commit Changes
```bash
git add -A
git commit -m "chore: prepare for Vercel deployment"
git push origin main
```

### Step 3: Deploy to Vercel

#### Method A: Import from GitHub
1. ไปที่ https://vercel.com/new
2. เลือก repository: `Nutonspeed/Beauty-with-AI-Precision`
3. กด **Import**
4. ตั้งค่า Environment Variables (ตาม checklist ข้างบน)
5. กด **Deploy**

#### Method B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 4: Post-Deployment Verification
```bash
# 1. Check health endpoint
curl https://your-app.vercel.app/api/health

# 2. Test authentication
# เปิด browser → https://your-app.vercel.app/auth/login

# 3. Verify Supabase connection
# ลองสมัครสมาชิกใหม่

# 4. Test API endpoints
curl https://your-app.vercel.app/api/user-profile
```

---

## 🔧 Recommended Improvements

### Before Production
1. **Enable TypeScript Strict Mode**
   ```typescript
   // next.config.mjs
   typescript: {
     ignoreBuildErrors: false, // เปลี่ยนเป็น false
   }
   ```

2. **Add Error Tracking**
   - Setup Sentry (มี env var อยู่แล้ว)
   - Add `NEXT_PUBLIC_SENTRY_DSN`

3. **Database Migration**
   ```bash
   # Verify Supabase migrations
   pnpm check:db
   ```

4. **Deploy AI Service Separately**
   ```bash
   # Railway example
   railway login
   railway init
   railway up
   ```

---

## 📊 Performance Checklist

- [ ] Enable image optimization (`unoptimized: false`)
- [ ] Remove `console.log` in production (already configured)
- [ ] Enable CSS optimization (already configured)
- [ ] Optimize package imports (already configured)
- [ ] Add CDN for static assets (Vercel handles automatically)

---

## 🐛 Common Issues

### Issue 1: API Routes Timeout
**Symptom**: 504 Gateway Timeout
**Cause**: API route takes > 30s
**Fix**: Increase timeout in `vercel.json` (max 60s on Pro plan)

### Issue 2: Missing Environment Variables
**Symptom**: `process.env.XXX is undefined`
**Cause**: ไม่ได้ตั้งค่าใน Vercel Dashboard
**Fix**: เพิ่ม env vars และ redeploy

### Issue 3: Build Fails
**Symptom**: Build error in logs
**Cause**: TypeScript errors, missing dependencies
**Fix**: 
```bash
# Test locally
pnpm build

# Check logs
vercel logs your-app-url.vercel.app
```

---

## 📝 Post-Deployment Tasks

1. **Update NEXTAUTH_URL** ใน Vercel env vars
2. **Add Custom Domain** (optional)
3. **Setup Monitoring** (Vercel Analytics)
4. **Enable Preview Deployments** (auto-deploy branches)
5. **Add Team Members** ถ้ามี
6. **Setup Supabase Edge Functions** (optional)

---

## 🔐 Security Reminders

- ✅ Never commit `.env` files
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` only in API routes
- ✅ CORS headers configured in `vercel.json`
- ✅ Security headers enabled in `next.config.mjs`
- ⚠️ Review API rate limiting (TODO)

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase + Vercel**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **Project Repository**: https://github.com/Nutonspeed/Beauty-with-AI-Precision

---

**Last Updated**: 2025-01-09
**Status**: ✅ Ready for deployment (with known limitations)

# 🚀 ClinicIQ Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/cliniciq)

### Option 2: CLI Deploy

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod
```

---

## Environment Variables (Required)

Set these in Vercel Dashboard → Settings → Environment Variables:

### Core (Required)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### AI Services (Optional but Recommended)
```env
# OpenAI (for GPT)
OPENAI_API_KEY=sk-xxx

# Anthropic (for Claude)
ANTHROPIC_API_KEY=sk-ant-xxx

# Google Gemini (Free tier)
GEMINI_API_KEY=AIzaSyxxx

# Hugging Face
HUGGINGFACE_TOKEN=hf_xxx
```

### Email & Monitoring (Optional)
```env
# Resend (Email)
RESEND_API_KEY=re_xxx

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] TypeScript: 0 errors
- [x] ESLint: 0 errors
- [x] Production build: Success (434 pages)

### ✅ Features
- [x] AI Skin Analysis
- [x] AR Treatment Simulator
- [x] Sales Dashboard
- [x] Lead Management
- [x] Multi-tenant Architecture
- [x] Mobile Responsive

### ✅ Documentation
- [x] API Documentation
- [x] User Guide (Thai)
- [x] Security Audit Report

### ⏳ Configuration
- [ ] Production API keys
- [ ] Domain configuration
- [ ] SSL certificate (auto by Vercel)

---

## Post-Deployment Steps

### 1. Verify Deployment
```bash
# Check health endpoint
curl https://your-domain.vercel.app/api/health

# Check system status
curl https://your-domain.vercel.app/api/system/status
```

### 2. Configure Domain
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### 3. Set up Monitoring
1. Enable Vercel Analytics
2. Configure Sentry (if using)
3. Set up uptime monitoring

---

## Database Setup (Supabase)

### Run Migrations
```bash
# Connect to Supabase
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

### Verify RLS Policies
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Environment Variables Not Working
- Ensure variables are set in Vercel Dashboard
- Redeploy after adding/changing variables

### Database Connection Issues
- Check Supabase project is running
- Verify connection string is correct
- Check RLS policies allow access

---

## Support

- **Documentation**: `/docs` folder
- **API Reference**: `docs/API_DOCUMENTATION.md`
- **User Guide**: `docs/USER_GUIDE.md`
- **Security Report**: `SECURITY_AUDIT_REPORT.md`

---

## Quick Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Type Check
pnpm type-check

# Lint
pnpm lint

# Test
pnpm test
```

---

**🎉 Ready to deploy! Good luck!**

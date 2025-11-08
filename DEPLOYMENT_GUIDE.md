# 🚀 Vercel Deployment Guide

## Overview
This guide walks you through deploying the Beauty AI application to Vercel production environment.

---

## Prerequisites

Before deploying, ensure you have:
- ✅ Vercel account ([sign up here](https://vercel.com))
- ✅ GitHub repository connected to your Vercel account
- ✅ All required API credentials (see Environment Variables section)
- ✅ Supabase project set up with database tables
- ✅ Google Cloud Vision API enabled
- ✅ OpenAI API key

---

## Step 1: Prepare Google Cloud Credentials

### Convert google-credentials.json to single-line JSON

Vercel's serverless environment requires credentials as an environment variable, not a file.

#### Option A: Using PowerShell
```powershell
# Convert JSON file to single line
$json = Get-Content -Path .\google-credentials.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
echo $json
```

#### Option B: Using Node.js
```bash
node -e "console.log(JSON.stringify(require('./google-credentials.json')))"
```

#### Option C: Manual
1. Open `google-credentials.json`
2. Copy entire content
3. Remove all newlines and spaces between JSON elements
4. Result should be: `{"type":"service_account","project_id":"...","private_key":"...","client_email":"...",...}`

**⚠️ Important:** Keep the `\n` characters inside the `private_key` field. They are required for the RSA key to work.

---

## Step 2: Connect Repository to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Select your GitHub account
   - Find `Beauty-with-AI-Precision` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave as default)
   - Build Command: `pnpm build` (already configured in `vercel.json`)
   - Output Directory: `.next` (default)

4. **Don't deploy yet!** Click "Environment Variables" first.

---

## Step 3: Configure Environment Variables

### Required Variables (Must Set)

#### Google Cloud Vision API
```bash
Name: GOOGLE_CREDENTIALS_JSON
Value: <paste your single-line JSON from Step 1>
Environment: Production, Preview, Development
```

#### Supabase Configuration
```bash
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production, Preview, Development
```

```bash
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGc... (your anon/public key)
Environment: Production, Preview, Development
```

```bash
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGc... (your service role key - keep secret!)
Environment: Production
```

#### Application URL
```bash
Name: NEXT_PUBLIC_APP_URL
Value: https://your-app-name.vercel.app (update after first deploy)
Environment: Production, Preview, Development
```

#### OpenAI API
```bash
Name: OPENAI_API_KEY
Value: sk-proj-... (your OpenAI API key)
Environment: Production, Preview, Development
```

#### Google Maps API
```bash
Name: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIza... (your Google Maps API key)
Environment: Production, Preview, Development
```

#### Ably Realtime (for chat/notifications)
```bash
Name: NEXT_PUBLIC_ABLY_API_KEY
Value: your-ably-api-key
Environment: Production, Preview, Development
```

### Optional Variables

#### Email Service (Resend)
```bash
Name: RESEND_API_KEY
Value: re_... (your Resend API key)
Environment: Production
```

#### Payment Gateway (Omise)
```bash
Name: OMISE_PUBLIC_KEY
Value: pkey_... (your Omise public key)
Environment: Production, Preview
```

```bash
Name: OMISE_SECRET_KEY
Value: skey_... (your Omise secret key)
Environment: Production
```

#### Analytics
```bash
Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX (Google Analytics)
Environment: Production
```

```bash
Name: NEXT_PUBLIC_CLARITY_PROJECT_ID
Value: your-clarity-id (Microsoft Clarity)
Environment: Production
```

---

## Step 4: Deploy to Vercel

1. **Click "Deploy"**
   - After adding all environment variables, click "Deploy"
   - Wait 2-5 minutes for build to complete

2. **Check Build Logs**
   - Monitor the deployment logs for any errors
   - Common issues:
     - Missing environment variables
     - Invalid Google credentials JSON format
     - Supabase connection errors

3. **Visit Deployed Site**
   - Once deployed, Vercel provides a URL like: `https://your-app.vercel.app`
   - Test the skin analysis feature to verify Google Vision API works
   - Test authentication flow with Supabase

---

## Step 5: Update Application URL

After first deployment:

1. **Get Your Vercel URL**
   - Copy the production URL from Vercel dashboard

2. **Update Environment Variable**
   - Go to Project Settings → Environment Variables
   - Find `NEXT_PUBLIC_APP_URL`
   - Update value to your Vercel URL: `https://your-app.vercel.app`
   - Click "Save"

3. **Redeploy**
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"

---

## Step 6: Configure Custom Domain (Optional)

1. **Go to Project Settings → Domains**
2. **Add Domain**
   - Enter your domain: `yourdomain.com`
   - Follow Vercel's DNS configuration instructions

3. **Update Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Redeploy

---

## Verification Checklist

After deployment, verify these features:

### Core Features
- [ ] Home page loads correctly
- [ ] User authentication (login/register) works
- [ ] Skin analysis with photo upload works
- [ ] Google Vision API detects faces
- [ ] Analysis results display correctly
- [ ] Dashboard shows user data

### Sales Features
- [ ] Sales wizard loads
- [ ] Presentation mode works offline
- [ ] Offline data syncs when back online
- [ ] PDF export generates correctly

### Realtime Features
- [ ] Chat messages send/receive
- [ ] Queue updates in realtime
- [ ] Notifications display

### API Endpoints
- [ ] `/api/health` returns 200 OK
- [ ] `/api/analyze` processes images
- [ ] `/api/sales/presentation-sessions` saves data
- [ ] `/api/chat/messages` works

---

## Troubleshooting

### Issue: Google Vision API Error "Invalid Credentials"

**Solution:**
1. Check `GOOGLE_CREDENTIALS_JSON` is properly formatted
2. Ensure `\n` characters are preserved in `private_key` field
3. Verify the service account has "Cloud Vision API" enabled
4. Check API key hasn't expired

**Test Credentials:**
```bash
# Test locally first
export GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}'
pnpm dev
# Try skin analysis
```

### Issue: Supabase Connection Error

**Solution:**
1. Verify Supabase URL is correct (should end with `.supabase.co`)
2. Check anon key is valid (starts with `eyJ`)
3. Ensure RLS policies are configured properly
4. Check Supabase project is not paused

### Issue: Build Fails with Module Not Found

**Solution:**
1. Check all dependencies are in `package.json`
2. Run `pnpm install` locally
3. Commit `pnpm-lock.yaml` to git
4. Redeploy

### Issue: API Routes Return 500 Error

**Solution:**
1. Check Vercel Function Logs in dashboard
2. Verify environment variables are set correctly
3. Check API routes don't exceed 30s timeout (configured in `vercel.json`)
4. Ensure database tables exist in Supabase

---

## Monitoring & Maintenance

### Check Deployment Status
```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Check deployment
vercel list

# View logs
vercel logs
```

### Monitor Performance
- **Vercel Analytics**: Project Settings → Analytics
- **Vercel Speed Insights**: Automatic after enabling
- **Error Tracking**: Check Function Logs for errors

### Update Deployment
```bash
# After pushing changes to GitHub
git add .
git commit -m "Update feature"
git push origin main

# Vercel auto-deploys from main branch
```

---

## Security Best Practices

1. **Never commit sensitive keys**
   - ✅ All `.env` files in `.gitignore`
   - ✅ Use Vercel environment variables only

2. **Restrict API Keys**
   - Google Cloud: Restrict by IP/domain
   - Supabase: Enable RLS policies
   - OpenAI: Set usage limits

3. **Enable CORS Protection**
   - Already configured in `vercel.json`
   - Allows only your domain

4. **Regular Updates**
   - Update dependencies: `pnpm update`
   - Check security advisories
   - Monitor Vercel security alerts

---

## Cost Optimization

### Vercel Pricing
- **Hobby (Free)**: 100GB bandwidth/month, unlimited deployments
- **Pro ($20/month)**: 1TB bandwidth, team features, analytics

### API Usage
- **Google Vision**: $1.50 per 1,000 images
- **OpenAI GPT-4**: ~$0.03 per request
- **Supabase**: Free tier: 500MB database, 2GB bandwidth

### Optimization Tips
1. Use Next.js Image Optimization (already configured)
2. Enable ISR (Incremental Static Regeneration) where possible
3. Cache API responses with `revalidate` option
4. Use Edge Functions for frequently accessed routes

---

## Support & Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Google Vision API**: [cloud.google.com/vision/docs](https://cloud.google.com/vision/docs)

---

## Quick Reference: Environment Variables

| Variable | Required | Where to Get |
|----------|----------|--------------|
| `GOOGLE_CREDENTIALS_JSON` | ✅ Yes | Google Cloud Console → Service Account Key (JSON format) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase Dashboard → Project Settings → API (Secret!) |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your Vercel deployment URL |
| `OPENAI_API_KEY` | ✅ Yes | OpenAI Platform → API Keys |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ Yes | Google Cloud Console → APIs & Services → Credentials |
| `NEXT_PUBLIC_ABLY_API_KEY` | ✅ Yes | Ably Dashboard → API Keys |
| `RESEND_API_KEY` | ⚪ Optional | Resend Dashboard → API Keys |
| `OMISE_PUBLIC_KEY` | ⚪ Optional | Omise Dashboard → Keys |
| `OMISE_SECRET_KEY` | ⚪ Optional | Omise Dashboard → Keys |

---

## Completed Setup Checklist

Use this checklist to ensure everything is configured:

- [ ] Google credentials converted to single-line JSON
- [ ] Vercel project created and connected to GitHub
- [ ] All required environment variables set in Vercel
- [ ] First deployment successful
- [ ] `NEXT_PUBLIC_APP_URL` updated with Vercel URL
- [ ] Redeployed after URL update
- [ ] Skin analysis feature tested and working
- [ ] Authentication flow tested
- [ ] Sales wizard tested (online/offline)
- [ ] API endpoints responding correctly
- [ ] Custom domain configured (if applicable)
- [ ] Error monitoring enabled
- [ ] Analytics enabled (optional)

---

## Next Steps

1. **Test Thoroughly**: Test all features on production
2. **Set Up Monitoring**: Enable Vercel Analytics and error tracking
3. **Configure Alerts**: Set up Supabase alerts for database issues
4. **Document API Changes**: Keep this guide updated as you add features
5. **Plan Scaling**: Monitor usage and upgrade plans as needed

---

**🎉 Congratulations! Your Beauty AI application is now live on Vercel!**

For questions or issues, check the troubleshooting section or contact the development team.

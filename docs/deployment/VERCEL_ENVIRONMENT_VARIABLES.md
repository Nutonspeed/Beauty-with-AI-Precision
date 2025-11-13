# Vercel Environment Variables - Quick Setup Guide

## How to Add Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. For each variable below, click **Add New**
4. Enter the **Name** and **Value**
5. Select environment: **Production**, **Preview**, **Development** (select all 3 unless specified)
6. Click **Save**

---

## Required Variables (Must Set All)

### 1. Google Cloud Vision API

```
Name: GOOGLE_CREDENTIALS_JSON
Value: [Single-line JSON from google-credentials.json]
Environments: Production, Preview, Development
```

**How to get the value:**
```powershell
# PowerShell
$json = Get-Content -Path .\google-credentials.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
echo $json
```

**Example format:**
```
{"type":"service_account","project_id":"eminent-goods-476710-t9","private_key_id":"5a698ece...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----\n","client_email":"vision-api-service@eminent-goods-476710-t9.iam.gserviceaccount.com",...}
```

⚠️ **Important**: Keep the `\n` characters inside `private_key` field!

---

### 2. Supabase Configuration

#### Supabase URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environments: Production, Preview, Development
```
**Where to find**: Supabase Dashboard → Project Settings → API → Project URL

#### Supabase Anon Key (Public)
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: Production, Preview, Development
```
**Where to find**: Supabase Dashboard → Project Settings → API → anon public key

#### Supabase Service Role Key (Secret)
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: Production only
```
**Where to find**: Supabase Dashboard → Project Settings → API → service_role secret key

⚠️ **Security**: Only set service role key for Production, not Preview/Development!

---

### 3. Application URL

```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-app.vercel.app
Environments: Production, Preview, Development
```

**Note**: 
- First deployment: Use temporary Vercel URL
- After deployment: Update with your actual production URL
- Then redeploy for changes to take effect

---

### 4. OpenAI API

```
Name: OPENAI_API_KEY
Value: sk-proj-...
Environments: Production, Preview, Development
```
**Where to find**: [OpenAI Platform](https://platform.openai.com/api-keys) → API Keys

---

### 5. Google Maps API

```
Name: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIzaSy...
Environments: Production, Preview, Development
```
**Where to find**: Google Cloud Console → APIs & Services → Credentials

**Required APIs to enable:**
- Maps JavaScript API
- Places API
- Geocoding API

---

### 6. Ably Realtime (Chat/Notifications)

```
Name: NEXT_PUBLIC_ABLY_API_KEY
Value: your-ably-api-key
Environments: Production, Preview, Development
```
**Where to find**: [Ably Dashboard](https://ably.com/dashboard) → API Keys

---

## Optional Variables

### Email Service (Resend)

```
Name: RESEND_API_KEY
Value: re_...
Environments: Production
```
**Where to find**: [Resend Dashboard](https://resend.com/api-keys)

---

### Payment Gateway (Omise)

#### Omise Public Key
```
Name: OMISE_PUBLIC_KEY
Value: pkey_test_... (test) or pkey_... (live)
Environments: Production, Preview
```

#### Omise Secret Key
```
Name: OMISE_SECRET_KEY
Value: skey_test_... (test) or skey_... (live)
Environments: Production only
```
**Where to find**: [Omise Dashboard](https://dashboard.omise.co/) → Keys

---

### UploadThing (File Uploads)

#### UploadThing Secret
```
Name: UPLOADTHING_SECRET
Value: sk_live_...
Environments: Production
```

#### UploadThing App ID
```
Name: UPLOADTHING_APP_ID
Value: your-app-id
Environments: Production, Preview
```
**Where to find**: [UploadThing Dashboard](https://uploadthing.com/dashboard)

---

### Analytics

#### Google Analytics
```
Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX
Environments: Production
```
**Where to find**: Google Analytics → Admin → Data Streams → Measurement ID

#### Microsoft Clarity
```
Name: NEXT_PUBLIC_CLARITY_PROJECT_ID
Value: your-clarity-id
Environments: Production
```
**Where to find**: [Microsoft Clarity](https://clarity.microsoft.com/) → Project Settings

---

## Verification Checklist

After adding all variables:

### Required Variables (Must Complete)
- [ ] `GOOGLE_CREDENTIALS_JSON` - Single-line JSON format
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Should end with `.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Starts with `eyJ`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Starts with `eyJ` (Production only)
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel URL
- [ ] `OPENAI_API_KEY` - Starts with `sk-`
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Starts with `AIza`
- [ ] `NEXT_PUBLIC_ABLY_API_KEY` - Your Ably API key

### Optional Variables
- [ ] `RESEND_API_KEY` (if using email features)
- [ ] `OMISE_PUBLIC_KEY` + `OMISE_SECRET_KEY` (if using payments)
- [ ] `UPLOADTHING_SECRET` + `UPLOADTHING_APP_ID` (if using file uploads)
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` (if using Google Analytics)
- [ ] `NEXT_PUBLIC_CLARITY_PROJECT_ID` (if using Microsoft Clarity)

---

## Common Issues & Solutions

### Issue 1: Google Vision API "Invalid Credentials"
**Cause**: JSON format is incorrect or has line breaks

**Solution**:
```powershell
# Test locally first
$env:GOOGLE_CREDENTIALS_JSON = (Get-Content -Path .\google-credentials.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress)
pnpm dev
# Try skin analysis feature
```

### Issue 2: Supabase "Invalid API Key"
**Cause**: Wrong key or missing key

**Solution**:
1. Copy key again from Supabase Dashboard
2. Make sure you're copying the full key (it's long!)
3. Verify no extra spaces at the beginning/end
4. Check you're using the correct project

### Issue 3: "NEXT_PUBLIC_APP_URL is not defined"
**Cause**: Variable not set or deployment needs restart

**Solution**:
1. Add the variable in Vercel dashboard
2. Click **Deployments** → **...** → **Redeploy**

---

## Testing Environment Variables

### Test in Vercel Preview
1. Create a new branch: `git checkout -b test-env`
2. Make a small change and push
3. Vercel creates a preview deployment
4. Test all features in preview URL
5. If everything works, merge to main

### Test Locally
```powershell
# Copy production values to .env.local
# Then test locally
pnpm dev

# Test specific features:
# - Skin analysis (Google Vision)
# - Login (Supabase Auth)
# - Chat (Ably Realtime)
# - Maps (Google Maps)
```

---

## Security Best Practices

1. **Never expose secret keys in client code**
   - Variables starting with `NEXT_PUBLIC_` are exposed to browser
   - Keep secret keys (service role, API secrets) without `NEXT_PUBLIC_` prefix

2. **Restrict API keys by domain**
   - Google Maps: Add domain restrictions in Google Cloud Console
   - Google Vision: Restrict by IP or domain
   - Supabase: Enable RLS (Row Level Security) policies

3. **Use different keys for development and production**
   - Use test keys for Preview deployments
   - Use production keys only for Production environment

4. **Rotate keys regularly**
   - Change API keys every 3-6 months
   - Immediately rotate if exposed or compromised
   - Update in Vercel after rotation

---

## Quick Copy Template

Copy this and fill in your values:

```bash
# Required
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_ABLY_API_KEY=...

# Optional
RESEND_API_KEY=re_...
OMISE_PUBLIC_KEY=pkey_...
OMISE_SECRET_KEY=skey_...
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_CLARITY_PROJECT_ID=...
```

---

## Support

If you encounter issues:

1. Check Vercel Function Logs: Project → Logs
2. Check Supabase Logs: Supabase Dashboard → Database → Logs
3. Test API endpoints: `https://your-app.vercel.app/api/health`
4. Verify environment variables are set correctly in Vercel dashboard

---

**Last Updated**: After setting up all environment variables, proceed to deploy!
